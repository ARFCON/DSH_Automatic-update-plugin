/**
 * dsh-hub — 全局记忆库核心（原 dsh-memory 功能，整合进 dsh-hub）
 *
 * 跨会话共享的持久记忆：所有 DSH 会话共用一个 JSONL 文件
 * （$DSH_HOME/memory/memories.jsonl，默认 ~/.dsh/memory/），重启不丢。
 * 数据路径与旧 dsh-memory 完全一致：卸载 dsh-memory 后历史记忆原样保留。
 *
 * 省 token 设计：
 *  1. 记忆不自动注入任何上下文，全部按需检索；
 *  2. memory_search / memory_list 只返回键名、标签和 200 字符摘要，不含全文；
 *  3. 全文只有 memory_get 指定 key 时才进入上下文；
 *  4. 单条记忆上限 4000 字符，防止记忆库无限膨胀。
 *
 * DeepSeek 上下文缓存适配（2026-08-15）：
 *  1. memory_list / memory_search 输出不含时间戳，排序确定化
 *     （list 按 key 码点排序；search 按相关度评分 + key 码点排序），
 *     相同记忆库状态下输出逐字节稳定，命中 KV cache 前缀；
 *  2. search 多词查询按"键名 > 标签 > 正文"加权评分，提高检索命中率；
 *  3. 进程内 mtime 缓存：只读工具一次 stat 判断新鲜度，写工具强制重读，
 *     既省 IO 又保证多进程（web/cc-tui）写入可见。
 *
 * 本文件运行在宿主组合平面（profile bundle），是受信任代码，直接使用
 * node:fs 读写插件自有数据文件，不经过沙箱围栏。
 */
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const MEMORY_FILE = 'memories.jsonl'
const MAX_CONTENT_CHARS = 4000
const MAX_SNIPPET_CHARS = 200
const DEFAULT_SEARCH_LIMIT = 8
const MAX_SEARCH_LIMIT = 20
const MAX_LIST_KEYS = 200

/** 记忆库目录：优先 $DSH_HOME/memory，回退 ~/.dsh/memory。 */
function memoryDir() {
  const home = typeof process.env.DSH_HOME === 'string' && process.env.DSH_HOME.trim() !== ''
    ? process.env.DSH_HOME.trim().replace(/[\\/]+$/, '')
    : path.join(os.homedir(), '.dsh')
  return path.join(home, 'memory')
}

function memoryPath() {
  return path.join(memoryDir(), MEMORY_FILE)
}

/** 进程内写串行队列：避免多个会话并发读改写交错。 */
let writeQueue = Promise.resolve()
function enqueueWrite(op) {
  const run = writeQueue.then(op, op)
  writeQueue = run.then(() => {}, () => {})
  return run
}

/** mtime 缓存：只读工具无需每次都解析整个文件。 */
let fileCache = null // { mtimeMs: number, records: Array }

function cleanKey(raw) {
  if (typeof raw !== 'string') return ''
  return raw.trim().replace(/\s+/g, ' ')
}

function cleanTags(raw) {
  if (!Array.isArray(raw)) return []
  const seen = new Set()
  const out = []
  for (const item of raw) {
    if (typeof item !== 'string') continue
    const tag = item.trim().replace(/\s+/g, ' ')
    if (tag && !seen.has(tag.toLowerCase())) {
      seen.add(tag.toLowerCase())
      out.push(tag)
    }
    if (out.length >= 10) break
  }
  return out
}

function parseRecords(text) {
  const records = []
  if (!text) return records
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      const rec = JSON.parse(trimmed)
      if (rec && typeof rec === 'object' && typeof rec.key === 'string' && typeof rec.content === 'string') {
        records.push({
          key: rec.key,
          content: rec.content,
          tags: Array.isArray(rec.tags) ? rec.tags.filter((t) => typeof t === 'string') : [],
          created: Number.isFinite(rec.created) ? rec.created : Date.now(),
          updated: Number.isFinite(rec.updated) ? rec.updated : Date.now(),
        })
      }
    } catch {
      // 跳过损坏行，不阻塞其余记忆
    }
  }
  return records
}

async function readFresh() {
  const p = memoryPath()
  try {
    const info = await stat(p)
    if (!info.isFile()) return { mtimeMs: info.mtimeMs, records: [] }
    return { mtimeMs: info.mtimeMs, records: parseRecords(await readFile(p, 'utf8')) }
  } catch {
    return { mtimeMs: 0, records: [] }
  }
}

/** 读记忆：命中 mtime 缓存直接返回；文件被外部改过则重读。 */
async function loadRecords() {
  const p = memoryPath()
  try {
    const info = await stat(p)
    if (fileCache !== null && fileCache.mtimeMs === info.mtimeMs) return fileCache.records
    const fresh = { mtimeMs: info.mtimeMs, records: parseRecords(await readFile(p, 'utf8')) }
    fileCache = fresh
    return fresh.records
  } catch {
    fileCache = { mtimeMs: 0, records: [] }
    return []
  }
}

