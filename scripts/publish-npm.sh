#!/usr/bin/env bash
# publish-npm.sh — 发布到 npm（会真正发布）
#
# 流程：预检（调用 scripts/preflight.sh）→ 发布确认 → 交互输入 2FA OTP
#       → npm publish → 发布后验证
#
# 用法：
#   ./scripts/publish-npm.sh
#   ./scripts/publish-npm.sh --registry https://registry.npmjs.org/
#
# 说明：
# - 本脚本没有“只检查”的开关；只想预检请运行 ./scripts/preflight.sh。
# - 预检阶段不会升级版本号、也不会执行 git add/commit/push（避免发布过程中改动仓库）；
#   要做这些请先跑 preflight.sh。
# - 发布必须指向 registry.npmjs.org；脚本显式覆盖，不修改全局 npm 配置。
# - OTP 为空时按“账号未开 2FA”处理；OTP 失效会重新询问，最多 3 次。
# - 任何一步失败即中止。
set -euo pipefail

REGISTRY="${NPM_REGISTRY:-https://registry.npmjs.org/}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --registry)
      [[ $# -ge 2 ]] || { echo "✗ --registry 需要一个参数" >&2; exit 2; }
      REGISTRY="$2"; shift 2 ;;
    -h|--help) sed -n '2,15p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "✗ 未知参数：$1（--help 查看用法）" >&2; exit 2 ;;
  esac
done

PKG_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PKG_DIR"

NAME=$(node -p "require('./package.json').name")
VERSION=$(node -p "require('./package.json').version")
SPEC="$NAME@$VERSION"

step() { printf '\n\033[1m== %s ==\033[0m\n' "$*"; }
note() { printf '  %s\n' "$*"; }
die()  { printf '\n✗ %s\n' "$*" >&2; exit 1; }

step "1/3 预检（scripts/preflight.sh）"
[[ -f "$PKG_DIR/scripts/preflight.sh" ]] || die "缺少 scripts/preflight.sh，无法预检"
NPM_REGISTRY="$REGISTRY" NPM_PREFLIGHT_NO_GIT=1 bash "$PKG_DIR/scripts/preflight.sh"

# 预检里的版本升级与 git 动作都被禁用；这里重新读取，确保确认与验证用同一版本
NAME=$(node -p "require('./package.json').name")
VERSION=$(node -p "require('./package.json').version")
SPEC="$NAME@$VERSION"

step "2/3 发布到 npm"
note "目标：$SPEC → $REGISTRY"
read -r -p "确认发布？输入 yes 继续（其他输入取消）：" CONFIRM
[[ "$CONFIRM" == "yes" ]] || die "已取消，未发布任何内容"

attempt=0
while :; do
  read -r -p "请输入 npm 2FA 验证码 OTP（未开 2FA 直接回车）：" OTP
  OTP="${OTP//[[:space:]]/}"
  args=(publish --registry "$REGISTRY")
  [[ -n "$OTP" ]] && args+=("--otp=$OTP")

  if output=$(npm "${args[@]}" 2>&1); then
    printf '%s\n' "$output"
    break
  fi
  printf '%s\n' "$output" >&2
  if grep -qiE 'EOTP|one[- ]time password|otp' <<<"$output" && (( attempt < 2 )); then
    attempt=$((attempt + 1))
    echo
    echo "⚠️  OTP 无效或已过期，重新输入（重试 $attempt/2）"
    continue
  fi
  die "发布失败（上面是 npm 的原始输出）"
done

step "3/3 验证已发布"
npm view "$SPEC" version repository.url dist.tarball --registry "$REGISTRY" --json
LATEST=$(npm view "$NAME" dist-tags.latest --registry "$REGISTRY")
note "dist-tags.latest：$LATEST"
[[ "$LATEST" == "$VERSION" ]] || echo "⚠️  latest 不是本次版本（$LATEST ≠ $VERSION），检查是否覆盖了别的 tag"

TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT
npm pack "$SPEC" --registry "$REGISTRY" --pack-destination "$TMP_DIR" >/dev/null
TGZ=$(ls "$TMP_DIR"/*.tgz | head -1)
echo
echo "从 registry 下载的 tarball：$TGZ"
tar -tzf "$TGZ" | grep -E 'cordis\.patch\.yml|lib/client\.js|locale/' \
  || die "tarball 里缺少插件运行必需的文件（cordis.patch.yml / lib/client.js / locale）"
note "tarball 关键文件齐全"

if command -v dsh >/dev/null 2>&1; then
  echo
  read -r -p "是否在临时 profile（web-npm-test）试装 $SPEC？[y/N] " INSTALL_TEST
  if [[ "$INSTALL_TEST" == [yY]* ]]; then
    dsh plugin --profile web-npm-test add "$SPEC"
    echo
    note "试装完成：启动 dsh web 打开 Plugins 页面确认插件已加载"
    note "验证完清理：dsh plugin --profile web-npm-test remove $NAME"
  fi
fi

step "完成"
note "$SPEC 已发布到 $REGISTRY"
note "记得：git tag v$VERSION && git push origin v$VERSION"
