#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== outerloop sequential npm publish ==="
echo "Publishes one package at a time (deps first) so browser/passkey auth works."
echo ""

if ! npm whoami >/dev/null 2>&1; then
  echo "ERROR: Not logged in to npm."
  echo "  npm login --auth-type=web --scope=@cobusgreyling"
  exit 1
fi

echo "npm user: $(npm whoami)"
echo "npm version: $(npm --version) (use v11+ for browser auth links)"
echo ""

echo "=== build + test ==="
pnpm install --frozen-lockfile
pnpm build
pnpm test

echo ""
echo "=== publish packages in dependency order ==="
echo "When prompted, open the browser link and approve with your passkey."
echo "Repeat for each package until all show '+' success lines."
echo ""

pnpm -r publish --access public --no-git-checks

echo ""
echo "=== verify ==="
npm view @cobusgreyling/outerloop version
npx --yes @cobusgreyling/outerloop@latest --version