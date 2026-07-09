#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT="$ROOT/examples/full-factory/fixtures"
CLI="node $ROOT/packages/cli/dist/cli.js"

cd "$ROOT"
pnpm build --filter @cobusgreyling/outerloop... >/dev/null

echo "=== 1. Multi-loop coordination registry ==="
$CLI coordination init --project-root "$PROJECT"
$CLI coordination status --pattern ci-sweeper --status acting --acting-on pr-42 --project-root "$PROJECT"
$CLI coordination check --pattern pr-babysitter --target pr-42 --project-root "$PROJECT" || true
$CLI coordination check --pattern pr-babysitter --target pr-99 --project-root "$PROJECT"

echo ""
echo "=== 2. Text dashboard ==="
$CLI dashboard --project-root "$PROJECT" | head -20

echo ""
echo "=== 3. Web dashboard snapshot API (one-shot) ==="
node -e "
const http = require('http');
const { startWebDashboard } = require('$ROOT/packages/dashboard/dist/web.js');
const srv = startWebDashboard({ cwd: '$PROJECT', port: 14040, host: '127.0.0.1' });
http.get('http://127.0.0.1:14040/api/snapshot', (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const j = JSON.parse(d);
    console.log('Audit grade:', j.audit.grade, 'Pending:', j.attention.total);
    srv.close();
  });
}).on('error', e => { console.error(e); srv.close(); process.exit(1); });
"

echo ""
echo "=== v2 demo complete (run 'outerloop dashboard tui' or 'dashboard serve' interactively) ==="