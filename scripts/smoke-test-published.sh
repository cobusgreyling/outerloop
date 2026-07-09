#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAGE="$(mktemp -d)"
INSTALL="$STAGE/install"
PACK_DIR="$STAGE/packs"

cleanup() {
  rm -rf "$STAGE"
}
trap cleanup EXIT

cd "$ROOT"
pnpm build >/dev/null

mkdir -p "$PACK_DIR" "$INSTALL"

for pkg in "$ROOT"/packages/*/package.json; do
  dir="$(dirname "$pkg")"
  name="$(node -e "console.log(require('$pkg').name)")"
  if [[ "$name" == @cobusgreyling/* ]]; then
    (cd "$dir" && pnpm pack --pack-destination "$PACK_DIR" >/dev/null)
  fi
done

cd "$INSTALL"

PACK_DIR="$PACK_DIR" node -e '
const fs = require("fs");
const path = require("path");
const packDir = process.env.PACK_DIR;
const tarballs = fs.readdirSync(packDir).filter((f) => f.endsWith(".tgz"));

const overrides = {};
for (const file of tarballs) {
  const base = file.replace(/\.tgz$/, "").replace(/^cobusgreyling-/, "");
  const version = base.slice(base.lastIndexOf("-") + 1);
  const pkgShort = base.slice(0, -(version.length + 1));
  overrides[`@cobusgreyling/${pkgShort}`] = `file:${path.join(packDir, file)}`;
}

fs.writeFileSync(
  "package.json",
  JSON.stringify(
    {
      name: "outerloop-smoke",
      private: true,
      dependencies: {
        "@cobusgreyling/outerloop": overrides["@cobusgreyling/outerloop"],
      },
      pnpm: { overrides },
    },
    null,
    2,
  ),
);
'

pnpm install >/dev/null

echo "=== smoke: bin --version ==="
./node_modules/.bin/outerloop --version | grep -q "0.3.2"

echo "=== smoke: bin --help ==="
./node_modules/.bin/outerloop --help | grep -q "init"

echo "=== smoke: init ==="
pnpm exec outerloop init --name smoke-test
test -d .outerloop
test -f .outerloop/harness/smoke-test.json
test -f .outerloop/policy/active.yaml

echo "=== smoke: claude-code integrate ==="
pnpm exec outerloop integrate claude-code --project-root .
test -f CLAUDE.md

echo "=== smoke: evidence package (fixtures) ==="
FIXTURES="$ROOT/examples/full-factory/fixtures"
OUT="$(mktemp)"
pnpm exec outerloop evidence package \
  --run-id latest \
  --from loop-engineering \
  --project-root "$FIXTURES" \
  --test-output "$FIXTURES/test-output.txt" \
  --output "$OUT"
node -e "const p=JSON.parse(require('fs').readFileSync('$OUT','utf8')); if(!p.id) process.exit(1)"
rm -f "$OUT"

echo "=== Published package smoke test passed ==="