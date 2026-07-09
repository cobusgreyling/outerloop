# Phase 2 Example — Taste, Policy, Integration

## Setup governance

```bash
# From repo root after pnpm build
CLI="node packages/cli/dist/cli.js"
FIXTURES="examples/full-factory/fixtures"

# 1. Capture taste from critique session
$CLI taste capture \
  --from-critique examples/phase2/critique-session.md \
  --profile team-default \
  --project-root .

$CLI taste apply --profile team-default --project-root .

# 2. Activate backpressure policy
$CLI policy set --file examples/phase2/backpressure.yaml --project-root .

# 3. Install integrations
$CLI integrate loop-engineering --project-root .
$CLI cursor setup --project-root .
```

## Evaluate governance against evidence

```bash
$CLI evidence package --run-id latest --project-root $FIXTURES
$CLI policy evaluate <evidence-id> --project-root .
$CLI taste match <evidence-id> --project-root .
```

## Full demo

```bash
bash scripts/demo-phase2.sh
```