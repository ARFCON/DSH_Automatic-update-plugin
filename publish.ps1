param(
  [string]$Token = '',
  [string]$RepoName = 'dsh-hub-DSH',
  [string]$Description = 'dsh-hub: DSH plugin hub — global memory, graph-memory / dsh-market mount & status, self update check',
  [switch]$Private
)

$ErrorActionPreference = 'Stop'
$Source = $PSScriptRoot

# Token resolution order: -Token parameter > $GH_TOKEN > $GITHUB_TOKEN > interactive secure prompt.
if ([string]::IsNullOrEmpty($Token)) { $Token = $env:GH_TOKEN }
if ([string]::IsNullOrEmpty($Token)) { $Token = $env:GITHUB_TOKEN }
if ([string]::IsNullOrEmpty($Token)) {
  $secure = Read-Host -AsSecureString 'GitHub token (will not be shown or saved to history)'
  $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    $Token = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  } finally {
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}
if ([string]::IsNullOrEmpty($Token)) {
  Write-Error 'No GitHub token provided. Set $env:GH_TOKEN, $env:GITHUB_TOKEN, or run again and paste when prompted.'
}

$Headers = @{
  Authorization = "Bearer $Token"
  'User-Agent'  = 'dsh-hub-publisher'
  Accept        = 'application/vnd.github+json'
}

Write-Host '== dsh-hub GitHub publisher =='
Write-Host 'Tip: for a fine-grained token, only grant Contents: Read and write on this repository.'

# 1. Resolve the account owning the token
$me = Invoke-RestMethod -Uri 'https://api.github.com/user' -Headers $Headers -Method Get
$owner = $me.login
Write-Host "GitHub user: $owner"

# 2. Create the repository if it does not exist
$repoUrl = "https://api.github.com/repos/$owner/$RepoName"
try {
  $null = Invoke-RestMethod -Uri $repoUrl -Headers $Headers -Method Get
  Write-Host "Repository already exists: $repoUrl"
} catch {
  $body = @{
    name        = $RepoName
    description = $Description
    private     = [bool]$Private
    auto_init   = $false
  } | ConvertTo-Json
  $null = Invoke-RestMethod -Uri 'https://api.github.com/user/repos' -Headers $Headers -Method Post -Body $body -ContentType 'application/json'
  Write-Host "Created repository: $repoUrl"
}

# 3. Upload files (first file creates the default branch)
function Upload-File {
  param([string]$Path, [string]$LocalFile)
  $uri = "https://api.github.com/repos/$owner/$RepoName/contents/$Path"
  $bytes = [System.IO.File]::ReadAllBytes($LocalFile)
  $content = [Convert]::ToBase64String($bytes)
  $payload = @{
    message = "Add or update $Path"
    content = $content
    branch  = 'main'
  }
  try {
    $existing = Invoke-RestMethod -Uri $uri -Headers $Headers -Method Get
    $payload.sha = $existing.sha
  } catch {
    # File does not exist yet; no sha needed
  }
  try {
    $null = Invoke-RestMethod -Uri $uri -Headers $Headers -Method Put -Body ($payload | ConvertTo-Json) -ContentType 'application/json'
    Write-Host "Uploaded: $Path"
  } catch {
    Write-Warning "Failed to upload $Path : $($_.Exception.Message)"
  }
}

$files = @(
  'README.md',
  'LICENSE',
  'PUBLISH.md',
  'package.json',
  'pnpm-lock.yaml',
  'install.ps1',
  'install.sh',
  'publish.ps1',
  'lib/index.js',
  'lib/client.js',
  'lib/typert.js',
  'lib/memory-core.js'
)
foreach ($file in $files) {
  $local = Join-Path $Source ($file -replace '/', '\')
  if (-not (Test-Path $local)) {
    Write-Warning "Missing local file: $local"
    continue
  }
  Upload-File -Path $file -LocalFile $local
}

Write-Host ''
Write-Host "Done: https://github.com/$owner/$RepoName"
Write-Host 'Next: open the repo, add topics (dsh-plugin, dsh, memory, plugin-hub), and enjoy.'
