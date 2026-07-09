# Full Factory Example — Phase 1 End-to-End

Demonstrates the outerloop workflow on a loop-engineering-style daily-triage run:

**Evidence package → Verdict → Ledger → Answerability**

## Quick Demo (non-interactive)

From the repo root:

```bash
pnpm build

# 1. Package evidence from fixtures
node packages/cli/dist/cli.js evidence package \
  --run-id latest \
  --from loop-engineering \
  --project-root examples/full-factory/fixtures \
  --test-output examples/full-factory/fixtures/test-output.txt \
  --json > /tmp/evidence.json

# Capture the evidence ID
EVIDENCE_ID=$(node -e "console.log(JSON.parse(require('fs').readFileSync('/tmp/evidence.json','utf8')).id)")

# 2. Issue a verdict (non-interactive)
node packages/cli/dist/cli.js verdict issue \
  --evidence-id "$EVIDENCE_ID" \
  --decision ship \
  --rationale "Report-only daily triage: no code changes, tests pass, findings documented in STATE.md." \
  --project-root examples/full-factory/fixtures \
  --commit deadbeef

# 3. Reconstruct answerability
node packages/cli/dist/cli.js ledger why "$EVIDENCE_ID" \
  --project-root examples/full-factory/fixtures

node packages/cli/dist/cli.js ledger query --owner "$USER" \
  --project-root examples/full-factory/fixtures
```

## Interactive Review

```bash
node packages/cli/dist/cli.js evidence package \
  --run-id latest \
  --project-root examples/full-factory/fixtures

node packages/cli/dist/cli.js verdict review <evidence-id> \
  --project-root examples/full-factory/fixtures
```

## Against loop-engineering (real artifacts)

Point `--project-root` at a loop-engineering checkout:

```bash
node packages/cli/dist/cli.js evidence package \
  --run-id latest \
  --project-root /path/to/loop-engineering
```

This parses `loop-run-log.md`, `STATE.md`, git diffs, and produces a risk-scored evidence package ready for verdict.