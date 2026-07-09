#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT="$ROOT/examples/full-factory/fixtures"
CLI="node $ROOT/packages/cli/dist/cli.js"

cd "$ROOT"
pnpm build --filter @cobusgreyling/outerloop... >/dev/null

echo "=== 1. Initialize harness boundary ==="
$CLI harness init outerloop-demo --boundary strict --project-root "$PROJECT"

echo ""
echo "=== 2. Cognitive debt check ==="
$CLI cognitive check --project-root "$ROOT" --changes HEAD~3

echo ""
echo "=== 3. Attention router ==="
$CLI attention route --batch --project-root "$PROJECT"

echo ""
echo "=== 4. Brownfield scan (packages only) ==="
$CLI brownfield scan --project-root "$ROOT/packages" --save

echo ""
echo "=== 5. Self-governance audit ==="
$CLI audit --project-root "$PROJECT"

echo ""
echo "=== 6. Terminal dashboard ==="
$CLI dashboard --project-root "$PROJECT"

echo ""
echo "=== Phase 3 demo complete ==="