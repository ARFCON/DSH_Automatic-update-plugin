param(
  [string]$Profile = 'web'
)

$ErrorActionPreference = 'Stop'
$Source = $PSScriptRoot
$DshHome = if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $HOME '.dsh' }
$Target = Join-Path $DshHome "plugin-src\dsh-hub"
$ProfileDir = Join-Path $DshHome "profiles\$Profile"
$PatchFile = Join-Path $ProfileDir 'cordis.patch.yml'

Write-Host "== dsh-hub installer =="
Write-Host "Source : $Source"
Write-Host "Target : $Target"
Write-Host "Profile: $Profile"

# 1. Prerequisites
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Error 'pnpm not found on PATH. Install pnpm first: https://pnpm.io/installation'
}
if (-not (Get-Command dsh -ErrorAction SilentlyContinue)) {
  Write-Error 'dsh not found on PATH. Run this inside a DSH environment or add the dsh CLI to PATH.'
}

# 2. Backup existing plugin (real copy, kept as a sibling; never renamed away)
$backup = $null
if (Test-Path $Target) {
  $backup = "$Target.bak-$(Get-Date -Format yyyyMMddHHmmss)"
  Write-Host "Existing plugin found. Backing up to: $backup"
  Copy-Item -Path $Target -Destination $backup -Recurse -Force
  Write-Host 'Removing old plugin directory for a clean install...'
  Remove-Item -Path $Target -Recurse -Force
}

# Snapshot the patch file before any modification so we can roll it back too.
$patchExisted = Test-Path -Path $PatchFile
$patchOriginal = $null
if ($patchExisted) {
  $patchOriginal = Get-Content -Path $PatchFile -Raw
}

try {
  # 3. Copy plugin source (node_modules is excluded; dependencies installed below)
  New-Item -ItemType Directory -Path $Target -Force | Out-Null
  Copy-Item -Path (Join-Path $Source 'lib') -Destination $Target -Recurse -Force
  Copy-Item -Path (Join-Path $Source 'package.json') -Destination $Target -Force
  Copy-Item -Path (Join-Path $Source 'pnpm-lock.yaml') -Destination $Target -Force -ErrorAction SilentlyContinue

  # 4. Install dependencies
  Write-Host 'Installing dependencies with pnpm...'
  Push-Location $Target
  try {
    pnpm install --no-frozen-lockfile
    if ($LASTEXITCODE -ne 0) { throw "pnpm install failed (exit $LASTEXITCODE)" }
  } finally {
    Pop-Location
  }

  # 5. Add to profile via dsh plugin (pnpm add link:... + bundle reconcile)
  Write-Host "Adding plugin to profile '$Profile'..."
  & dsh plugin --profile $Profile add "link:$Target"
  if ($LASTEXITCODE -ne 0) { throw "dsh plugin add failed (exit $LASTEXITCODE)" }

  # 6. Ensure the cordis.patch.yml activation row exists (rollback-safe)
  if (-not (Test-Path $ProfileDir)) {
    New-Item -ItemType Directory -Path $ProfileDir -Force | Out-Null
  }
  $row = "- insert:`n    - id: dsh-hub`n      name: 'dsh-hub'`n      config: {}`n"
  $patchText = if (Test-Path $PatchFile) { Get-Content -Path $PatchFile -Raw } else { '' }
  if ($patchText -match "name: 'dsh-hub'") {
    Write-Host 'cordis.patch.yml already contains the dsh-hub row.'
  } else {
    $utf8 = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::AppendAllText($PatchFile, $row, $utf8)
    Write-Host 'Added dsh-hub row to cordis.patch.yml.'
  }
} catch {
  Write-Warning "Install failed: $($_.Exception.Message)"
  if ($backup -and (Test-Path $backup)) {
    Write-Warning 'Restoring previous plugin version...'
    if (Test-Path $Target) { Remove-Item -Path $Target -Recurse -Force }
    Copy-Item -Path $backup -Destination $Target -Recurse -Force
  }
  # Roll back the patch file to its pre-install snapshot too.
  if ($patchExisted) {
    if ($null -ne $patchOriginal) {
      Write-Warning 'Restoring previous cordis.patch.yml...'
      $utf8 = New-Object System.Text.UTF8Encoding($false)
      [System.IO.File]::WriteAllText($PatchFile, $patchOriginal, $utf8)
    }
  } elseif (Test-Path -Path $PatchFile) {
    Write-Warning 'Removing cordis.patch.yml created by this failed install...'
    Remove-Item -Path $PatchFile -Force
  }
  throw
}

if ($backup) {
  Write-Host ''
  Write-Host "Backup of the previous version is kept at: $backup"
  Write-Host 'You can delete it after confirming the new version works.'
}

Write-Host ''
Write-Host 'Install done.'
Write-Host 'Next: restart DSH service (DSH Desktop restart, or restart dsh web), then open Settings -> Plugins -> Plugin hub (插件中枢).'
