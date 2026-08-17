# 发布指南（给维护者）

本目录是 dsh-hub 的完整发布套件。发布后 GitHub 仓库同时是**安装源**与**自身更新检查源**（`ARFCON/dsh-hub-DSH` 的 `package.json` version 会被 dsh-hub 用于对比本地版本）。

## 发布前检查

1. **版本号同步**：`package.json` 的 `version` 必须与本次发布一致（dsh-hub 自更新检查读的就是它）。
2. `lib/` 四个文件齐全：`index.js` / `client.js` / `typert.js` / `memory-core.js`。
3. 改过 Remote 方法？检查三处同步（`lib/index.js` methods、`lib/typert.js` invocations、`lib/client.js` REMOTE.descriptors）。
4. README.md 与 PUBLISH.md 里**不要出现本机路径**（如 `C:\Users\...`、`D:\y\...`），只写 `~/.dsh` 相对路径。

## 发布

```powershell
# 在插件目录（含 publish.ps1）里执行
.\publish.ps1
```

- Token 优先级：`-Token` 参数 > `$env:GH_TOKEN` > `$env:GITHUB_TOKEN` > 交互式安全输入（不会写入历史）。
- **推荐 fine-grained token，只授予本仓库 `Contents: Read and write`**。
- 默认推送到 `ARFCON/dsh-hub-DSH` 的 `main` 分支（仓库已存在则只更新文件；不存在则自动创建）。
- 上传文件列表见 `publish.ps1` 的 `$files`（README / LICENSE / PUBLISH / package.json / pnpm-lock.yaml / install 脚本 / publish 脚本 / lib 四个文件）。新增文件记得加进列表。

## 发布后验证

1. 打开 `https://github.com/ARFCON/dsh-hub-DSH`，确认文件与本地一致。
2. 本机：设置 → 插件 → 插件中枢 → 检查更新，应显示与 `package.json` 一致的版本。
3. 其他机器：解压后运行 `install.ps1` / `install.sh` 验证全新安装。

## 常见问题

- **HTTP 403**：GitHub API 限流或 token 权限不足。检查 token 是否只给了 Contents 权限且已认证；匿名 API 一小时 60 次，发布脚本用 token 不受此限。
- **上传全部 401 但「GitHub user」正常显示**：仓库改名后旧名 URL 会 301 重定向，PowerShell 5.1 跟随重定向时不携带 Authorization 头 → 全部 401。解决：把 `publish.ps1` 的 `$RepoName` 改成当前仓库名（本仓库已改名 `dsh-hub-DSH`）；改名后务必同步 `lib/index.js` 的 `UPDATE_REPO` 与 README / PUBLISH.md 中的仓库链接，否则自身更新检查与安装指引会指向已失效的旧名。
- **上传失败但文件已存在**：`contents` API 需要 `sha`，脚本会自动读取已有文件 sha；若仓库文件被外部改动导致冲突，手动删掉该文件重试。
- **安装后设置页没有「插件中枢」Tab**：确认 `cordis.patch.yml` 里有 `- id: dsh-hub` / `name: 'dsh-hub'` 激活行，且已重启 DSH。