async function writeRecordsNow(records) {
  const dir = memoryDir()
  const p = path.join(dir, MEMORY_FILE)
  const lines = records.map((rec) => JSON.stringify({
    key: rec.key,
    content: rec.content,
    tags: rec.tags,
    created: rec.created,
    updated: rec.updated,
  }))
  const content = lines.length ? lines.join('\n') + '\n' : ''
  await mkdir(dir, { recursive: true })
  await writeFile(p, content, 'utf8')
}

/** 读改写整段串行化，避免并发交错。写盘在队列内联执行，不再二次入队（防止自锁）。 */
async function mutate(op) {
  return enqueueWrite(async () => {
    // 强制重读：写操作必须基于盘上最新状态（可能别的进程写过）。
    const records = (await readFresh()).records
    const result = await op(records)
    await writeRecordsNow(records)
    const info = await stat(memoryPath()).catch(() => null)
    fileCache = { mtimeMs: info?.mtimeMs ?? Date.now(), records }
    return result
  })
}

/** 按码点排序：与 ICU locale 无关，输出跨环境逐字节稳定。 */
function byKeyAsc(a, b) {
  return a.key < b.key ? -1 : a.key > b.key ? 1 : 0
}

function snippetOf(content, words) {
  const text = content || ''
  const lower = text.toLowerCase()
  let hit = -1
  for (const word of words) {
    const at = lower.indexOf(word)
    if (at !== -1) {
      hit = at
      break
    }
  }
  let start = 0
  if (hit > 40) start = hit - 40
  let piece = text.slice(start, start + MAX_SNIPPET_CHARS)
  if (text.length > start + MAX_SNIPPET_CHARS) piece += '…'
  if (start > 0) piece = '…' + piece
  return piece
}

/**
 * 相关度评分：键名完全匹配 > 标签完全匹配 > 键名包含 > 标签包含 > 正文包含。
 * 多词查询全部命中再加分，把最相关的记忆顶到前面，提高 limit 内的命中率。
 */
function searchScore(rec, words) {
  const key = rec.key.toLowerCase()
  const content = rec.content.toLowerCase()
  const tags = rec.tags.map((t) => t.toLowerCase())
  let score = 0
  for (const word of words) {
    if (key === word) score += 60
    else if (key.includes(word)) score += 30
    for (const tag of tags) {
      if (tag === word) score += 45
      else if (tag.includes(word)) score += 15
    }
    if (content.includes(word)) score += 8
  }
  if (words.length > 1) {
    const allHit = words.every((word) => key.includes(word) || tags.some((tag) => tag.includes(word)) || content.includes(word))
    if (allHit) score += 25
  }
  return score
}

function fmtTime(ts) {
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
}

function renderText(_args, value) {
  return [{ type: 'text', text: value }]
}

const saveTool = {
  name: 'memory_save',
  description: '把一条信息存入全局记忆库（所有 DSH 会话共享、重启不丢）。同名 key 会整体覆盖更新，tags 便于分类搜索。只存精炼的事实/结论/偏好，正文上限 4000 字符。返回一行确认，不占用多少 token。',
  parameters: {
    type: 'object',
    properties: {
      key: { type: 'string', description: '记忆的稳定键名，如 "用户偏好"、"godot-项目规范"、"战斗系统结论"' },
      content: { type: 'string', description: '记忆正文（建议精炼到几十字；上限 4000 字符）' },
      tags: { type: 'array', items: { type: 'string' }, description: '可选标签，如 ["godot","ui"]，最多 10 个' },
    },
    required: ['key', 'content'],
  },
  execute: async (args) => {
    const key = cleanKey(args.key)
    const content = typeof args.content === 'string' ? args.content.trim() : ''
    if (!key) return '❌ 保存失败：key 不能为空'
    if (!content) return '❌ 保存失败：content 不能为空'
    if (content.length > MAX_CONTENT_CHARS) return '❌ 保存失败：正文 ' + content.length + ' 字符，超过上限 ' + MAX_CONTENT_CHARS + '，请拆分多条或精简'
    const tags = cleanTags(args.tags)
    const now = Date.now()
    return mutate((records) => {
      const existing = records.find((r) => r.key === key)
      if (existing) {
        existing.content = content
        existing.tags = tags
        existing.updated = now
      } else {
        records.push({ key, content, tags, created: now, updated: now })
      }
      return '✅ ' + (existing ? '已更新' : '已保存') + '「' + key + '」（' + content.length + ' 字符' + (tags.length ? '，标签: ' + tags.join(', ') : '') + '）'
    })
  },
  output: { schema: { type: 'string' }, render: renderText },
}

