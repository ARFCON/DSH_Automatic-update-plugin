# 发布说明（维护者专用）

本文档说明如何把 dsh-plugin-updates 发布到 GitHub。普通使用者不需要阅读，也不需要 token。

## 准备 Token（最小权限）

1. 打开 GitHub → Settings → Developer settings → Fine-grained personal access tokens
2. Generate new token，Repository access 选择：
   - `Only select repositories` → 勾选目标仓库（例如 `DSH_Automatic-update-plugin`）
3. Repository permissions 只开一项：
   - **Contents: Read and write**（上传文件必需）
4. 生成后复制

> 安全提醒：
> - 不要把 token 贴到聊天、工单、日志或公开文档里。
> - 如果 token 曾出现在任何不安全的上下文（例如聊天记录），请立即到 token 页面 **Revoke**，并重新生成。
> - 发布完成后如不再使用，也建议撤销。

## 运行发布（推荐：安全交互输入）

直接运行脚本，它会安全地提示你粘贴 token（输入内容不显示、不进 shell 历史）：

```powershell
.\publish.ps1 -RepoName DSH_Automatic-update-plugin
# 提示: GitHub token (will not be shown or saved to history)
# 直接粘贴回车即可
```

也可以先设环境变量（注意：`$env:GH_TOKEN = "..."` 这条命令本身会留在终端历史里，仅适合一次性使用且不介意历史记录）：

```powershell
$env:GH_TOKEN = "在这里粘贴你的 token"   # 仅当前 PowerShell 窗口生效
.\publish.ps1 -RepoName DSH_Automatic-update-plugin
```

脚本会：
1. 自动获取令牌对应的 GitHub 用户名
2. 仓库不存在时自动创建
3. 用 REST API 上传 README、LICENSE、package.json、源码、安装/发布脚本
4. 输出仓库地址

## 遇到 403 Forbidden

如果上传返回 `Resource not accessible by personal access token`，说明 token 缺少写权限。请检查：
- Repository access 是否勾选了目标仓库
- Contents 是否为 **Read and write**
- 是否点击了 Save changes

不要反复重试同一个 token；确认权限已保存后再运行。
