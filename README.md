# dsh-hub — DSH 插件中枢

把 DSH 的**插件更新引擎**、**全局记忆**、**记忆图谱（graph-memory）**、**插件市场（dsh-market）** 和**自身更新检查**整合进一个插件，在设置页统一查看与管理。

替代旧插件 [dsh-plugin-updates]（更新检查器）与 **dsh-memory**（全局记忆）：二者功能全部并入 dsh-hub，记忆数据路径不变、不丢失。

## 功能

| 模块 | 说明 |
|---|---|
| 🛠 插件更新引擎 | 原 dsh-plugin-updates 全部功能：已装插件版本对比（npm registry / GitHub release/tag）、一键更新、批量全部更新、启用/停用、卸载（含 bundle 与 patch 清理）、Desktop 客户端内置核心包检查、客户端配套插件（assets/plugins）更新、启动自检自动修复（损坏的 package.json / cordis.patch.yml 原子写恢复、插件入口缺失修复）。**原生适配 Gitee 版 DSH Desktop**（`my-yang-yunfan/dsh_desktop`）：客户端版本对比走 GitHub + Gitee 双源（与官方客户端同款端点与「取最高版本」语义，GitHub 限流时 Gitee 兜底），国内用户可直接打开 Gitee 发布页下载安装包 |
| 🧠 全局记忆 | 原 dsh-memory 的 5 个 `memory_*` 工具（save / search / list / get / delete），所有会话共享，JSONL 存储（`~/.dsh/memory/memories.jsonl`），卸载旧 dsh-memory 后历史记忆原样保留 |
| 🕸 graph-memory 挂载 | 检测到 `plugin-src/graph-memory` 源码即自动装配（写入 profile bundles + link + node_modules junction，幂等）；设置页展示安装状态与记忆库统计（节点 / 边 / 社区，直接只读 SQLite，不依赖 graph-memory 本体） |
| 🛒 dsh-market 联动 | 检测插件市场（dshmarket）是否安装：已装 → 设置页状态展示，引导到「设置 → 插件市场」；未装 → 提醒并给出安装命令 |
| 🧩 zat-dsh-engine 联动 | 检测 zat-dsh-engine（插件市场引擎，[mishibeikejie/zat-dsh-engine](https://github.com/mishibeikejie/zat-dsh-engine)）是否安装：已装 → 设置页状态展示，未装 → 提醒并给出安装命令 |
| 🔄 自身更新检查 | 从 GitHub 仓库 `ARFCON/dsh-hub-DSH` 读取 `package.json` 版本号对比本地（raw.githubusercontent + jsDelivr CDN 双源，规避 GitHub API 限流 403） |

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

打开 **设置 → 插件 → 插件中枢**，总览各模块状态：

- **插件更新**：已安装插件列表（npm / GitHub / 本地源码 / Git 源 / 客户端插件 / Desktop 核心包），支持筛选、说明、启用/停用、单个更新、全部更新、卸载、GitHub 打开；顶部显示上次检查时间与启动自检修复结果；「立即重启服务」一键生效
- **DSH Desktop 客户端版本**：在「插件更新」的客户端区块顶部显示官方最新版本（GitHub / Gitee 双源自动选择最高的可用版本）与当前版本对比；有新版本时给出「打开 Gitee 发布页 / 打开 GitHub 发布页」按钮，国内网络可直接跳转下载
- **全局记忆**：记忆条数、数据文件位置
- **graph-memory**：源码版本、装配状态（未装配可一键「立即装配」，装配后需重启生效）、记忆库统计
- **dsh-market**：安装状态；未安装时显示安装命令与仓库链接
- **zat-dsh-engine**：插件市场引擎安装状态；未安装时显示安装命令与仓库链接，已安装时提示引擎就绪
- **dsh-hub 自身更新**：当前版本、最新版本、检查时间；「检查更新」按钮手动触发

## 数据与兼容

- 记忆文件路径与旧 dsh-memory 完全一致：`~/.dsh/memory/memories.jsonl`（支持 `$DSH_HOME` 覆盖），**升级不丢数据**。
- graph-memory 的数据库位于 `~/.dsh/graph-memory/graph-memory.db`，dsh-hub 只读统计，不写入。
- 若同时安装旧 dsh-plugin-updates 0.2.x，两者功能重叠，建议卸载旧插件（其功能已并入本插件）。

## 开发

```
lib/
  index.js       宿主端：更新引擎 + 记忆工具注册 + dshHub Remote 网关（10 个 Remote 方法）+ 客户端双源版本查询（queryClientRelease）
  client.js      客户端：设置页「插件中枢」Tab（中枢卡片 + 插件更新列表）
  typert.js      Typert Remote 定义（与 index.js 的 Remote 方法同步）
  memory-core.js 记忆核心（JSONL 读写、搜索评分、mtime 缓存）
```

维护铁律：

1. 新增 Remote 方法必须同步三处：`lib/index.js` 的 methods 列表、`lib/typert.js` 的 invocations、`lib/client.js` 的 REMOTE.descriptors；`lib/typert.js` 不可删除（否则 RPC 404）；
2. profile 的 `package.json` / `cordis.patch.yml` 一律经 `writeTextSafe()` 原子写入（`.tmp` + `.bak` + rename），不落半截文件；
3. 进 shell 的包名必须过 `validName` / `isValidName` 白名单；`curl` 一律 `shell:false` + `-f` + `--ssl-no-revoke`（Windows）；
4. `reconcileBundles` 只处理 dependencies 里读得到 package.json 的名字（不变量 #10，勿恢复 repairBundlesOrphans 逻辑）；
5. 不改动 graph-memory / dsh-market 本体，只做挂载与展示。

## 更新日志

### 1.1.4（2026-08-17）

- **内置 zat-dsh-engine 检测**：新增 zat-dsh-engine（插件市场引擎，`mishibeikejie/zat-dsh-engine`）状态检测，在「插件中枢」设置页显示安装状态、版本号与安装提示；未安装时提醒并给出安装命令与仓库链接，已安装时引导用户到插件市场
- **zat-dsh-engine 加入 KNOWN_CLIENT_PLUGIN_REPOS**：内置 `mishibeikejie/zat-dsh-engine` 的 GitHub 仓库映射，避免客户端插件更新时因本地副本缺少 repository 字段而无法识别来源

### 1.1.3（2026-08-17）

- 版本号升级至 1.1.3，准备 GitHub 发布

### 1.1.2（2026-08-17）

- 发布仓库改名为 `ARFCON/dsh-hub-DSH` 后的配套同步收尾：`publish.ps1` 默认 `RepoName` 改为 `dsh-hub-DSH`（避免 PowerShell 5.1 跟随旧名 301 重定向丢 Authorization 头导致全部上传 401）；`PUBLISH.md` 新增「上传全部 401」排查条目
- 版本号统一为 1.1.2：本地运行副本与发布套件 12 个文件全部哈希一致，发布后自身更新检查显示「已是最新」
- **新增「自身一键更新」**：设置页 dsh-hub 卡片检测到新版本时出现「更新到最新」按钮，一键从发布仓库 main 分支下载并覆盖本插件目录（保留 node_modules、带版本倒退保护与失败回滚），更新成功后本地版本号自动变为最新、立即显示「已是最新」，重启 DSH 后新代码生效

### 1.1.1（2026-08-17）

- **修复「更新后版本停留」**：三处根因全部修复并真实验证——
  - 客户端配套插件（assets/plugins）无 GitHub 来源时更新直接报错、到不了 npm 回退分支（billion-context-dsh 0.2.1→0.2.2 实测更新成功）
  - pnpm 11 的 `minimumReleaseAge` 供应链策略会静默抑制 `@latest` 对新发布包的解析（输出 "Already up to date" 版本停留）；改为先查 npm 最新版本、再用**显式版本** `pnpm add name@version`（dshmarket 1.8.0→1.11.0 实测更新成功），并增加「版本未变化即失败」断言
  - GitHub 来源的本地插件更新：jsDelivr 版本列表去掉了 v 前缀（真实 tag 是 v2.0.0 时返回 2.0.0），下载用 `tags/2.0.0` 必 404；下载端自动尝试 原 tag / v+tag / 去 v（实测下载成功）
- **修复「更新后插件崩溃/版本倒退」**：源码仓库 tag 与 package.json version 不一致时（如 graph-memory tag v2.0.0 包里 version=1.5.0），新增**版本倒退保护**（低于当前版本即回滚，实测拦截）与 **TS 源码入口强制构建**（main 指向 .ts 时不允许跳过 build，避免覆盖后 dist 产物丢失导致插件崩溃）
- **修复「检测不到自己的仓库」**：自身更新检查的 raw.githubusercontent.com 在国内不稳定（实测超时），新增 ghfast.top / gh-proxy.com 两个国内 raw 代理源，jsDelivr 降级为最终兜底（其缓存发布后可能短暂滞后）
- 发布仓库更名为 `ARFCON/dsh-hub-DSH`（原 DSH_Automatic-update-plugin），自更新源、发布脚本默认仓库、README/PUBLISH 链接全部同步

### 1.1.0（2026-08-17）

- 并入 dsh-plugin-updates 0.2.3 完整更新引擎：插件版本检查 / 单个与批量更新 / 启停 / 卸载 / 客户端配套插件更新 / Desktop 核心包检查 / 启动自检自动修复（repairAll）
- 设置页「插件中枢」Tab 整合：中枢状态卡片（记忆 / 图谱 / 市场 / 自更新）+ 插件更新列表（筛选、说明、更新按钮）
- 每个插件行新增「更新」按钮；新增「全部更新」批量按钮；修复结果与重启提示展示
- **原生适配 Gitee 版 DSH Desktop**（`my-yang-yunfan/dsh_desktop`）：客户端最新版本检查走 GitHub + Gitee 双源（与官方客户端 client-updater 同款端点与「取最高版本」语义，GitHub API 限流 403 时 Gitee 兜底），客户端区块显示最新版本与来源，一键打开 Gitee / GitHub 发布页

### 1.0.0（2026-08-17）

- 首个整合版本：dsh-memory 记忆功能并入（数据路径不变）+ graph-memory 检测/自动装配/状态统计 + dsh-market 检测联动 + 自身更新检查
- 设置页新增「插件中枢」Tab（zh/en 双语）
- 更新检查走 GitHub raw + jsDelivr 双源，规避 GitHub API 限流

[dsh-plugin-updates]: https://github.com/ARFCON/dsh-hub-DSH
