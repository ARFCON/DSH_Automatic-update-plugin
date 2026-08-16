/**
 * dsh-plugin-updates — host half.
 *
 * 在 web 服务的宿主进程里运行，向浏览器设置页暴露 `pluginUpdates` Remote：
 *   - status():     读取最近一次更新检查缓存（无缓存时触发后台检查）
 *   - checkNow():   立刻重新检查所有已安装插件的最新版本
 *   - update(name): 把某个 registry 插件更新到最新版
 *   - uninstall(name): 卸载某个插件并清理激活状态
 *
 * 每次宿主进程启动（= 每次 dsh web 启动）都会自动在后台执行一次更新检查，
 * 结果写入 <profile>/.plugin-updates.json，浏览器打开设置页时先读缓存，
 * 再后台刷新，保证"每次启动时检查更新"且打开页面不卡顿。
 *
 * 与内置"插件市场"的职责分工：市场负责搜索/安装/卸载；本插件负责
 * 版本对比、更新检查和一键更新（卸载也保留一份，方便在一个页面完成）。
 */
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { spawn, spawnSync } from 'node:child_process'
import {
  cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync,
} from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'

const PROFILE_NAME = 'web'
const CACHE_FILE = '.plugin-updates.json'
const CACHE_STALE_MS = 12 * 60 * 60 * 1000 // 缓存超过 12 小时视为过期
const CHECK_START_DELAY_MS = 1500          // 启动后稍等再检查，不挤占启动
const VIEW_TIMEOUT_MS = 20 * 1000          // 单包查最新版本超时
const MUTATE_TIMEOUT_MS = 5 * 60 * 1000    // 更新/卸载超时
const GITHUB_TIMEOUT_MS = 15 * 1000        // 单仓库查最新 release/tag 超时
const DOWNLOAD_TIMEOUT_MS = 120 * 1000     // 镜像下载源码包超时
const OUTPUT_CAP = 65536
const LATEST_CONCURRENCY = 4
const GITHUB_CONCURRENCY = 2
const GITHUB_CACHE_TTL_MS = 10 * 60 * 1000
const DESKTOP_CONCURRENCY = 4

/** 国内 GitHub 镜像（按顺序尝试，ghfast.top 实测可用）。 */
const GITHUB_MIRRORS = [
  'https://ghfast.top/',
  'https://gh-proxy.com/',
  'https://ghproxy.net/',
]

/** DSH Desktop 安装目录候选（Electron 解包应用）。 */
const DESKTOP_APP_DIRS = [
  join(process.env.LOCALAPPDATA || '', 'Programs', 'DSH Desktop', 'resources', 'app'),
  'C:\\Users\\OwO\\AppData\\Local\\Programs\\DSH Desktop\\resources\\app',
]

/** 宿主目录：优先 $DSH_HOME，回退 ~/.dsh（与 dsh 自身一致）。 */
function homeDir() {
  const env = typeof process.env.DSH_HOME === 'string' ? process.env.DSH_HOME.trim() : ''
  return env !== '' ? env.replace(/[\\/]+$/, '') : join(homedir(), '.dsh')
}

function profileDir() {
  return join(homeDir(), 'profiles', PROFILE_NAME)
}

function manifestPath() {
  return join(profileDir(), 'package.json')
}

function patchPath() {
  return join(profileDir(), 'cordis.patch.yml')
}

function cachePath() {
  return join(profileDir(), CACHE_FILE)
}

/** profile 里已安装包的解析目录（scoped 包按 / 拆开）。 */
function packageDir(name) {
  return join(profileDir(), 'node_modules', ...name.split('/'))
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return null
  }
}

function writeJson(path, value) {
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n', 'utf8')
}

