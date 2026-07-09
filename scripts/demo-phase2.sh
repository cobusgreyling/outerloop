#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT="$ROOT/examples/full-factory/fixtures"
CLI="node $ROOT/packages/cli/dist/cli.js"
TMP=$(mktemp)
INTEG_TMP=$(mktemp -d)

cd "$ROOT"
pnpm build --filter @cobusgreyling/outerloop... >/dev/null

echo "=== 1. Capture taste profile ==="
$CLI taste capture \
  --from-critique "$ROOT/examples/phase2/critique-session.md" \
  --profile team-default \
  --project-root "$PROJECT"
$CLI taste apply --profile team-default --project-root "$PROJECT"

echo ""
echo "=== 2. Set backpressure policy ==="
$CLI policy set --file "$ROOT/examples/phase2/backpressure.yaml" --project-root "$PROJECT"

echo ""
echo "=== 3. Package evidence ==="
$CLI evidence package \
  --run-id latest \
  --from loop-engineering \
  --project-root "$PROJECT" \
  --test-output "$PROJECT/test-output.txt" \
  --output "$TMP"
EVIDENCE_ID=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TMP','utf8')).id)")
echo "Evidence ID: $EVIDENCE_ID"

echo ""
echo "=== 4. Evaluate policy & taste ==="
$CLI policy evaluate "$EVIDENCE_ID" --project-root "$PROJECT"
echo ""
$CLI taste match "$EVIDENCE_ID" --project-root "$PROJECT"

echo ""
echo "=== 5. Issue verdict with governance context ==="
$CLI verdict issue \
  --evidence-id "$EVIDENCE_ID" \
  --decision ship \
  --rationale "Report-only triage with policy sampling pass and no blocking taste rules." \
  --project-root "$PROJECT" \
  --commit phase2demo \
  --owner demo-user

echo ""
echo "=== 6. Install integrations (temp project) ==="
$CLI integrate loop-engineering --project-root "$INTEG_TMP"
$CLI cursor setup --project-root "$INTEG_TMP"
echo "  ✓ outerloop.config.yaml"
echo "  ✓ scripts/outerloop-post-run.sh"
echo "  ✓ .cursor/rules/outerloop.mdc"

rm -f "$TMP"
rm -rf "$INTEG_TMP"
echo ""
echo "=== Phase 2 demo complete ==="