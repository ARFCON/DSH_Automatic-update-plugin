#!/usr/bin/env bash
# dsh-plugin-updates installer（macOS / Linux；Windows 请用 install.ps1）
set -euo pipefail

PROFILE="${1:-web}"
SOURCE="$(cd "$(dirname "$0")" && pwd)"
DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
TARGET="$DSH_HOME/plugin-src/dsh-plugin-updates"
PROFILE_DIR="$DSH_HOME/profiles/$PROFILE"
PATCH_FILE="$PROFILE_DIR/cordis.patch.yml"

echo "== dsh-plugin-updates installer =="
echo "Source : $SOURCE"
echo "Target : $TARGET"
echo "Profile: $PROFILE"

command -v pnpm >/dev/null 2>&1 || { echo 'pnpm not found on PATH. Install pnpm first: https://pnpm.io/installation' >&2; exit 1; }
command -v dsh  >/dev/null 2>&1 || { echo 'dsh not found on PATH. Add the dsh CLI to PATH.' >&2; exit 1; }

# 1. 备份已存在的插件目录（保留副本，不做改名）
backup=""
if [ -d "$TARGET" ]; then
  backup="$TARGET.bak-$(date +%Y%m%d%H%M%S)"
  echo "Existing plugin found. Backing up to: $backup"
  cp -R "$TARGET" "$backup"
  echo 'Removing old plugin directory for a clean install...'
  rm -rf "$TARGET"
fi

# 2. 快照 patch 文件，失败时回滚
patch_existed=false
if [ -f "$PATCH_FILE" ]; then
  patch_existed=true
  cp "$PATCH_FILE" "$PATCH_FILE.pre-install"
fi

restore() {
  echo "Install failed, restoring previous state..." >&2
  if [ -n "$backup" ] && [ -d "$backup" ]; then
    rm -rf "$TARGET" || true
    cp -R "$backup" "$TARGET" || true
  fi
  if [ "$patch_existed" = true ]; then
    mv -f "$PATCH_FILE.pre-install" "$PATCH_FILE" || true
  elif [ -f "$PATCH_FILE" ]; then
    rm -f "$PATCH_FILE" || true
    rm -f "$PATCH_FILE.pre-install" || true
  fi
}
trap restore ERR

# 3. 复制插件源码（node_modules 不复制，稍后安装）
mkdir -p "$TARGET"
cp -R "$SOURCE/lib" "$TARGET/"
cp "$SOURCE/package.json" "$TARGET/"
if [ -f "$SOURCE/pnpm-lock.yaml" ]; then cp "$SOURCE/pnpm-lock.yaml" "$TARGET/"; fi

# 4. 安装依赖
echo 'Installing dependencies with pnpm...'
( cd "$TARGET" && pnpm install --no-frozen-lockfile )

# 5. 加入 profile（pnpm add link:... + bundle 校对）
echo "Adding plugin to profile '$PROFILE'..."
dsh plugin --profile "$PROFILE" add "link:$TARGET"

# 6. 确保激活行存在
mkdir -p "$PROFILE_DIR"
if [ -f "$PATCH_FILE" ] && grep -q "name: 'dsh-plugin-updates'" "$PATCH_FILE"; then
  echo 'cordis.patch.yml already contains the dsh-plugin-updates row.'
else
  printf -- "- insert:\n    - id: plugin-updates\n      name: 'dsh-plugin-updates'\n      config: {}\n" >> "$PATCH_FILE"
  echo 'Added dsh-plugin-updates row to cordis.patch.yml.'
fi

trap - ERR
rm -f "$PATCH_FILE.pre-install"

if [ -n "$backup" ]; then
  echo ''
  echo "Backup of the previous version is kept at: $backup"
  echo 'You can delete it after confirming the new version works.'
fi

echo ''
echo 'Install done.'
echo 'Next: restart DSH service, then open Settings -> Plugins -> Plugin updates.'
