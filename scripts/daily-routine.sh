#!/usr/bin/env bash
# Daily routine for outerloop — run from repo root.
# Inner loop: Grok updates STATE.md (triage). Outer loop: this script records a verdict.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CLI="node $ROOT/packages/cli/dist/cli.js"
AUTO_SHIP=false

for arg in "$@"; do
  case "$arg" in
    --ship) AUTO_SHIP=true ;;
    -h|--help)
      cat <<'EOF'
Usage: ./scripts/daily-routine.sh [--ship]

What this does (outer loop governance):
  1. Shows STATE.md — your shared priority list
  2. Packages evidence from the latest loop run
  3. Records a ship verdict (--ship) or prints the command for you

Before running this, do the inner loop in Grok (once per day):
  /loop 1d Run loop-triage. Update STATE.md. No auto-fix in week one.

Then run:
  cd /Users/cobusgreyling/outerloop
  ./scripts/daily-routine.sh --ship
EOF
      exit 0
      ;;
  esac
done

echo "══════════════════════════════════════════════════"
echo "  outerloop daily routine"
echo "══════════════════════════════════════════════════"
echo ""
echo "STATE.md (your priority list):"
echo "──────────────────────────────────────────────────"
sed -n '1,20p' STATE.md
echo "──────────────────────────────────────────────────"
echo ""

TMP=$(mktemp)
$CLI evidence package \
  --run-id latest \
  --from loop-engineering \
  --project-root "$ROOT" \
  --output "$TMP" >/dev/null

EVIDENCE_ID=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TMP','utf8')).id)")
RISK=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TMP','utf8')).riskAssessment.score)")
rm -f "$TMP"

echo "Evidence packaged: $EVIDENCE_ID (risk $RISK/10)"
echo ""

if [[ "$AUTO_SHIP" == true ]]; then
  $CLI verdict issue \
    --evidence-id "$EVIDENCE_ID" \
    --decision ship \
    --rationale "Daily triage reviewed: STATE.md checked, no blocking issues." \
    --project-root "$ROOT"
  echo ""
  echo "Answerability chain:"
  $CLI ledger why "$EVIDENCE_ID" --project-root "$ROOT"
else
  echo "Next step — record your decision:"
  echo "  pnpm outerloop verdict issue \\"
  echo "    --evidence-id $EVIDENCE_ID \\"
  echo "    --decision ship \\"
  echo "    --rationale \"Reviewed STATE.md, looks good.\""
  echo ""
  echo "Or auto-ship report-only runs:"
  echo "  ./scripts/daily-routine.sh --ship"
fi

echo ""
echo "Done."