const searchTool = {
  name: 'memory_search',
  description: '在全局记忆库里按关键词/标签搜索（大小写不敏感；多个词按相关度评分排序，键名命中 > 标签命中 > 正文命中）。只返回键名、标签和 200 字符摘要片段，不返回全文——需要全文时用 memory_get 按 key 精确读取，这样才能省 token。',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: '搜索词，匹配键名/正文/标签；多个词用空格分隔' },
      limit: { type: 'integer', description: '最多返回条数，默认 8，上限 20' },
    },
    required: ['query'],
  },
  execute: async (args) => {
    const query = typeof args.query === 'string' ? args.query.trim() : ''
    if (!query) return '❌ 搜索失败：query 不能为空'
    let limit = Number.isFinite(args.limit) ? Math.floor(args.limit) : DEFAULT_SEARCH_LIMIT
    if (limit < 1) limit = 1
    if (limit > MAX_SEARCH_LIMIT) limit = MAX_SEARCH_LIMIT
    const words = query.toLowerCase().split(/\s+/).filter(Boolean)
    const records = await loadRecords()
    const scored = records
      .map((rec) => ({ rec, score: searchScore(rec, words) }))
      .filter((item) => item.score > 0)
    // 分数降序，同分按 key 码点升序 → 输出确定、稳定。
    scored.sort((a, b) => (b.score - a.score) || (a.rec.key < b.rec.key ? -1 : a.rec.key > b.rec.key ? 1 : 0))
    if (!scored.length) return '没有找到与「' + query + '」相关的记忆（共 ' + records.length + ' 条）。'
    const lines = ['找到 ' + scored.length + ' 条（共 ' + records.length + ' 条记忆，按相关度排序）：']
    for (const item of scored.slice(0, limit)) {
      const r = item.rec
      lines.push('· 「' + r.key + '」' + (r.tags.length ? '（标签: ' + r.tags.join(', ') + '）' : ''))
      lines.push('    ' + snippetOf(r.content, words))
    }
    if (scored.length > limit) lines.push('…还有 ' + (scored.length - limit) + ' 条，可用 memory_list 或更精确的 query 缩小范围。')
    return lines.join('\n')
  },
  output: { schema: { type: 'string' }, render: renderText },
}

const listTool = {
  name: 'memory_list',
  description: '列出全局记忆库的索引：只有键名和标签，不含正文与时间（输出稳定、省 token）。想读内容就用 memory_get(key)。',
  parameters: { type: 'object', properties: {} },
  execute: async () => {
    const records = (await loadRecords()).slice()
    if (!records.length) return '记忆库为空。可用 memory_save 存入第一条记忆。'
    records.sort(byKeyAsc)
    const lines = ['共 ' + records.length + ' 条记忆：']
    for (const r of records.slice(0, MAX_LIST_KEYS)) {
      lines.push('· 「' + r.key + '」' + (r.tags.length ? '（标签: ' + r.tags.join(', ') + '）' : ''))
    }
    if (records.length > MAX_LIST_KEYS) lines.push('…还有 ' + (records.length - MAX_LIST_KEYS) + ' 条未显示，用 memory_search 关键词查找。')
    return lines.join('\n')
  },
  output: { schema: { type: 'string' }, render: renderText },
}

const getTool = {
  name: 'memory_get',
  description: '按 key 精确读取一条记忆的完整正文。只有这里会读入全文，所以仅在你确认需要该记忆时调用。',
  parameters: {
    type: 'object',
    properties: { key: { type: 'string', description: '记忆键名（先用 memory_search/memory_list 拿到 key）' } },
    required: ['key'],
  },
  execute: async (args) => {
    const key = cleanKey(args.key)
    if (!key) return '❌ 读取失败：key 不能为空'
    const records = await loadRecords()
    const rec = records.find((r) => r.key === key)
    if (!rec) return '❌ 没有找到「' + key + '」。用 memory_list 查看现有键名。'
    const header = '「' + rec.key + '」' + (rec.tags.length ? '（标签: ' + rec.tags.join(', ') + '）' : '') + ' | 创建: ' + fmtTime(rec.created) + ' | 更新: ' + fmtTime(rec.updated)
    return header + '\n\n' + rec.content
  },
  output: { schema: { type: 'string' }, render: renderText },
}

const deleteTool = {
  name: 'memory_delete',
  description: '按 key 删除一条全局记忆。删除不可恢复，谨慎使用。',
  parameters: {
    type: 'object',
    properties: { key: { type: 'string', description: '要删除的记忆键名' } },
    required: ['key'],
  },
  execute: async (args) => {
    const key = cleanKey(args.key)
    if (!key) return '❌ 删除失败：key 不能为空'
    return mutate((records) => {
      const idx = records.findIndex((r) => r.key === key)
      if (idx < 0) return '❌ 没有找到「' + key + '」，未删除任何内容。'
      records.splice(idx, 1)
      return '🗑 已删除「' + key + '」（剩余 ' + records.length + ' 条记忆）'
    })
  },
  output: { schema: { type: 'string' }, render: renderText },
}

/** 导出工具数组：便于独立测试脚本直接调用 execute。 */
export const memoryTools = [saveTool, searchTool, listTool, getTool, deleteTool]

/** 供宿主（index.js）读取记忆条数与文件路径。 */
export { loadRecords, memoryDir, memoryPath }
