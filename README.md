# dsh-plugin-updates

DSH 插件更新检查与一键更新工具（设置页插件）。

> ### 🛡️ 启动即自检，错误自动修复
>
> 每次启动 DSH（**桌面客户端或终端都一样**），本插件加载后约 0.6 秒会自动运行**错误自检修复系统**，
> 先修复、再检查更新，全程无需任何手动操作：
>
> - 配置文件写一半崩溃（断电/杀进程）→ 自动从 `.tmp`/`.bak` 副本恢复
> - 插件更新被打断、入口文件缺失 → 自动从更新备份**完整还原**该插件
> - 配置残留 / 重复块 / 损坏缓存 → 自动清理、去重、重建
> - 本插件自身激活行丢失 → 自动补回（自保）
>
> 做了什么修复会在设置页顶部醒目展示；无提示即代表一切完好。

在 **设置 → 插件 → 插件更新** 里集中管理已安装插件的新旧：一眼看到谁有新版本，一键完成更新，
不用挨个跑命令。支持 npm registry 插件和 GitHub 源码插件，更新前自动备份、失败自动回滚。

> 与 DSH 内置「插件市场」的分工：市场负责搜索与安装新插件；本插件负责已安装插件的
> **版本对比、更新检查、一键更新**，以及启用/停用和卸载。

## 功能特性

- 显示 profile 已安装插件的当前版本 / 最新版本；DSH 启动时自动后台检查（不挤占启动）
- npm registry 插件：一键 `pnpm add <pkg>@latest` 更新
- GitHub 来源的本地插件：自动识别仓库（package.json repository / homepage / `.git/config` / README），
  从国内镜像（ghfast.top 等，自动回退 GitHub 直连）下载新版源码覆盖更新
- 插件启用 / 停用（重启生效）与卸载（自动清理激活行和 bundle 记录）
- **DSH Desktop 客户端**区块：只读检查内置 @deepseek-ai 核心包版本
- **客户端插件**区块：检查 Desktop 配套插件（assets/plugins）的 GitHub/npm 最新版并支持更新
- 版本比较遵循 semver（含预发布段数字比较），rc 预发布版本不会误判为可更新
- 稳定性设计：**启动自检自动修复**（每次启动先修复再检查：崩溃残留恢复、配置清理去重、损坏插件从备份还原）；更新/卸载/启停串行排队防并发冲突；关键配置文件原子写入（崩溃不留半截文件）；npm 查询瞬时失败自动重试
- 跨平台：Windows / macOS / Linux（外部命令按系统自动选择）

## 页面状态说明

| 标签 / 状态 | 含义 |
| --- | --- |
| `GitHub` | 识别出 GitHub 仓库的本地源码插件，可自动更新 |
| `本地源码` | link 安装的本地插件，未识别出 GitHub 来源，需手动更新 |
| `Git 源` | `github:` / git URL 方式安装的依赖，需到源码仓库手动更新 |
| `bundle` | 声明了 dsh.bundle 的插件（安装/更新后自动校对 bundles 数组） |
| `开发者` | GitHub owner 匹配 `DSH_PLUGIN_DEV_GITHUB` 环境变量的插件（可选） |
| `已停用` | 通过本页停用（写 cordis.patch.yml disable 块），重启后生效 |
| 有更新 / 已是最新 | 与 npm 最新版或 GitHub 最新 release/tag 比较（semver） |

## 环境要求

- DSH（CLI 或 DSH Desktop）+ pnpm
- Windows（install.ps1）或 macOS / Linux（install.sh；Linux 解压 zip 需要 `unzip`，如 `sudo apt install unzip`）
- DSH Desktop 客户端区块的目录探测覆盖三系统常见安装位置，找不到时该区块自动隐藏，不影响其它功能

## 安装

### 一键安装

**Windows（PowerShell）**：下载/克隆本仓库后进入插件目录：

```powershell
cd dsh-plugin-updates     # 进入仓库目录
.\install.ps1             # 默认安装到 web profile
.\install.ps1 -Profile cc-tui   # 指定其他 profile
```

**macOS / Linux（终端）**：

```bash
cd dsh-plugin-updates     # 进入仓库目录
chmod +x install.sh
./install.sh              # 默认安装到 web profile
./install.sh cc-tui       # 指定其他 profile
```

安装脚本会自动：备份旧版本 → 复制源码并安装依赖 → 注册到 profile → 补激活行；失败自动回滚。

安装后：**重启 DSH 服务**（否则页面仍显示旧缓存），打开 设置 → 插件 → 插件更新。

### 手动安装

以下为 PowerShell 示例，macOS / Linux 同理（路径改为 `~/.dsh/...`）。

1. 把插件目录复制到 DSH 插件源码目录：

   ```powershell
   $src = (Get-Location).Path
   $dst = Join-Path $HOME '.dsh\plugin-src\dsh-plugin-updates'
   Copy-Item $src $dst -Recurse -Exclude node_modules
   ```

2. 安装依赖并加入 profile：

   ```powershell
   Set-Location $dst
   pnpm install
   dsh plugin --profile web add "link:$dst"
   ```

3. 给 `~/.dsh/profiles/web/cordis.patch.yml` 末尾追加激活行：

   ```yaml
   - insert:
       - id: plugin-updates
         name: 'dsh-plugin-updates'
         config: {}
   ```

4. 重启 DSH 服务。

## 卸载

推荐直接在设置页的插件更新页里点「卸载」（自动清理激活行和 bundle 记录）；或用命令行：

