#!/usr/bin/env bash
# outerloop post-run hook — auto-package evidence after loop-engineering runs
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUN_ID="${OUTERLOOP_RUN_ID:-latest}"
CLI="${OUTERLOOP_CLI:-npx @cobusgreyling/outerloop}"

cd "$ROOT"
$CLI evidence package \
  --run-id "$RUN_ID" \
  --from loop-engineering \
  --project-root "$ROOT"

echo "outerloop: evidence packaged for run $RUN_ID"
