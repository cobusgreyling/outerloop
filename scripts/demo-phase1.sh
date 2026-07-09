#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FIXTURES="$ROOT/examples/full-factory/fixtures"
CLI="node $ROOT/packages/cli/dist/cli.js"
TMP=$(mktemp)

cd "$ROOT"
pnpm build --filter @cobusgreyling/outerloop... >/dev/null

echo "=== 1. Package evidence ==="
$CLI evidence package \
  --run-id latest \
  --from loop-engineering \
  --project-root "$FIXTURES" \
  --test-output "$FIXTURES/test-output.txt" \
  --output "$TMP"

EVIDENCE_ID=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TMP','utf8')).id)")
echo "Evidence ID: $EVIDENCE_ID"

echo ""
echo "=== 2. Issue verdict ==="
$CLI verdict issue \
  --evidence-id "$EVIDENCE_ID" \
  --decision ship \
  --rationale "Report-only daily triage: no code changes, tests pass." \
  --project-root "$FIXTURES" \
  --commit deadbeef \
  --owner demo-user

echo ""
echo "=== 3. Reconstruct answerability ==="
$CLI ledger why "$EVIDENCE_ID" --project-root "$FIXTURES"

rm -f "$TMP"
echo ""
echo "=== Demo complete ==="