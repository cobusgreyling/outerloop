# Full Factory Example — Phase 1 End-to-End

Demonstrates the outerloop workflow on a loop-engineering-style daily-triage run:

**Evidence package → Verdict → Ledger → Answerability**

## Quick Demo (non-interactive)

From the repo root:

```bash
pnpm build
# or: pnpm demo   # runs this entire flow

# 1. Package evidence from fixtures
pnpm outerloop evidence package \
  --run-id latest \
  --from loop-engineering \
  --project-root examples/full-factory/fixtures \
  --test-output examples/full-factory/fixtures/test-output.txt \
  --json > /tmp/evidence.json

# Capture the evidence ID
EVIDENCE_ID=$(node -e "console.log(JSON.parse(require('fs').readFileSync('/tmp/evidence.json','utf8')).id)")

# 2. Issue a verdict (non-interactive)
pnpm outerloop verdict issue \
  --evidence-id "$EVIDENCE_ID" \
  --decision ship \
  --rationale "Report-only daily triage: no code changes, tests pass, findings documented in STATE.md." \
  --project-root examples/full-factory/fixtures \
  --commit deadbeef

# 3. Reconstruct answerability
pnpm outerloop ledger why "$EVIDENCE_ID" \
  --project-root examples/full-factory/fixtures

pnpm outerloop ledger query --owner "$USER" \
  --project-root examples/full-factory/fixtures
```

## Interactive Review

```bash
pnpm outerloop evidence package \
  --run-id latest \
  --project-root examples/full-factory/fixtures

pnpm outerloop verdict review <evidence-id> \
  --project-root examples/full-factory/fixtures
```

## Against loop-engineering (real artifacts)

Point `--project-root` at a loop-engineering checkout:

```bash
pnpm outerloop evidence package \
  --run-id latest \
  --project-root /path/to/loop-engineering
```

This parses `loop-run-log.md`, `STATE.md`, git diffs, and produces a risk-scored evidence package ready for verdict.