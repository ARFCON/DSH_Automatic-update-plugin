/**
 * dsh-hub — host half.
 *
 * 整合插件中枢，替换 dsh-plugin-updates + dsh-memory：
 *  1. 全局记忆（原 dsh-memory 的 5 个 memory_* 工具，数据路径不变）
 *  2. graph-memory 检测与自动装配（plugin-src 有源码且未装配时，自动写入
 *     profile bundle + link + junction；已装配则只读状态与 SQLite 统计）
 *  3. dsh-market（dshmarket）检测：已装 → 状态；未装 → 设置页提醒安装
 *  4. 自身更新检查：读 GitHub 仓库 package.json 的 version 对比本地版本
 *     （raw.githubusercontent + jsDelivr CDN 双源，规避 GitHub API 限流 403）
 *
 * Remote 服务 `dshHub` 暴露给客户端设置页：
 *   - status():             总览（记忆 / graph-memory / dsh-market / 自身更新）
 *   - mountGraphMemory():   手动触发 graph-memory 装配（幂等）
 *   - checkUpdate():        立即检查自身更新
 *
 * 每次宿主进程启动自动执行：graph-memory 自动装配检查 + 自身更新检查。
 *
 * 维护铁律（沿用 dsh-plugin-updates 手册）：
 *  - 新增 Remote 方法必须同步三处：本文件 methods 数组、lib/typert.js、
 *    lib/client.js 的 REMOTE.descriptors；
 *  - profile package.json / cordis.patch.yml 一律经 writeTextSafe() 原子写入；
 *  - 不改动 graph-memory 与 dsh-market 本体：只做检测、装配与展示（挂载）。
 */
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, symlinkSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { memoryTools, loadRecords, memoryPath } from './memory-core.js'

export const name = 'dsh-hub'
export const inject = ['tools']

const PROFILE_NAME = 'web'
/** 自身更新检查的 GitHub 仓库（沿用 ARFCON/DSH_Automatic-update-plugin）。 */
const UPDATE_REPO = 'ARFCON/DSH_Automatic-update-plugin'
const UPDATE_SOURCES = [
  `https://raw.githubusercontent.com/${UPDATE_REPO}/main/package.json`,
  `https://cdn.jsdelivr.net/gh/${UPDATE_REPO}@main/package.json`,
]
const UPDATE_CACHE_STALE_MS = 6 * 60 * 60 * 1000 // 更新检查结果 6 小时内复用
const START_DELAY_MS = 1500                        // 启动后稍等再跑后台任务
const FETCH_TIMEOUT_MS = 10 * 1000                 // 单次版本查询超时
const GRAPH_MEMORY_PKG = 'graph-memory'
const MARKET_PKG = 'dshmarket'

//#region 路径与读写
/** DSH 数据根：优先 $DSH_HOME，回退 ~/.dsh。 */
function dshHome() {
  const env = process.env.DSH_HOME
  if (typeof env === 'string' && env.trim() !== '') return env.trim().replace(/[\\/]+$/, '')
  return path.join(os.homedir(), '.dsh')
}

function profileDir() {
  return path.join(dshHome(), 'profiles', PROFILE_NAME)
}

function manifestPath() {
  return path.join(profileDir(), 'package.json')
}

function gmSourceDir() {
  return path.join(dshHome(), 'plugin-src', GRAPH_MEMORY_PKG)
}

function gmDbPath() {
  return path.join(dshHome(), 'graph-memory', 'graph-memory.db')
}

function readJson(p) {
  try {
    return JSON.parse(readFileSync(p, 'utf8'))
  } catch {
    return null
  }
}

function manifestOf() {
  return readJson(manifestPath()) ?? {}
}