```powershell
dsh plugin --profile web remove dsh-plugin-updates
```

然后删除 `~/.dsh/profiles/web/cordis.patch.yml` 里的 plugin-updates 块，重启 DSH 服务。

## 目录结构

```
dsh-plugin-updates/
├─ lib/
│  ├─ index.js     # 宿主端：Remote 服务 + 版本检查/镜像下载/备份回滚
│  ├─ client.js    # 浏览器端：设置页 Tab UI（React）
│  └─ typert.js    # Typert 严格声明（必需，否则设置页 RPC 404）
├─ install.ps1     # 一键安装（Windows）
├─ install.sh      # 一键安装（macOS / Linux）
├─ publish.ps1     # 维护者发布脚本
├─ PUBLISH.md      # 维护者发布说明
└─ LICENSE         # MIT
```

## 常见问题

- **为什么很多插件显示「本地源码，手动更新」？**
  这些插件的 package.json 没有 GitHub 来源信息且源码目录没有 `.git/config`。补上 repository 字段，或用 git clone 方式安装，就能自动识别 GitHub 最新版本。
- **自动更新会覆盖我的本地改动吗？**
  会。GitHub 源码插件点「更新」前会弹窗确认；更新前会完整备份到 `<profile>/.plugin-updates-backups/`，失败自动回滚，回滚失败时会保留备份并提示路径。如需保留本地改动请先手动备份。
- **从第三方镜像更新安全吗？**
  更新包走第三方镜像（ghfast.top → gh-proxy.com → ghproxy.net → GitHub 直连）且未做哈希校验，属于对镜像站的信任假设；介意的话请点 GitHub 按钮手动下载。
- **版本检查走什么网络？**
  npm 包：registry 元数据接口（自动跟随你 npm 配置的源，配了国内镜像即走镜像）；GitHub 仓库：GitHub API，限流时自动回退 jsDelivr 数据接口。
- **Linux 上更新报「解压 zip 失败」？**
  Linux 的 GNU tar 不支持 zip，安装 unzip 后重试：`sudo apt install unzip`。
- **为什么需要 lib/typert.js？**
  DSH 的动态第三方 Remote 必须提供 zod v4 严格 Typert 声明，否则设置页调用会返回 HTTP 404。

## 更新日志

- **0.2.2**：**修复一个会破坏 DSH 启动的严重 bug**——启动自检里的「bundle 孤儿清理」错误地把应用内置的核心 bundle（dsh-base、dsh-web-app 等 10 项，它们不在 profile dependencies 里）从 `dsh.profile.bundles` 移除，导致核心服务无法激活、DSH Desktop 打不开。已彻底移除该清理逻辑，并加固 `reconcileBundles`（包信息读不到时跳过，不做增删判断）
- **0.2.1**：更新大幅提速——依赖未变的插件更新**跳过 pnpm install**（node_modules 移入备份再移回，瞬时完成，省 10-60s/个）；「全部更新」对 registry 插件改为**一条 pnpm add 批量更新**（一个进程替代 N 个）；`git:` 源插件现在也显示 GitHub 最新版本和链接（更新仍手动）；无桌面桥接（终端模式）时重启提示给出明确的手动重启指引；.npmrc 的 registry 值兼容带引号
- **0.2.0**：检查明显提速——GitHub 查询并发 2→6；registry 地址直接读 `.npmrc`（不再每次启动 spawn `npm config get registry`，约省 0.5-1s）；npm 版本查询改为 `curl --parallel` 批量（单进程并发 + 连接复用，旧 curl 自动回退单发）。「全部更新」纳入客户端插件（assets/plugins），按钮计数同步包含
- **0.1.9**：新增「全部更新 (N)」一键按钮（逐个串行更新，复用宿主互斥锁；本地源码插件逐个确认）；卸载时自动清理该插件遗留的更新备份；README 顶部醒目标注启动自动修复能力
- **0.1.8**：启动自检自动修复系统——每次启动（客户端或终端）加载插件后约 0.6 秒先运行修复再检查更新：原子写崩溃残留自动恢复（.tmp/.bak）、cordis.patch.yml 孤立行清理与重复块去重、损坏缓存重建、bundle 记录校对、入口缺失的插件自动从更新备份还原、自身激活行自保；修复动作会在页面顶部展示
- **0.1.7**：检查提速——npm 版本查询改为 curl 直连 registry 元数据接口（自动跟随 npm 配置的镜像源，5 分钟缓存，npm view 仅兜底）；GitHub 限流时回退 jsDelivr 数据接口查最新 tag
- **0.1.6**：打开设置页时后台检查完成后自动刷新显示（无需手动点重新检查）；curl 参数按平台适配
- **0.1.5**：跨平台支持（curl/tar 按系统选择、Linux 用 unzip 解压、Desktop 目录含 macOS/Linux 候选、新增 install.sh）；检查四阶段并行执行
- **0.1.4**：关键配置文件原子写入；客户端插件目录读取失败自动跳过；列表有更新的置顶
- **0.1.3**：写操作互斥排队；npm 查询重试；来源识别并行化
- **0.1.2**：npm 查询统一包名白名单；更新备份移到 profile 持久目录；semver 预发布段按数值比较；缓存优化
- **0.1.1**：初始版本

## 许可证

MIT License，详见 [LICENSE](LICENSE)。维护者发布说明见 [PUBLISH.md](PUBLISH.md)。
