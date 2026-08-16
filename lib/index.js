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
/** 客户端安装目录候选（DSH Desktop 等；可用 DSH_CLIENT_APP_DIR 覆盖/追加）。 */
const DESKTOP_APP_DIRS = [
  ...(process.env.DSH_CLIENT_APP_DIR ? [String(process.env.DSH_CLIENT_APP_DIR).trim()] : []),
  join(process.env.LOCALAPPDATA || '', 'Programs', 'DSH Desktop', 'resources', 'app'),
  'C:\\Users\\OwO\\AppData\\Local\\Programs\\DSH Desktop\\resources\\app',
]

/**
 * 开发者识别：可选的开发者 GitHub 用户名。
 * 通过环境变量 DSH_PLUGIN_DEV_GITHUB 配置（只用于识别，不读取任何本机信息）。
 * 若某个插件的 GitHub 来源 owner 匹配该用户名，会在 UI 上标记为“开发者”插件。
 */
const DEVELOPER_GITHUB = String(
  process.env.DSH_PLUGIN_DEV_GITHUB || process.env.DSH_PLUGIN_DEVELOPER || ''
).trim().replace(/^@/, '').toLowerCase()

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

/** 跑一个 pnpm/npm/curl 命令（默认在 profile 目录，可用 options.cwd 指定目录），收集受限输出。 */
function runCli(command, args, timeoutMs, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? profileDir(),
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

/** 从插件目录 README 里提取 GitHub 仓库链接（兜底线索）。 */
function githubFromReadme(realDir) {
  const names = ['README.md', 'README.MD', 'readme.md', 'README.txt', 'readme.txt']
  for (const name of names) {
    const p = join(realDir, name)
    if (!existsSync(p)) continue
    let text
    try {
      text = readFileSync(p, 'utf8')
    } catch {
      continue
    }
    const match = text.match(/github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+?)(?:\.git)?(?:[#/)\s]|$)/i)
    if (match) return parseGithubOwnerRepo(match[0])
  }
  return null
}

/**
 * 识别一个本地 link 插件对应的 GitHub 仓库（本地线索）。
 * 顺序：package.json repository → homepage/bugs → 源码目录 .git/config → README 链接。
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
    const fromReadme = githubFromReadme(realDir)
    if (fromReadme) return fromReadme
  }
  return null
}

/**
 * 识别本地 link 插件的 GitHub 仓库（本地线索失败后，回退到 npm registry 上同名包的 repository/homepage）。
 * 这能救活像 dsh-advisor 这种源码里没写仓库信息、但已发布到 npm 的插件。
 */
async function resolveGithubRepoAsync(name) {
  const local = resolveGithubRepo(name)
  if (local) return local
  for (const field of ['repository.url', 'homepage']) {
    const run = await runCli('npm', ['view', name, field, '--json'], VIEW_TIMEOUT_MS)
    if (run.code !== 0) continue
    try {
      const value = JSON.parse(run.stdout)
      if (typeof value === 'string') {
        const parsed = parseGithubOwnerRepo(value)
        if (parsed) return parsed
      }
    } catch {
      // 忽略解析失败
    }
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
      description: typeof pkg.description === 'string' ? pkg.description : '',
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
  const candidates = []
  for (const dep of deps.filter((item) => item.source === 'local')) {
    try {
      const repo = await resolveGithubRepoAsync(dep.name)
      if (repo) candidates.push({ dep, repo })
    } catch {
      // 单个识别失败不拖垮
    }
  }
  const targets = candidates
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
        description: typeof pkg.description === 'string' ? pkg.description : '',
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


/** Desktop assets/plugins 目录（作者配套插件；找不到返回 null）。 */
/** 客户端插件目录（其它客户端可用 DSH_CLIENT_PLUGINS_DIR 指定；找不到返回 null 不报错）。 */
function clientPluginsDir() {
  if (process.env.DSH_CLIENT_PLUGINS_DIR) {
    const dir = String(process.env.DSH_CLIENT_PLUGINS_DIR).trim()
    return dir !== '' && existsSync(dir) ? dir : null
  }
  const appDir = desktopAppDir()
  if (!appDir) return null
  const dir = join(appDir, 'assets', 'plugins')
  return existsSync(dir) ? dir : null
}

/** 兼容旧名：客户端插件目录。 */
function assetsPluginsDir() {
  return clientPluginsDir()
}

/** 从任意插件目录解析 GitHub 来源（package.json / README / npm registry 回退）。 */
async function resolveRepoForAssetDir(dir, name) {
  const pkg = readJson(join(dir, 'package.json')) ?? {}
  const candidates = []
  if (pkg.repository && typeof pkg.repository === 'object') candidates.push(pkg.repository.url)
  if (pkg.repository && typeof pkg.repository === 'string') candidates.push(pkg.repository)
  if (typeof pkg.homepage === 'string') candidates.push(pkg.homepage)
  if (pkg.bugs && typeof pkg.bugs === 'object' && typeof pkg.bugs.url === 'string') candidates.push(pkg.bugs.url)
  for (const value of candidates) {
    if (!/github\.com/i.test(String(value ?? ''))) continue
    const parsed = parseGithubOwnerRepo(value)
    if (parsed) return parsed
  }
  const fromReadme = githubFromReadme(dir)
  if (fromReadme) return fromReadme
  // npm registry 回退
  for (const field of ['repository.url', 'homepage']) {
    const run = await runCli('npm', ['view', name, field, '--json'], VIEW_TIMEOUT_MS)
    if (run.code !== 0) continue
    try {
      const value = JSON.parse(run.stdout)
      if (typeof value === 'string') {
        const parsed = parseGithubOwnerRepo(value)
        if (parsed) return parsed
      }
    } catch {}
  }
  return null
}

/** 扫描 Desktop 作者配套插件（assets/plugins），与 GitHub/npm 最新版对比。 */
async function collectDesktopPlugins() {
  const base = assetsPluginsDir()
  if (!base) return null
  const dirs = readdirSync(base, { withFileTypes: true }).filter((d) => d.isDirectory())
  const targets = dirs.map((d) => {
    const dir = join(base, d.name)
    const pkg = readJson(join(dir, 'package.json')) ?? {}
    return {
      name: pkg.name || d.name,
      current: typeof pkg.version === 'string' ? pkg.version : '',
      description: typeof pkg.description === 'string' ? pkg.description : '',
      dir,
    }
  }).filter((e) => e.current !== '')
  const found = new Map()
  let cursor = 0
  const workers = Array.from({ length: Math.min(GITHUB_CONCURRENCY, Math.max(1, targets.length)) }, async () => {
    while (true) {
      const index = cursor++
      if (index >= targets.length) return
      const entry = targets[index]
      try {
        const repo = await resolveRepoForAssetDir(entry.dir, entry.name)
        let tag = null
        let hasRelease = false
        let npmLatest = null
        if (repo) {
          const gh = await queryGithubTag(repo.owner, repo.repo)
          if (gh) { tag = gh.tag; hasRelease = gh.hasRelease }
        }
        if (!tag) npmLatest = await queryLatest(entry.name)
        found.set(entry.name, { repo, tag, hasRelease, npmLatest })
      } catch {
        // 单个失败不拖垮
      }
    }
  })
  await Promise.all(workers)
  return targets.map((entry) => {
    const info = found.get(entry.name)
    const repo = info?.repo ?? null
    const latest = info?.tag ?? info?.npmLatest ?? null
    return {
      ...entry,
      latest,
      updateable: hasNewerVersion(latest, entry.current),
      github: repo === null ? null : {
        owner: repo.owner,
        repo: repo.repo,
        latestTag: info?.tag ?? null,
        htmlUrl: `https://github.com/${repo.owner}/${repo.repo}`,
        updateUrl: `https://github.com/${repo.owner}/${repo.repo}/${info?.hasRelease ? 'releases/latest' : 'tags'}`,
      },
    }
  })
}

/** 完整执行一次检查，返回可序列化的结果。 */
async function collectCheck() {
  const deps = depsSnapshot()
  const npmMap = await collectNpmLatest(deps)
  const githubMap = await collectGithubTags(deps)
  const desktop = await collectDesktopCheck()
  const desktopPlugins = await collectDesktopPlugins()
  const insertMap = patchInsertMap()
  const disableIds = patchDisableIds()
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
  }).map((entry) => {
    const entryId = insertMap.get(entry.name) ?? null
    return {
      ...entry,
      entryId,
      enabled: entryId === null ? true : !disableIds.has(entryId),
      isDeveloper: DEVELOPER_GITHUB !== '' && entry.github !== null && entry.github.owner.toLowerCase() === DEVELOPER_GITHUB,
    }
  })
  return { checkedAt: Date.now(), entries, desktop, desktopPlugins }
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

/** 复制目录全部内容（含 node_modules，zip 一般没有）。 */
function copyDirContents(src, dest) {
  mkdirSync(dest, { recursive: true })
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    cpSync(join(src, entry.name), join(dest, entry.name), { recursive: true, force: true })
  }
}

/** 从 package.json 解析插件入口相对路径（main 或 exports["."].default）。 */
function entryPathOf(pkg) {
  if (!pkg) return ''
  const direct = pkg.main
  const dot = pkg.exports && pkg.exports['.'] && (pkg.exports['.'].default || pkg.exports['.'])
  const raw = typeof dot === 'string' ? dot : direct
  return String(raw || '').replace(/^\.\//, '')
}

/** 在插件目录尝试构建：先 pnpm install（触发 prepare），再 pnpm run build。返回 { ok, error? }。 */
async function tryBuildPlugin(realDir) {
  const install = await runCli('pnpm', ['install', '--no-frozen-lockfile'], MUTATE_TIMEOUT_MS, { cwd: realDir })
  if (install.code === 0) return { ok: true }
  const installErr = cliFailure(install, 'install')
  const build = await runCli('pnpm', ['run', 'build'], MUTATE_TIMEOUT_MS, { cwd: realDir })
  if (build.code === 0) return { ok: true }
  return { ok: false, error: `pnpm install 失败：${installErr} | pnpm build 失败：${cliFailure(build, 'build')}` }
}

/** 用备份完整恢复插件目录。 */
function rollbackPlugin(realDir, backupDir) {
  rmSync(realDir, { recursive: true, force: true })
  mkdirSync(realDir, { recursive: true })
  copyDirContents(backupDir, realDir)
}

/**
 * 从国内镜像自动下载 GitHub 新版本并替换本地源码。
 *
 * 安全策略（修复 2026-08-16）：
 *  1. 完整备份整个插件目录（含 node_modules）到临时目录；
 *  2. 解压后先检查新版 package.json 与入口文件；
 *  3. 清空并复制新内容；
 *  4. 如果源码包不含构建产物（lib/dist 常见于 git 源码包），自动运行 pnpm install/build；
 *  5. 最终验证入口文件存在，否则回滚并报错；
 *  6. 任何异常都会回滚到完整备份。
 * 已知风险：备份目录位于系统临时目录（%TEMP%），若更新过程中进程崩溃/断电，
 *   临时备份可能不完整且不会自动清理；极端情况下真实目录可能损坏。
 *   如需更强保障，可把备份目录改为持久位置（如 profile 目录）。
 *
 * 注意：覆盖会丢弃本地未提交的源码改动（本机无 git 无法 merge）。
 * @returns {{ ok: boolean, version?: string, error?: string }}
 */
/** 用一份解压好的新源码替换插件目录：完整备份 → 替换 → pnpm install/build → 验证入口 → 失败回滚。 */
async function applyNewSource(realDir, root) {
  const newPkg = readJson(join(root, 'package.json')) ?? {}
  if (!newPkg.version) {
    return { ok: false, error: '下载的新版本缺少 package.json，已取消更新。' }
  }
  let backupDir = null
  try {
    backupDir = mkdtempSync(join(tmpdir(), 'dsh-plugin-updates-backup-'))
    copyDirContents(realDir, backupDir)
    rmSync(realDir, { recursive: true, force: true })
    mkdirSync(realDir, { recursive: true })
    copyDirContents(root, realDir)

    // 总是安装依赖并触发 prepare/build；pnpm 11 可能因安全策略忽略部分 build scripts（如 esbuild）而返回非零，
    // 但依赖本体通常已装好，因此只要入口存在且 node_modules 存在，就继续。
    const install = await runCli('pnpm', ['install', '--no-frozen-lockfile'], MUTATE_TIMEOUT_MS, { cwd: realDir })
    const installErr = install.code === 0 ? '' : cliFailure(install, 'install')

    let finalPkg = readJson(join(realDir, 'package.json')) ?? {}
    let finalEntry = entryPathOf(finalPkg)
    let finalEntryOk = finalEntry === '' || existsSync(join(realDir, finalEntry))
    if (!finalEntryOk) {
      const build = await runCli('pnpm', ['run', 'build'], MUTATE_TIMEOUT_MS, { cwd: realDir })
      if (build.code !== 0) {
        rollbackPlugin(realDir, backupDir)
        return { ok: false, error: `更新后依赖安装/构建失败，已回滚。详情：pnpm install 失败：${installErr} | pnpm build 失败：${cliFailure(build, 'build')}` }
      }
      finalPkg = readJson(join(realDir, 'package.json')) ?? {}
      finalEntry = entryPathOf(finalPkg)
      finalEntryOk = finalEntry === '' || existsSync(join(realDir, finalEntry))
    }
    if (!finalEntryOk) {
      rollbackPlugin(realDir, backupDir)
      return { ok: false, error: '更新后插件入口文件缺失（构建未生成产物），已回滚。请稍后重试或手动到仓库下载构建版。' }
    }
    if (!existsSync(join(realDir, 'node_modules'))) {
      rollbackPlugin(realDir, backupDir)
      return { ok: false, error: `更新后依赖安装失败（node_modules 缺失），已回滚。详情：${installErr}` }
    }
    return { ok: true, version: typeof finalPkg.version === 'string' ? finalPkg.version : '' }
  } catch (error) {
    if (backupDir && existsSync(backupDir)) {
      try { rollbackPlugin(realDir, backupDir) } catch {}
    }
    return { ok: false, error: `更新失败，已回滚：${String(error?.message ?? error)}` }
  }
}

async function updateLocalFromGithub(name, owner, repo, tag, realDirOverride) {
  let realDir
  try {
    realDir = realDirOverride || realpathSync(packageDir(name))
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
    if (!root) return { ok: false, error: '源码包解压失败（文件可能损坏）。' }
    return await applyNewSource(realDir, root)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

/** 从 npm registry 下载指定版本 tarball 并替换插件目录（用于 GitHub 无 release/tag 但有 npm 发布的插件）。
 * 安全：npm 命令经 shell 执行（Windows 下 npm.cmd 无法 shell:false 直接 spawn），存在 shell 注入面；
 *   调用方必须传入已校验的包名（validName），version 必须通过下方 semver 白名单。后续硬化可改为
 *   定位 npm-cli.js 后用 node 直接执行，彻底去掉 shell。 */
async function updateDirFromNpm(realDir, name, version) {
  if (!/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(String(name || ''))) {
    return { ok: false, error: '非法的 npm 包名，已拒绝更新。' }
  }
  if (!/^v?\d+(?:\.\d+){0,2}(?:[-+][0-9A-Za-z.-]+)?$/.test(String(version || ''))) {
    return { ok: false, error: '非法的 npm 版本号，已拒绝更新。' }
  }
  const dir = mkdtempSync(join(tmpdir(), 'dsh-plugin-updates-npm-'))
  try {
    const pack = await runCli('npm', ['pack', `${name}@${version}`, '--pack-destination', dir, '--json'], DOWNLOAD_TIMEOUT_MS)
    if (pack.code !== 0) return { ok: false, error: `npm 下载失败：${cliFailure(pack, 'pack')}` }
    let tgz = null
    try {
      const arr = JSON.parse(pack.stdout)
      if (Array.isArray(arr) && arr[0] && arr[0].filename) tgz = join(dir, arr[0].filename)
    } catch {}
    if (!tgz || !existsSync(tgz)) return { ok: false, error: 'npm 下载文件未找到' }
    const extractDir = join(dir, 'extract')
    mkdirSync(extractDir, { recursive: true })
    if (!runCliSync('tar.exe', ['-xf', tgz, '-C', extractDir])) return { ok: false, error: 'npm 包解压失败' }
    const root = join(extractDir, 'package')
    if (!existsSync(join(root, 'package.json'))) return { ok: false, error: 'npm 包缺少 package.json' }
    return await applyNewSource(realDir, root)
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

// --- cordis.patch.yml 解析：entry id / disable（用于启用/停用插件） ---

/** 解析 patch 中 insert 块：插件名 -> loader entry id。 */
function patchInsertMap() {
  const path = patchPath()
  if (!existsSync(path)) return new Map()
  const text = readFileSync(path, 'utf8')
  const map = new Map()
  const blocks = text.split(/^- insert:/m).slice(1)
  for (const block of blocks) {
    const idMatch = block.match(/^\s*- id:\s*(\S+)/m)
    const nameMatch = block.match(/^\s*name:\s*['"]([^'"]+)['"]/m)
    if (idMatch && nameMatch) map.set(nameMatch[1], idMatch[1])
  }
  return map
}

/** 解析 patch 中所有被 disable 的 entry id。 */
function patchDisableIds() {
  const path = patchPath()
  if (!existsSync(path)) return new Set()
  const text = readFileSync(path, 'utf8')
  const set = new Set()
  const blocks = text.split(/^- disable:/m).slice(1)
  for (const block of blocks) {
    const idMatch = block.match(/^\s*- id:\s*(\S+)/m)
    if (idMatch) set.add(idMatch[1])
  }
  return set
}

/** 按插件名找它在 cordis.patch.yml 里的 entry id（找不到返回 null）。 */
function findEntryIdForName(name) {
  return patchInsertMap().get(name) ?? null
}

/** 启用或停用一个插件（修改 cordis.patch.yml 的 disable 块）。 */
function setPluginEnabled(name, enabled) {
  const id = findEntryIdForName(name)
  if (!id) return { ok: false, error: '找不到该插件的激活 entry（它可能不是通过 cordis.patch.yml 安装的，无法安全启停）' }
  const path = patchPath()
  let text = existsSync(path) ? readFileSync(path, 'utf8') : ''
  const block = `- disable:\n    - id: ${id}\n`
  if (enabled) {
    if (!text.includes(block)) return { ok: true, id, enabled: true, already: true }
    writeFileSync(path, text.split(block).join(''), 'utf8')
    return { ok: true, id, enabled: true, needsRestart: true }
  }
  if (text.includes(block)) return { ok: true, id, enabled: false, already: true }
  text = text.replace(/\s+$/, '') + '\n' + block
  writeFileSync(path, text, 'utf8')
  return { ok: true, id, enabled: false, needsRestart: true }
}

/** 卸载时同时移除对应的 disable 块，避免残留孤儿条目。 */
function removeDisableForId(id) {
  const path = patchPath()
  if (!existsSync(path) || !id) return
  const text = readFileSync(path, 'utf8')
  const block = `- disable:\n    - id: ${id}\n`
  if (text.includes(block)) writeFileSync(path, text.split(block).join(''), 'utf8')
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
    for (const method of ['status', 'checkNow', 'update', 'uninstall', 'setEnabled', 'updateAssetPlugin']) {
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
      const repo = await resolveGithubRepoAsync(safeName)
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

  /** 启用/停用一个插件（通过 cordis.patch.yml 的 disable 块，需重启生效）。 */
  setEnabled(name, enabled) {
    const safeName = validName(name)
    const dep = depsSnapshot().find((entry) => entry.name === safeName)
    if (!dep) return { ok: false, name: safeName, error: '该插件不在本 profile 的依赖里' }
    const result = setPluginEnabled(safeName, Boolean(enabled))
    if (!result.ok) return { ok: false, name: safeName, error: result.error }
    this.refresh().catch(() => {})
    return { ok: true, name: safeName, id: result.id, enabled: result.enabled, needsRestart: true }
  }

  /** 更新一个 Desktop 作者配套插件（assets/plugins，GitHub 来源）。 */
  async updateAssetPlugin(name) {
    const safeName = validName(name)
    const base = assetsPluginsDir()
    if (!base) return { ok: false, name: safeName, error: '未找到 Desktop 作者配套插件目录' }
    let dir = null
    for (const d of readdirSync(base, { withFileTypes: true }).filter((x) => x.isDirectory())) {
      const pkg = readJson(join(base, d.name, 'package.json')) ?? {}
      if (pkg.name === safeName || d.name === safeName) { dir = join(base, d.name); break }
    }
    if (!dir) return { ok: false, name: safeName, error: '未找到该配套插件' }
    const repo = await resolveRepoForAssetDir(dir, safeName)
    if (!repo) return { ok: false, name: safeName, error: '该配套插件没有可识别的 GitHub 来源，无法自动更新' }
    const current = readJson(join(dir, 'package.json'))?.version ?? ''
    const gh = await queryGithubTag(repo.owner, repo.repo)
    if (gh && gh.tag && hasNewerVersion(gh.tag, current)) {
      const result = await updateLocalFromGithub(safeName, repo.owner, repo.repo, gh.tag, dir)
      if (!result.ok) return { ok: false, name: safeName, error: result.error }
      this.refresh().catch(() => {})
      return { ok: true, name: safeName, version: result.version ?? '', needsRestart: true }
    }
    // GitHub 无可用 tag 时回退 npm registry 更新
    const npmLatest = await queryLatest(safeName)
    if (npmLatest && hasNewerVersion(npmLatest, current)) {
      const result = await updateDirFromNpm(dir, safeName, npmLatest)
      if (!result.ok) return { ok: false, name: safeName, error: result.error }
      this.refresh().catch(() => {})
      return { ok: true, name: safeName, version: result.version ?? '', needsRestart: true }
    }
    return { ok: false, name: safeName, error: '当前已经是最新版本，或查不到可用的更新源。' }
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
    removeDisableForId(findEntryIdForName(safeName))
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
  resolveGithubRepoAsync,
  queryGithubTag,
  parseGithubOwnerRepo,
  runCurl,
  versionsEqual,
  hasNewerVersion,
  desktopAppDir,
  collectDesktopCheck,
  assetsPluginsDir,
  resolveRepoForAssetDir,
  collectDesktopPlugins,
  downloadGithubZip,
  updateLocalFromGithub,
  updateDirFromNpm,
  applyNewSource,
}
export default PluginUpdatesGateway







