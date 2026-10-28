#!/usr/bin/env bash
# preflight.sh — 发布前预检 + 可选的 git 收尾（除了这些“询问后才执行”的动作外不改动仓库；绝不发布）
#
# 顺序：环境信息 → git status（强制打印）→ 测试/语法 → 版本号（询问）
#       → git add（询问）→ git commit（询问，信息自动带版本号）→ git push（询问）
#       → 打包与 dry-run 发布 → npm 登录
#
# 用法：
#   ./scripts/preflight.sh
#   ./scripts/preflight.sh --registry https://registry.npmjs.org/
#   NPM_REGISTRY=https://registry.npmjs.org/ ./scripts/preflight.sh
#
# 说明：
# - `git status --short` 每次都会执行并打印，不询问。
# - 版本号升级、git add/commit/push 都会依次询问 y/N，直接回车 = 跳过（默认不执行）。
# - 非交互环境（stdin 不是终端）或设置 NPM_PREFLIGHT_NO_GIT=1 时，
#   所有会改动仓库的动作（含版本号升级）自动跳过。
# - git commit 的信息固定为 `chore(release): v<package.json 里的版本号>`，版本号自动读取。
# - 发布必须指向 registry.npmjs.org；脚本显式覆盖，不修改全局 npm 配置。
# - 任何一个检查失败都会以非 0 退出。
# - 真正发布请运行 ./scripts/publish-npm.sh（两个脚本按文件名区分，没有“只检查”开关）。
set -euo pipefail

REGISTRY="${NPM_REGISTRY:-https://registry.npmjs.org/}"
BUMPED=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --registry)
      [[ $# -ge 2 ]] || { echo "✗ --registry 需要一个参数" >&2; exit 2; }
      REGISTRY="$2"; shift 2 ;;
    -h|--help) sed -n '2,22p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "✗ 未知参数：$1（--help 查看用法）" >&2; exit 2 ;;
  esac
done

PKG_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PKG_DIR"

read_version() {
  NAME=$(node -p "require('./package.json').name")
  VERSION=$(node -p "require('./package.json').version")
  SPEC="$NAME@$VERSION"
}

step() { printf '\n\033[1m== %s ==\033[0m\n' "$*"; }
note() { printf '  %s\n' "$*"; }
die()  { printf '\n✗ %s\n' "$*" >&2; exit 1; }

# 交互确认：默认跳过；非交互 / NPM_PREFLIGHT_NO_GIT=1 时一律跳过
confirm() {
  local prompt="$1"
  if [[ "${NPM_PREFLIGHT_NO_GIT:-0}" == "1" ]] || [[ ! -t 0 ]]; then
    note "非交互环境，跳过：$prompt"
    return 1
  fi
  local answer
  read -r -p "$prompt [y/N] " answer
  [[ "$answer" == [yY]* ]]
}

repo_clean() { [[ -z "$(git status --porcelain 2>/dev/null)" ]]; }

read_version

step "1/8 环境与待发布信息"
node --version
npm --version
note "包       ：$SPEC"
note "目录     ：$PKG_DIR"
note "registry ：$REGISTRY"

step "2/8 git 状态（强制）"
git status --short || true
if repo_clean; then
  note "工作区干净"
else
  note "⚠️  工作区不干净：npm pack 打的是当前工作区内容，未提交的改动也会随包发出去。"
fi

step "3/8 测试与语法检查"
npm test
npm run check

step "4/8 版本号"
if [[ "${NPM_PREFLIGHT_NO_GIT:-0}" == "1" ]] || [[ ! -t 0 ]]; then
  note "非交互环境，跳过版本号升级（当前 $VERSION）"
elif ! repo_clean; then
  note "工作区不干净：npm version 需要干净工作区，已跳过（当前 $VERSION）"
  note "可以在下面几步提交改动后重新运行本脚本"
else
  echo "是否需要升级版本号？"
  echo "  1) patch（升补丁位，例如 0.1.0 → 0.1.1）"
  echo "  2) minor（升次版本位，补丁归零，例如 0.1.0 → 0.2.0）"
  echo "  3) 跳过（保持 $VERSION）"
  read -r -p "选择 [1/2/3]（默认 3）：" BUMP
  BUMP="${BUMP:-3}"
  case "$BUMP" in
    1) npm version patch -m "chore(release): v%s"; BUMPED=1 ;;
    2) npm version minor -m "chore(release): v%s"; BUMPED=1 ;;
    3) note "保持当前版本 $VERSION" ;;
    *) die "无效选择：$BUMP（没有修改版本号）" ;;
  esac
  read_version
  note "当前版本：$VERSION"
fi

step "5/8 暂存改动（git add -A）"
if confirm "是否执行 git add -A（暂存全部改动）？"; then
  git add -A
  note "已暂存 $(git diff --cached --name-only | wc -l | tr -d ' ') 个文件"
else
  note "跳过 git add -A"
fi

step "6/8 提交（git commit）"
COMMIT_MSG="chore(release): v$VERSION"
if git diff --cached --quiet; then
  note "没有已暂存的改动，跳过提交"
elif confirm "是否提交？提交信息：$COMMIT_MSG"; then
  git commit -m "$COMMIT_MSG"
  note "已提交：$COMMIT_MSG"
else
  note "跳过提交"
fi

step "7/8 推送（git push）"
if ! git remote get-url origin >/dev/null 2>&1; then
  note "未配置 origin 远程，跳过推送"
elif confirm "是否执行 git push -u origin main？"; then
  git push -u origin main
  note "已推送 main"
else
  note "跳过推送"
fi
if [[ "$BUMPED" == "1" ]]; then
  note "本次升级了版本号，tag 仍在本地：记得 git push --follow-tags"
fi

step "8/8 打包、dry-run 发布与登录校验"
npm pack --dry-run
npm publish --dry-run --access public --registry "$REGISTRY"

if ! WHOAMI=$(npm whoami --registry "$REGISTRY" 2>&1); then
  printf '%s\n' "$WHOAMI" >&2
  die "npm 未登录或 token 失效。先执行：npm login --registry $REGISTRY"
fi
note "当前登录账号：$WHOAMI"

step "预检通过（未发布任何内容）"
note "待发布版本：$SPEC"
note "确认无误后执行：./scripts/publish-npm.sh"
