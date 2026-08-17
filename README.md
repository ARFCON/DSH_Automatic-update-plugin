# dsh-hub — DSH 插件中枢

把 DSH 的**全局记忆**、**记忆图谱（graph-memory）**、**插件市场（dsh-market）** 和**自身更新检查**整合进一个插件，在设置页统一查看与管理。

替代旧插件 [dsh-plugin-updates]（更新检查器）与 **dsh-memory**（全局记忆）：二者功能全部并入 dsh-hub，记忆数据路径不变、不丢失。

## 功能

| 模块 | 说明 |
|---|---|
| 🧠 全局记忆 | 原 dsh-memory 的 5 个 `memory_*` 工具（save / search / list / get / delete），所有会话共享，JSONL 存储（`~/.dsh/memory/memories.jsonl`），卸载旧 dsh-memory 后历史记忆原样保留 |
| 🕸 graph-memory 挂载 | 检测到 `plugin-src/graph-memory` 源码即自动装配（写入 profile bundles + link + node_modules junction，幂等）；设置页展示安装状态与记忆库统计（节点 / 边 / 社区，直接只读 SQLite，不依赖 graph-memory 本体） |
| 🛒 dsh-market 联动 | 检测插件市场（dshmarket）是否安装：已装 → 设置页状态展示，引导到「设置 → 插件市场」；未装 → 提醒并给出安装命令 |
| 🔄 自身更新检查 | 从 GitHub 仓库 `ARFCON/DSH_Automatic-update-plugin` 读取 `package.json` 版本号对比本地（raw.githubusercontent + jsDelivr CDN 双源，规避 GitHub API 限流 403） |

> 设计原则：**只挂载、不修改**。dsh-hub 不改动 graph-memory 与 dsh-market 本体，只做检测、装配、状态展示与入口联动。

## 安装

依赖：Node.js ≥ 20、pnpm、dsh CLI。

### Windows（PowerShell）

```powershell
# 在解压后的插件目录里执行
.\install.ps1
# 或指定 profile
.\install.ps1 -Profile web
```

### macOS / Linux

```bash
./install.sh
# 或指定 profile
./install.sh web
```

### 手动安装

```bash
# 把插件放到源码目录
mkdir -p ~/.dsh/plugin-src
cp -R dsh-hub ~/.dsh/plugin-src/

# 安装依赖
cd ~/.dsh/plugin-src/dsh-hub && pnpm install

# 挂载到 profile
dsh plugin --profile web add "link:$HOME/.dsh/plugin-src/dsh-hub"
```

安装完成后**重启 DSH 服务**（DSH Desktop 重启，或重启 dsh web）。

## 使用

打开 **设置 → 插件 → 插件中枢**，总览四个模块的状态：

- **全局记忆**：记忆条数、数据文件位置
- **graph-memory**：源码版本、装配状态（未装配可一键「立即装配」，装配后需重启生效）、记忆库统计
- **dsh-market**：安装状态；未安装时显示安装命令与仓库链接
- **dsh-hub 自身更新**：当前版本、最新版本、检查时间；「检查更新」按钮手动触发

## 数据与兼容

- 记忆文件路径与旧 dsh-memory 完全一致：`~/.dsh/memory/memories.jsonl`（支持 `$DSH_HOME` 覆盖），**升级不丢数据**。
- graph-memory 的数据库位于 `~/.dsh/graph-memory/graph-memory.db`，dsh-hub 只读统计，不写入。
- 若同时安装旧 dsh-plugin-updates 0.2.x，两者功能重叠，建议卸载旧插件。

## 开发

```
lib/
  index.js       宿主端：记忆工具注册 + dshHub Remote 网关（status / mountGraphMemory / checkUpdate）
  client.js      客户端：设置页「插件中枢」Tab
  typert.js      Typert Remote 定义（与 index.js 的 Remote 方法同步）
  memory-core.js 记忆核心（JSONL 读写、搜索评分、mtime 缓存）
```

维护铁律：

1. 新增 Remote 方法必须同步三处：`lib/index.js` 的 methods 列表、`lib/typert.js` 的 invocations、`lib/client.js` 的 REMOTE.descriptors；
2. profile 的 `package.json` / `cordis.patch.yml` 一律原子写入（同目录 `.tmp` + rename），不落半截文件；
3. 不改动 graph-memory / dsh-market 本体，只做挂载与展示。

## 更新日志

### 0.1.0（2026-08-17）

- 首个整合版本：dsh-memory 记忆功能并入（数据路径不变）+ graph-memory 检测/自动装配/状态统计 + dsh-market 检测联动 + 自身更新检查
- 设置页新增「插件中枢」Tab（zh/en 双语）
- 更新检查走 GitHub raw + jsDelivr 双源，规避 GitHub API 限流

[dsh-plugin-updates]: https://github.com/ARFCON/DSH_Automatic-update-plugin
