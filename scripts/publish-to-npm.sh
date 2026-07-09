#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== outerloop npm publish ==="

if ! npm whoami >/dev/null 2>&1; then
  echo "ERROR: Not logged in to npm (or token expired)."
  echo ""
  echo "Fix:"
  echo "  1. npm login --auth-type=web --scope=@cobusgreyling"
  echo "  2. Or set NPM_TOKEN: export NPM_TOKEN=npm_..."
  echo "     echo \"//registry.npmjs.org/:_authToken=\${NPM_TOKEN}\" > ~/.npmrc"
  exit 1
fi

echo "npm user: $(npm whoami)"
echo "npm version: $(npm --version) (v11+ recommended for passkey/browser auth)"
echo ""

echo "=== build + test ==="
pnpm install --frozen-lockfile
pnpm build
pnpm test

echo ""
echo "=== publish all @cobusgreyling/outerloop* packages ==="
if [[ -n "${NPM_OTP:-}" ]]; then
  pnpm changeset publish --otp "$NPM_OTP"
elif [[ -n "${NPM_TOKEN:-}" ]]; then
  pnpm changeset publish
else
  echo "Publishing one package at a time — approve each browser/passkey prompt."
  echo "Tip: granular token with bypass 2FA avoids repeated prompts."
  pnpm -r publish --access public --no-git-checks
fi

echo ""
echo "=== verify ==="
npx --yes @cobusgreyling/outerloop@latest --version
npx --yes @cobusgreyling/outerloop@latest init --help | head -5

echo ""
echo "Done. Optional: set GitHub secret for CI releases:"
echo "  gh secret set NPM_TOKEN --repo cobusgreyling/outerloop"