/** 跑一个 pnpm/npm/curl 命令（在 profile 目录），收集受限输出。 */
function runCli(command, args, timeoutMs, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: profileDir(),
      env: process.env,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: options.shell ?? process.platform === 'win32',
    })
    const out = { stdout: '', stderr: '' }
    const feed = (key) => (chunk) => {
      const text = chunk.toString()
      const keep = OUTPUT_CAP - out[key].length
      if (keep > 0) out[key] += text.slice(0, keep)
    }
    child.stdout.on('data', feed('stdout'))
    child.stderr.on('data', feed('stderr'))
    let settled = false
    const settle = (value) => {
      if (!settled) {
        settled = true
        resolve(value)
      }
    }
    const timer = setTimeout(() => {
      try { child.kill() } catch {}
      settle({ code: null, stdout: out.stdout, stderr: out.stderr, timedOut: true, error: '命令执行超时' })
    }, timeoutMs)
    child.on('error', (error) => {
      clearTimeout(timer)
      settle({ code: null, stdout: out.stdout, stderr: out.stderr, error: String((error && error.message) || error) })
    })
    child.on('exit', (code) => {
      clearTimeout(timer)
      settle({ code, stdout: out.stdout, stderr: out.stderr })
    })
  })
}

function runPnpm(args) {
  return runCli('pnpm', args, MUTATE_TIMEOUT_MS)
}