/** 红线⑤：profile 配置一律原子写入（同目录 .tmp + rename，不落半截文件）。 */
export function writeTextSafe(p, text) {
  const tmp = `${p}.tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  writeFileSync(tmp, text, 'utf8')
  renameSync(tmp, p)
}

function writeJsonSafe(p, obj) {
  writeTextSafe(p, JSON.stringify(obj, null, 2) + '\n')
}

function selfVersion() {
  try {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
    return typeof pkg.version === 'string' && pkg.version ? pkg.version : '0.0.0'
  } catch {
    return '0.0.0'
  }
}
//#endregion

//#region graph-memory 检测 / 装配 / 统计
function gmSourceStatus() {
  const pkgPath = path.join(gmSourceDir(), 'package.json')
  if (!existsSync(pkgPath)) return { present: false }
  const meta = readJson(pkgPath)
  return { present: true, version: meta?.version ?? null, dir: gmSourceDir() }
}

function gmInstalledStatus() {
  const manifest = manifestOf()
  const bundles = Array.isArray(manifest.dsh?.profile?.bundles) ? manifest.dsh.profile.bundles : []
  const inBundles = bundles.includes(GRAPH_MEMORY_PKG)
  const dep = manifest.dependencies?.[GRAPH_MEMORY_PKG]
  const linked = typeof dep === 'string' && dep.startsWith('link:')
  const nodeModules = existsSync(path.join(profileDir(), 'node_modules', GRAPH_MEMORY_PKG))
  return { inBundles, linked, nodeModules, installed: inBundles && linked && nodeModules }
}

/** 读 graph-memory SQLite 统计（node:sqlite 只读打开，不依赖 graph-memory 本体）。 */
function gmDbStats() {
  const p = gmDbPath()
  if (!existsSync(p)) return null
  let db = null
  try {
    db = new DatabaseSync(p, { readOnly: true })
    const one = (sql) => {
      try {
        const row = db.prepare(sql).get()
        const value = row?.c ?? row?.['COUNT(*)'] ?? 0
        return Number(value)
      } catch {
        return null
      }
    }
    return {
      nodes: one("SELECT COUNT(*) AS c FROM gm_nodes WHERE status='active'"),
      edges: one('SELECT COUNT(*) AS c FROM gm_edges'),
      communities: one('SELECT COUNT(DISTINCT community_id) AS c FROM gm_nodes WHERE status=\'active\' AND community_id IS NOT NULL'),
      dbSize: statSync(p).size,
    }
  } catch {
    return null
  } finally {
    try { db?.close() } catch { /* 已损坏时忽略 */ }
  }
}

/**
 * 自动装配 graph-memory（幂等）：
 *  plugin-src 有源码但 profile 未装配 → 原子写 bundles + dependencies link，
 *  再建 node_modules junction；已装配则直接返回 already。
 */
export function mountGraphMemoryLocked() {
  const src = gmSourceStatus()
  if (!src.present) {
    return { ok: false, reason: 'missing-source', message: '未找到 graph-memory 源码（plugin-src/graph-memory 不存在）' }
  }
  const current = gmInstalledStatus()
  if (current.installed) {
    return { ok: true, already: true, restartNeeded: false, source: src.version ?? null }
  }
  const manifest = manifestOf()
  manifest.dependencies ??= {}
  manifest.dependencies[GRAPH_MEMORY_PKG] = `link:${gmSourceDir().replace(/\\/g, '/')}`
  manifest.dsh ??= {}
  manifest.dsh.profile ??= {}
  manifest.dsh.profile.bundles ??= []
  if (!manifest.dsh.profile.bundles.includes(GRAPH_MEMORY_PKG)) {
    manifest.dsh.profile.bundles.push(GRAPH_MEMORY_PKG)
  }
  writeJsonSafe(manifestPath(), manifest)
  const linkPath = path.join(profileDir(), 'node_modules', GRAPH_MEMORY_PKG)
  if (!existsSync(linkPath)) {
    mkdirSync(path.dirname(linkPath), { recursive: true })
    symlinkSync(gmSourceDir(), linkPath, 'junction')
  }
  return { ok: true, already: false, restartNeeded: true, source: src.version ?? null }
}
//#endregion

//#region dsh-market 检测
function dshMarketStatus() {
  const manifest = manifestOf()
  const bundles = Array.isArray(manifest.dsh?.profile?.bundles) ? manifest.dsh.profile.bundles : []
  const inBundles = bundles.includes(MARKET_PKG)
  const pkgPath = path.join(profileDir(), 'node_modules', MARKET_PKG, 'package.json')
  const pkg = existsSync(pkgPath) ? readJson(pkgPath) : null
  const srcPkgPath = path.join(dshHome(), 'plugin-src', MARKET_PKG, 'package.json')
  const srcPkg = existsSync(srcPkgPath) ? readJson(srcPkgPath) : null
  const version = pkg?.version ?? srcPkg?.version ?? null
  return {
    installed: inBundles || pkg !== null,
    version,
    inBundles,
    nodeModules: pkg !== null,
    installHint: `dsh plugin --profile web add ${MARKET_PKG}`,
    repo: 'https://github.com/dsh-market/dsh-market',
  }
}
//#endregion

//#region 自身更新检查
function hasNewerVersion(latest, current) {
  if (typeof latest !== 'string' || typeof current !== 'string') return false
  const a = latest.split(/[^\d]+/).map(Number)
  const b = current.split(/[^\d]+/).map(Number)
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const x = a[i] ?? 0
    const y = b[i] ?? 0
    if (x !== y) return x > y
  }
  return false
}

let updateCache = { checkedAt: 0, latest: null, current: null, hasUpdate: false, error: null }

async function fetchLatestVersion() {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS)
  try {
    for (const url of UPDATE_SOURCES) {
      try {
        const res = await fetch(url, {
          signal: ctrl.signal,
          headers: { 'User-Agent': 'dsh-hub/update-check', Accept: 'application/json' },
        })
        if (!res.ok) continue
        const data = await res.json()
        if (data && typeof data.version === 'string' && data.version.trim() !== '') {
          return data.version.trim()
        }
      } catch {
        // 换下一个源
      }
    }
    throw new Error('无法从 GitHub 读取版本信息（raw + jsDelivr 均失败）')
  } finally {
    clearTimeout(timer)
  }
}

/** 立即检查自身更新并写缓存（去重）。 */
export async function checkUpdateLocked() {
  const current = selfVersion()
  try {
    const latest = await fetchLatestVersion()
    updateCache = { checkedAt: Date.now(), latest, current, hasUpdate: hasNewerVersion(latest, current), error: null }
  } catch (error) {
    updateCache = { checkedAt: Date.now(), latest: null, current, hasUpdate: false, error: String((error && error.message) || error) }
  }
  return updateCache
}
//#endregion

//#region Remote 网关
class HubGateway extends TypertRemoteService {
  /** 最近一次自动/手动装配结果（供 status() 展示）。 */
  mountResult = null

  constructor(ctx) {
    super(ctx, 'dshHub')
    // 不用装饰器语法：运行时给实例方法打 Remote 标记（与内置市场同法）。
    // 新增 Remote 方法时需同步三处：本列表、lib/typert.js 的 invocations、lib/client.js 的 REMOTE.descriptors。
    const methods = ['status', 'mountGraphMemory', 'checkUpdate']
    for (const method of methods) {
      const decorator = Remote(method)
      decorator(HubGateway.prototype[method], {
        name: method,
        private: false,
        static: false,
        addInitializer: (initializer) => initializer.call(this),
      })
    }
    // 每次宿主启动：自动装配 graph-memory（若源码存在且未装配）+ 检查自身更新。
    const timer = setTimeout(() => {
      this.startup().catch(() => {})
    }, START_DELAY_MS)
    if (typeof timer.unref === 'function') timer.unref()
  }

  async startup() {
    try {
      const mount = mountGraphMemoryLocked()
      if (!mount.already) this.mountResult = mount
    } catch (error) {
      this.mountResult = { ok: false, reason: 'mount-failed', message: String((error && error.message) || error) }
    }
    try {
      if (Date.now() - Number(updateCache.checkedAt ?? 0) > UPDATE_CACHE_STALE_MS) {
        await checkUpdateLocked()
      }
    } catch {
      // 更新检查失败不影响插件其余功能
    }
  }

  /** 设置页总览：记忆 / graph-memory / dsh-market / 自身更新。 */
  async status() {
    let records = 0
    try {
      records = (await loadRecords()).length
    } catch {
      records = -1
    }
    return {
      self: { name: 'dsh-hub', version: selfVersion() },
      memory: { records, file: memoryPath() },
      graphMemory: {
        source: gmSourceStatus(),
        installed: gmInstalledStatus(),
        db: gmDbStats(),
        mountResult: this.mountResult,
      },
      dshMarket: dshMarketStatus(),
      update: updateCache,
    }
  }

  /** 手动触发 graph-memory 装配（幂等；返回 restartNeeded 供客户端提示）。 */
  async mountGraphMemory() {
    try {
      const result = mountGraphMemoryLocked()
      if (!result.already) this.mountResult = result
      return result
    } catch (error) {
      const result = { ok: false, reason: 'mount-failed', message: String((error && error.message) || error) }
      this.mountResult = result
      return result
    }
  }

  /** 立即检查自身更新。 */
  async checkUpdate() {
    return checkUpdateLocked()
  }
}
//#endregion

export function apply(ctx) {
  ctx.effect(() => {
    const disposers = memoryTools.map((tool) => ctx.tools.register(tool))
    return () => {
      for (const dispose of disposers) dispose()
    }
  }, 'dsh-hub: memory tools')
  // 注册 Remote 网关（构造时启动后台任务）。
  new HubGateway(ctx)
}

export { HubGateway, hasNewerVersion }
export default HubGateway
