# Phase 3 Example — Cognitive, Harness, Scale

## Commands

```bash
CLI="node packages/cli/dist/cli.js"
PROJECT="examples/full-factory/fixtures"

# Harness boundaries
$CLI harness init my-project --boundary strict --project-root $PROJECT
$CLI harness validate --project-root $PROJECT

# Cognitive debt
$CLI cognitive check --project-root . --changes HEAD~5

# Attention routing
$CLI attention route --batch --project-root $PROJECT

# Brownfield introspection
$CLI brownfield scan --project-root . --save

# Governance dashboard & audit
$CLI dashboard --project-root $PROJECT
$CLI audit --project-root $PROJECT
```

## Full demo

```bash
bash scripts/demo-phase3.sh
```