function cliFailure(run, verb) {
  return (run.error || run.stderr || run.stdout || `pnpm ${verb} 失败 (exit ${run.code})`).trim().slice(0, 800)
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** pnpm 在 Windows 上偶发非零退出但操作实际成功：最多重试一次，以最终状态为准。 */
async function runMutate(args) {
  let run = await runPnpm(args)
  if (run.code !== 0) {
    await sleep(800)
    run = await runPnpm(args)
  }
  return run
}

/** 依赖规格分类：本地链接 / git 源 / registry。 */
function classifySpec(spec) {
  const text = String(spec ?? '').trim()
  if (/^(?:link|file):/i.test(text) || /^\.{1,2}(?:[\\/]|$)/.test(text)) return 'local'
  if (/^(?:github:|git\+|git:|https?:\/\/)/i.test(text)) return 'git'
  return 'registry'
}

// --- GitHub 来源识别（本地 link 插件：repository 字段 / .git/config） ---

/** 从一个 URL/规格字符串里解析 owner/repo（支持常见 GitHub 形式）。 */
function parseGithubOwnerRepo(value) {
  const text = String(value ?? '').trim()
  if (!text) return null
  // 形式一：github.com/owner/repo 或 git@github.com:owner/repo
  let match = text.match(/github\.com[/:]([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?(?:[#/]|$)/i)
  // 形式二：github:owner/repo 或 owner/repo（但不能把 github.com 本身当 owner）
  if (!match) match = text.match(/^(?!github\.com[/:])(?:github:)?([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?(?:[#/]|$)/i)
  if (!match) return null
  const [, owner, repo] = match
  if (!owner || !repo || owner.toLowerCase() === 'github.com' || repo.includes('..')) return null
  return { owner, repo }
}

/** 从 .git/config 里解析 [remote "origin"] 的 url。 */
function originFromGitConfig(realDir) {
  const p = join(realDir, '.git', 'config')
  let text
  try {
    text = readFileSync(p, 'utf8')
  } catch {
    return null
  }
  const remote = text.match(/\[remote\s+"([^"]+)"\][\s\S]*?url\s*=\s*(\S+)/)
  if (!remote) return null
  const url = remote[2]
  if (!/github\.com/i.test(url)) return null
  return parseGithubOwnerRepo(url)
}

/**
 * 识别一个本地 link 插件对应的 GitHub 仓库。
 * 顺序：package.json repository → homepage/bugs → 源码目录 .git/config 的 origin。
 * @returns {{ owner, repo } | null}
 */
function resolveGithubRepo(name) {
  let pkgPath = join(packageDir(name), 'package.json')
  const pkg = readJson(pkgPath) ?? {}
  let realDir = null
  try {
    realDir = realpathSync(packageDir(name))
    pkgPath = join(realDir, 'package.json')
  } catch {
    // 目录不存在/不是链接时退回 node_modules 相对路径
  }
  const fresh = realDir !== null ? (readJson(pkgPath) ?? pkg) : pkg

  const candidates = []
  if (fresh.repository && typeof fresh.repository === 'object') candidates.push(fresh.repository.url)
  if (fresh.repository && typeof fresh.repository === 'string') candidates.push(fresh.repository)
  if (typeof fresh.homepage === 'string') candidates.push(fresh.homepage)
  if (fresh.bugs && typeof fresh.bugs === 'object' && typeof fresh.bugs.url === 'string') candidates.push(fresh.bugs.url)
  for (const value of candidates) {
    if (!/github\.com/i.test(String(value ?? ''))) continue
    const parsed = parseGithubOwnerRepo(value)
    if (parsed) return parsed
  }
  if (realDir !== null) {
    const fromGit = originFromGitConfig(realDir)
    if (fromGit) return fromGit
  }
  return null
}

/** 去掉版本号前导 v，只用于判断是否有更新；显示时保留原样。 */
function stripLeadingV(value) {
  return String(value ?? '').replace(/^[vV]/, '')
}

/** 规范化版本：主.次.修订 缺位补 0；带预发布/构建元数据时保留字符串部分。 */
function normalizeVersion(value) {
  const text = stripLeadingV(value).trim()
  const match = text.match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?([-+].*)?$/)
  if (!match) return text
  const [, major, minor = '0', patch = '0', suffix = ''] = match
  return `${major}.${minor}.${patch}${suffix}`
}

/** 解析版本为 [数字三元组, suffix]；非数字版本返回 null。 */
function parseVersion(value) {
  const text = stripLeadingV(value).trim()
  const match = text.match(/^(\d+)\.(\d+)\.(\d+)([-+].*)?$/)
  if (!match) return null
  return {
    nums: [Number(match[1]), Number(match[2]), Number(match[3])],
    suffix: match[4] ?? '',
  }
}

/**
 * 比较两个版本：-1 = a < b，0 = 相等，1 = a > b。
 * 缺位补 0；预发布（-xxx）低于正式版；构建元数据（+xxx）忽略。
 */
function versionCompare(a, b) {
  const pa = parseVersion(a)
  const pb = parseVersion(b)
  if (pa === null || pb === null) {
    const na = normalizeVersion(a)
    const nb = normalizeVersion(b)
    return na < nb ? -1 : na > nb ? 1 : 0
  }
  for (let i = 0; i < 3; i++) {
    if (pa.nums[i] !== pb.nums[i]) return pa.nums[i] < pb.nums[i] ? -1 : 1
  }
  const aPre = pa.suffix.startsWith('-')
  const bPre = pb.suffix.startsWith('-')
  if (aPre !== bPre) return aPre ? -1 : 1
  if (!aPre && !bPre) return 0 // 两个都是 build metadata，忽略
  if (pa.suffix === pb.suffix) return 0
  return pa.suffix < pb.suffix ? -1 : 1
}

/** 判断两个版本是否等价：去 v、补位后再比较（semver 友好）。 */
function versionsEqual(a, b) {
  return versionCompare(a, b) === 0
}

/** latest 是否严格大于 current（有真正的新版本）。 */
function hasNewerVersion(latest, current) {
  return latest !== null && versionCompare(latest, current) > 0
}

// --- GitHub 最新版本查询（release 优先，无 release 回退最新 tag） ---

/** 用 Windows 自带 curl.exe 请求 HTTPS（Node fetch 在本机证书链会失败）。 */
async function runCurl(url, timeoutMs) {
  return runCli('curl.exe', ['-sS', '-f', '--ssl-no-revoke', '--max-time', String(Math.ceil(timeoutMs / 1000)), '-H', 'User-Agent: dsh-plugin-updates', '-H', 'Accept: application/vnd.github+json', url], timeoutMs, { shell: false })
}

/** 进程内 GitHub 查询缓存（成功/失败都缓存，避免 60 req/h 匿名限流）。 */
const githubCache = new Map()

async function queryGithubTag(owner, repo) {
  const key = `${owner}/${repo}`
  const hit = githubCache.get(key)
  if (hit && Date.now() - hit.at < GITHUB_CACHE_TTL_MS) return hit.value
  const value = await (async () => {
    try {
      const release = await runCurl(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, GITHUB_TIMEOUT_MS)
      if (release.code === 0) {
        const data = JSON.parse(release.stdout)
        if (typeof data.tag_name === 'string' && data.tag_name !== '') {
          return { tag: data.tag_name, hasRelease: true }
        }
      }
      const tags = await runCurl(`https://api.github.com/repos/${owner}/${repo}/tags?per_page=1`, GITHUB_TIMEOUT_MS)
      if (tags.code === 0) {
        const list = JSON.parse(tags.stdout)
        if (Array.isArray(list) && list.length > 0 && typeof list[0].name === 'string' && list[0].name !== '') {
          return { tag: list[0].name, hasRelease: false }
        }
      }
    } catch {
      // 网络失败或 JSON 解析失败：当作查不到，不拖垮整次检查
    }
    return null
  })()
  githubCache.set(key, { at: Date.now(), value })
  return value
}

/** 当前已安装（profile package.json dependencies）的插件快照。 */
function depsSnapshot() {
  const manifest = readJson(manifestPath()) ?? {}
  const dependencies = manifest.dependencies ?? {}
  const bundles = manifest.dsh?.profile?.bundles ?? []
  return Object.keys(dependencies).map((name) => {
    const pkg = readJson(join(packageDir(name), 'package.json')) ?? {}
    return {
      name,
      spec: String(dependencies[name] ?? ''),
      source: classifySpec(dependencies[name] ?? ''),
      current: typeof pkg.version === 'string' ? pkg.version : '',
      isBundle: pkg.dsh?.bundle?.patch !== undefined,
      inBundles: bundles.includes(name),
    }
  })
}

/** 用 npm view 查一个包的 registry 最新版本；查不到（未发布/私有）返回 null。 */
async function queryLatest(name) {
  const run = await runCli('npm', ['view', name, 'version'], VIEW_TIMEOUT_MS)
  if (run.code !== 0) return null
  const lines = String(run.stdout ?? '').trim().split(/\r?\n/)
  const match = lines[lines.length - 1].trim().match(/^v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)/)
  return match ? match[1] : null
}

/** 并发受限地为所有 registry 依赖查 npm 最新版本。 */
async function collectNpmLatest(deps) {
  const targets = deps.filter((dep) => dep.source === 'registry')
  const found = new Map()
  let cursor = 0
  const workers = Array.from({ length: Math.min(LATEST_CONCURRENCY, Math.max(1, targets.length)) }, async () => {
    while (true) {
      const index = cursor++
      if (index >= targets.length) return
      const name = targets[index].name
      try {
        const latest = await queryLatest(name)
        if (latest !== null) found.set(name, latest)
      } catch {
        // 单包查询失败不拖垮整次检查
      }
    }
  })
  await Promise.all(workers)
  return found
}

/** 并发受限地为可识别 GitHub 来源的本地 link 插件查最新 release/tag。 */
async function collectGithubTags(deps) {
  const targets = deps
    .filter((dep) => dep.source === 'local')
    .map((dep) => ({ dep, repo: resolveGithubRepo(dep.name) }))
    .filter((item) => item.repo !== null)
  const found = new Map()
  let cursor = 0
  const workers = Array.from({ length: Math.min(GITHUB_CONCURRENCY, Math.max(1, targets.length)) }, async () => {
    while (true) {
      const index = cursor++
      if (index >= targets.length) return
      const { dep, repo } = targets[index]
      try {
        const value = await queryGithubTag(repo.owner, repo.repo)
        found.set(dep.name, { repo, value })
      } catch {
        // 单仓库失败不拖垮整次检查
      }
    }
  })
  await Promise.all(workers)
  return found
}

/** 找到本机 DSH Desktop 应用的解包目录（找不到返回 null）。 */
function desktopAppDir() {
  for (const dir of DESKTOP_APP_DIRS) {
    if (existsSync(join(dir, 'package.json'))) return dir
  }
  return null
}

/** 扫描 DSH Desktop 内置 @deepseek-ai 核心包，与 npm 最新版对比（只读检查）。 */
async function collectDesktopCheck() {
  const appDir = desktopAppDir()
  if (appDir === null) return null
  const appManifest = readJson(join(appDir, 'package.json'))
  if (!appManifest) return null
  const declared = appManifest.dependencies ?? {}
  const scoped = Object.keys(declared)
    .filter((name) => name.startsWith('@deepseek-ai/'))
    .sort()
  const packages = scoped
    .map((name) => {
      const pkg = readJson(join(appDir, 'node_modules', ...name.split('/'), 'package.json')) ?? {}
      return {
        name,
        current: typeof pkg.version === 'string' ? pkg.version : String(declared[name] ?? '').replace(/^[\^~]/, ''),
      }
    })
    .filter((entry) => entry.current !== '')
  const found = new Map()
  let cursor = 0
  const workers = Array.from({ length: Math.min(DESKTOP_CONCURRENCY, Math.max(1, packages.length)) }, async () => {
    while (true) {
      const index = cursor++
      if (index >= packages.length) return
      const entry = packages[index]
      try {
        const latest = await queryLatest(entry.name)
        found.set(entry.name, latest)
      } catch {
        // 单个失败不拖垮
      }
    }
  })
  await Promise.all(workers)
  return {
    appName: appManifest.productName || appManifest.name || 'dsh-desktop',
    appVersion: typeof appManifest.version === 'string' ? appManifest.version : '',
    packages: packages.map((entry) => {
      const latest = found.get(entry.name) ?? null
      return {
        ...entry,
        latest,
        updateable: hasNewerVersion(latest, entry.current),
      }
    }),
  }
}

/** 完整执行一次检查，返回可序列化的结果。 */
async function collectCheck() {
  const deps = depsSnapshot()
  const npmMap = await collectNpmLatest(deps)
  const githubMap = await collectGithubTags(deps)
  const desktop = await collectDesktopCheck()
  const entries = deps.map((dep) => {
    if (dep.source === 'registry') {
      const latest = npmMap.get(dep.name) ?? null
      return {
        ...dep,
        latest,
        updateable: hasNewerVersion(latest, dep.current),
      }
    }
    if (dep.source === 'local') {
      const github = githubMap.get(dep.name)
      const repo = github?.repo ?? null
      const tag = github?.value?.tag ?? null
      const hasRelease = github?.value?.hasRelease ?? false
      const latest = tag
      return {
        ...dep,
        latest,
        updateable: hasNewerVersion(tag, dep.current),
        github: repo === null ? null : {
          owner: repo.owner,
          repo: repo.repo,
          latestTag: tag,
          htmlUrl: `https://github.com/${repo.owner}/${repo.repo}`,
          updateUrl: `https://github.com/${repo.owner}/${repo.repo}/${hasRelease ? 'releases/latest' : 'tags'}`,
        },
      }
    }
    // git 源依赖（github:owner/repo#branch）：保持手动更新，后续可扩展
    return { ...dep, latest: null, updateable: false }
  })
  return { checkedAt: Date.now(), entries, desktop }
}

/** 用 curl 下载文件到磁盘（走系统证书链，跳过吊销检查）。 */
async function downloadFile(url, dest, timeoutMs = DOWNLOAD_TIMEOUT_MS) {
  const run = await runCli('curl.exe', ['-sS', '-fL', '--ssl-no-revoke', '--max-time', String(Math.ceil(timeoutMs / 1000)), '-o', dest, url], timeoutMs, { shell: false })
  return run.code === 0
}

/** 依次尝试国内镜像与 GitHub 直连，下载指定 tag 的 zip。 */
async function downloadGithubZip(owner, repo, tag) {
  const encodedTag = encodeURIComponent(tag)
  const urls = [
    ...GITHUB_MIRRORS.map((mirror) => `${mirror}https://github.com/${owner}/${repo}/archive/refs/tags/${encodedTag}.zip`),
    `https://codeload.github.com/${owner}/${repo}/zip/refs/tags/${encodedTag}`,
  ]
  const dir = mkdtempSync(join(tmpdir(), 'dsh-plugin-updates-'))
  const zip = join(dir, `${repo}-${String(tag).replace(/[^A-Za-z0-9._-]/g, '-')}.zip`)
  try {
    for (const url of urls) {
      if (await downloadFile(url, zip)) return { zip, dir }
    }
    return { zip: null, dir }
  } catch {
    return { zip: null, dir }
  }
}

/** 复制目录内容到目标，跳过 node_modules（保留本地依赖）。 */
function copyTreeExcludingNodeModules(src, dest) {
  mkdirSync(dest, { recursive: true })
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue
    cpSync(join(src, entry.name), join(dest, entry.name), { recursive: true, force: true })
  }
}

/** 清空目录内容但保留 node_modules。 */
function clearTreeKeepingNodeModules(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue
    rmSync(join(dir, entry.name), { recursive: true, force: true })
  }
}

/** 解压 zip（Windows 自带 tar/bsdtar 支持 zip），返回解压后顶层目录。 */
function extractZip(zip, workDir) {
  if (!runCliSync('tar.exe', ['-xf', zip, '-C', workDir])) return null
  const entries = readdirSync(workDir, { withFileTypes: true }).filter((e) => e.isDirectory())
  if (entries.length === 0) return null
  return join(workDir, entries[0].name)
}

/** 同步跑一次命令（tar 解压小文件用）。 */
function runCliSync(command, args, timeoutMs = DOWNLOAD_TIMEOUT_MS) {
  const result = spawnSync(command, args, {
    cwd: profileDir(),
    env: process.env,
    windowsHide: true,
    encoding: 'utf8',
    shell: false,
    timeout: timeoutMs,
  })
  return result.status === 0
}

/**
 * 从国内镜像自动下载 GitHub 新版本并覆盖本地源码。
 * 安全策略：更新前把非 node_modules 内容备份到临时目录；失败自动回滚。
 * 注意：覆盖会丢弃本地未提交的源码改动（本机无 git 无法 merge）。
 * @returns {{ ok: boolean, version?: string, error?: string }}
 */
async function updateLocalFromGithub(name, owner, repo, tag) {
  let realDir
  try {
    realDir = realpathSync(packageDir(name))
  } catch {
    return { ok: false, error: '找不到插件源码目录（link 失效？）' }
  }
  const { zip, dir } = await downloadGithubZip(owner, repo, tag)
  if (!zip) {
    rmSync(dir, { recursive: true, force: true })
    return { ok: false, error: `镜像下载失败，请稍后重试或手动到 https://github.com/${owner}/${repo}/releases 下载。` }
  }
  try {
    const extractDir = join(dir, 'extract')
    mkdirSync(extractDir, { recursive: true })
    const root = extractZip(zip, extractDir)
    if (!root) {
      return { ok: false, error: '源码包解压失败（文件可能损坏）。' }
    }
    const backupDir = mkdtempSync(join(tmpdir(), 'dsh-plugin-updates-backup-'))
    copyTreeExcludingNodeModules(realDir, backupDir)
    clearTreeKeepingNodeModules(realDir)
    try {
      copyTreeExcludingNodeModules(root, realDir)
    } catch (error) {
      // 覆盖失败：回滚备份
      try {
        clearTreeKeepingNodeModules(realDir)
        copyTreeExcludingNodeModules(backupDir, realDir)
      } catch {}
      return { ok: false, error: `覆盖源码失败，已回滚：${String(error?.message ?? error)}` }
    }
    const pkg = readJson(join(realDir, 'package.json')) ?? {}
    return {
      ok: true,
      version: typeof pkg.version === 'string' ? pkg.version : '',
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

/** 包名白名单校验（npm 命名规则），拒绝任何可注入 shell 的形状。 */
function validName(value) {
  const name = String(value ?? '').trim()
  if (!/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(name)) throw new Error('无效的包名 ' + JSON.stringify(name))
  return name
}

/** 按 slug 移除 cordis.patch.yml 中市场/更新页加过的激活行（与内置市场同规则）。 */
function slugOf(name) {
  return name.replace(/^@/, '').replace(/[^A-Za-z0-9._-]+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '')
}

function removeRow(name) {
  const path = patchPath()
  if (!existsSync(path)) return
  const text = readFileSync(path, 'utf8')
  const id = `pm-${slugOf(name)}`
  const block = `- insert:\n    - id: ${id}\n      name: '${name}'\n`
  if (!text.includes(block)) return
  writeFileSync(path, text.split(block).join(''), 'utf8')
}

/**
 * 与 dsh plugin 命令相同的校对逻辑：依赖里声明了 dsh.bundle 的包应进入
 * dsh.profile.bundles，失去该声明的包应离开（更新后包可能新获得 bundle 声明）。
 */
function reconcileBundles() {
  const path = manifestPath()
  const manifest = readJson(path)
  if (!manifest) return
  const dependencies = Object.keys(manifest.dependencies ?? {})
  const plugins = Array.isArray(manifest.dsh?.profile?.bundles) ? manifest.dsh.profile.bundles : []
  let changed = false
  for (const name of dependencies) {
    const pkg = readJson(join(packageDir(name), 'package.json')) ?? {}
    const isBundle = pkg.dsh?.bundle?.patch !== undefined
    if (isBundle && !plugins.includes(name)) {
      plugins.push(name)
      changed = true
    } else if (!isBundle && plugins.includes(name)) {
      plugins.splice(plugins.indexOf(name), 1)
      changed = true
    }
  }
  if (changed) {
    manifest.dsh = { ...manifest.dsh, profile: { ...manifest.dsh?.profile, bundles: plugins } }
    writeJson(path, manifest)
  }
}

class PluginUpdatesGateway extends TypertRemoteService {
  /** 进行中的检查（同一时刻只跑一个）。 */
  checking = null

  constructor(ctx) {
    super(ctx, 'pluginUpdates')
    // 不用装饰器语法：运行时给实例方法打 Remote 标记（与内置市场同法）。
    for (const method of ['status', 'checkNow', 'update', 'uninstall']) {
      const decorator = Remote(method)
      decorator(PluginUpdatesGateway.prototype[method], {
        name: method,
        private: false,
        static: false,
        addInitializer: (initializer) => initializer.call(this),
      })
    }
    // 每次宿主启动都后台检查一次更新（用户要求：每次启动时检查更新）。
    const timer = setTimeout(() => {
      this.refresh().catch(() => {})
    }, CHECK_START_DELAY_MS)
    if (typeof timer.unref === 'function') timer.unref()
  }

  readCache() {
    return readJson(cachePath())
  }

  saveCache(snapshot) {
    try {
      writeJson(cachePath(), snapshot)
    } catch {
      // 缓存写失败不影响检查结果本身
    }
  }

  /** 后台刷新（去重），结果写缓存文件。 */
  refresh() {
    if (this.checking) return this.checking
    const run = collectCheck().then((snapshot) => {
      this.saveCache(snapshot)
      return snapshot
    })
    this.checking = run.finally(() => {
      this.checking = null
    })
    return run
  }

  /** 打开设置页时先读缓存；缓存缺失或过期则触发后台刷新。 */
  status() {
    const cached = this.readCache()
    if (!cached || Date.now() - Number(cached.checkedAt ?? 0) > CACHE_STALE_MS) {
      this.refresh().catch(() => {})
    }
    if (cached) {
      return { ...cached, checking: this.checking !== null }
    }
    return {
      checkedAt: null,
      checking: true,
      entries: depsSnapshot().map((dep) => ({ ...dep, latest: null, updateable: false })),
    }
  }

  /** 立即重新检查并等待结果（网络失败时仍返回本机可读到的版本信息）。 */
  async checkNow() {
    try {
      return { ...(await this.refresh()), error: null }
    } catch (error) {
      const snapshot = {
        checkedAt: Date.now(),
        entries: depsSnapshot().map((dep) => ({ ...dep, latest: null, updateable: false })),
      }
      this.saveCache(snapshot)
      return { ...snapshot, error: String((error && error.message) || error) }
    }
  }

  /** 更新一个插件：registry 包走 pnpm；GitHub 来源的本地源码从国内镜像自动下载并覆盖。 */
  async update(name) {
    const safeName = validName(name)
    const dep = depsSnapshot().find((entry) => entry.name === safeName)
    if (!dep) return { ok: false, name: safeName, error: '该插件不在本 profile 的依赖里' }
    if (dep.source === 'local') {
      const repo = resolveGithubRepo(safeName)
      if (!repo) {
        return { ok: false, name: safeName, error: '无法识别该本地插件的来源仓库，请到源码目录手动更新。' }
      }
      const tag = (await queryGithubTag(repo.owner, repo.repo))?.tag
      if (!tag) {
        return { ok: false, name: safeName, error: '没查到该仓库的最新 release/tag，无法自动更新。' }
      }
      if (!hasNewerVersion(tag, dep.current)) {
        return { ok: false, name: safeName, error: '当前已经是最新版本，无需更新。' }
      }
      const result = await updateLocalFromGithub(safeName, repo.owner, repo.repo, tag)
      if (!result.ok) {
        return { ok: false, name: safeName, error: result.error }
      }
      this.refresh().catch(() => {})
      return { ok: true, name: safeName, version: result.version ?? '', needsRestart: true }
    }
    if (dep.source !== 'registry') {
      return { ok: false, name: safeName, error: 'Git 源插件请到源码仓库手动更新，这里只支持 npm registry 插件一键更新。' }
    }
    const run = await runMutate(['add', `${safeName}@latest`])
    const after = depsSnapshot().find((entry) => entry.name === safeName)
    // pnpm 偶发非零退出但实际成功：版本已变化即视为成功。
    if (run.code !== 0 && after?.current === dep.current) {
      return { ok: false, name: safeName, error: cliFailure(run, 'update') }
    }
    reconcileBundles()
    this.refresh().catch(() => {})
    return { ok: true, name: safeName, version: after?.current ?? '', needsRestart: true }
  }

  /** 卸载一个插件，并清理 bundle 数组与 cordis.patch.yml 激活行。 */
  async uninstall(name) {
    const safeName = validName(name)
    const dep = depsSnapshot().find((entry) => entry.name === safeName)
    if (!dep) return { ok: false, name: safeName, error: '该插件不在本 profile 的依赖里' }
    const run = await runMutate(['remove', safeName])
    const stillThere = depsSnapshot().some((entry) => entry.name === safeName)
    // pnpm 偶发非零退出但实际成功：依赖已消失即视为成功。
    if (run.code !== 0 && stillThere) {
      return { ok: false, name: safeName, error: cliFailure(run, 'uninstall') }
    }
    const path = manifestPath()
    const manifest = readJson(path)
    if (manifest && Array.isArray(manifest.dsh?.profile?.bundles)) {
      manifest.dsh.profile.bundles = manifest.dsh.profile.bundles.filter((bundle) => bundle !== safeName)
      writeJson(path, manifest)
    }
    removeRow(safeName)
    try {
      const cache = this.readCache()
      if (cache && Array.isArray(cache.entries)) {
        cache.entries = cache.entries.filter((entry) => entry.name !== safeName)
        this.saveCache(cache)
      }
    } catch {}
    return { ok: true, name: safeName, needsRestart: true }
  }
}

export {
  PluginUpdatesGateway,
  resolveGithubRepo,
  queryGithubTag,
  parseGithubOwnerRepo,
  runCurl,
  versionsEqual,
  hasNewerVersion,
  desktopAppDir,
  collectDesktopCheck,
  downloadGithubZip,
  updateLocalFromGithub,
}
export default PluginUpdatesGateway
