# dsh-plugin-updates

DSH 插件更新检查与一键更新工具（设置页插件）。

## 功能

- 在 **设置 → 插件 → 插件更新** 中显示已安装插件的当前版本与最新版本
- 每次 DSH 启动时自动检查更新
- npm registry 插件：一键 `pnpm add <pkg>@latest` 更新
- GitHub 来源的本地插件：自动识别仓库（package.json repository / homepage / .git/config），从国内镜像（ghfast.top 等）下载新版源码并覆盖更新（会先备份、保留 node_modules、失败自动回滚）
- 新增 **DSH Desktop 客户端** 区块：只读检查 Desktop 内置 @deepseek-ai 核心包版本
- 版本比较使用 semver 规范化，不会把 rc 预发布版本误判为可更新

## 目录结构

```
dsh-plugin-updates/
├─ lib/
│  ├─ index.js     # 宿主端（Remote 服务 + 更新检查/下载）
│  ├─ client.js    # 浏览器端（设置页 Tab UI）
│  └─ typert.js    # Typert 严格声明（必需，否则 RPC 404）
├─ package.json
├─ pnpm-lock.yaml
├─ README.md
├─ LICENSE        # MIT 开源协议
├─ PUBLISH.md     # 维护者发布说明
├─ install.ps1    # 一键安装脚本
└─ publish.ps1    # 维护者发布脚本
```

## 环境要求

- 已安装 DSH（CLI 或 DSH Desktop）
- 已安装 pnpm（dsh plugin 依赖 pnpm）
- Windows（脚本与 curl/tar 均按 Windows 编写）

## 一键安装

1. 把 dsh-plugin-updates 文件夹（或解压 zip）放到任意位置
2. 打开 PowerShell，进入该目录：

   ```powershell
   cd D:\y\a\dsh-plugin-updates
   .\install.ps1                 # 默认安装到 web profile
   .\install.ps1 -Profile cc-tui # 也可以指定其他 profile
   ```

3. **重启 DSH 服务**（DSH Desktop 重启，或重启 dsh --profile web）——必须重启，否则页面仍会显示旧缓存数据
4. 打开 设置 → 插件 → 插件更新；如果看到的是旧数据，点一次右上角「重新检查」

## 手动安装

1. 把插件目录放到 DSH 插件源码目录：

   ```powershell
   $src = (Get-Location).Path
   $dst = Join-Path $HOME '.dsh\plugin-src\dsh-plugin-updates'
   Copy-Item $src $dst -Recurse -Exclude node_modules
   ```

2. 安装依赖：

   ```powershell
   Set-Location $dst
   pnpm install
   ```

3. 加入 profile（以 web 为例）：

   ```powershell
   dsh plugin --profile web add "link:$dst"
   ```

4. 给 cordis.patch.yml 追加激活行（手动编辑 ~/.dsh/profiles/web/cordis.patch.yml，在末尾追加）：

   ```yaml
   - insert:
       - id: plugin-updates
         name: 'dsh-plugin-updates'
         config: {}
   ```

5. 重启 DSH 服务。

## 卸载

```powershell
dsh plugin --profile web remove dsh-plugin-updates
```

然后删除 ~/.dsh/profiles/web/cordis.patch.yml 里的 plugin-updates 块，重启 DSH 服务。


## 开发者识别（可选）

如果你是这个插件的作者，想让自己开发的插件在列表里显示“开发者”徽标，设置一个环境变量即可（只用于识别，不读取任何本机信息）：

```powershell
$env:DSH_PLUGIN_DEV_GITHUB = "你的 GitHub 用户名"
```

重启 DSH 后，GitHub 来源 owner 匹配该用户名的插件会显示“开发者”标签。
## 常见问题

- **为什么很多插件显示“本地源码，手动更新”？**
  这些插件的 package.json 没有 GitHub 来源信息且源码目录没有 .git/config。补上 repository 字段，或用 git clone 方式安装，就能自动识别 GitHub 最新版本。
- **自动更新会覆盖我的本地改动吗？**
  会。GitHub 源码插件点“更新”前会弹窗确认；更新前会备份非 node_modules 内容，失败自动回滚。如需保留本地改动请先手动备份。
- **镜像下载失败怎么办？**
  会自动依次尝试 ghfast.top → gh-proxy.com → ghproxy.net → GitHub 直连。仍失败可点行内的 GitHub 按钮打开仓库手动下载。
- **为什么需要 lib/typert.js？**
  DSH 的动态第三方 Remote 必须提供 zod v4 严格 Typert 声明，否则设置页调用会返回 HTTP 404。

## 许可证

MIT License。详见 LICENSE 文件。

## 版本

- 当前版本：0.1.1（2026-08-16 增强版）

> 维护者发布说明见 [PUBLISH.md](PUBLISH.md)。



