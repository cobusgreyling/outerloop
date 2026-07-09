# GitHub Action — Evidence Gate

Package agent-run evidence in CI using the reusable workflow shipped in this repo.

## Basic usage

```yaml
name: Agent run governance

on:
  workflow_dispatch:
  push:
    branches: [main]

jobs:
  evidence:
    uses: cobusgreyling/outerloop/.github/workflows/evidence-gate.yml@main
    with:
      run-id: latest
      evidence-source: custom-harness
```

## Inputs

| Input | Default | Description |
|-------|---------|-------------|
| `run-id` | `latest` | Agent run ID to package |
| `project-root` | `.` | Directory containing `.outerloop/` |
| `evidence-source` | `custom-harness` | Adapter: `loop-engineering`, `cursor`, `claude-code`, `custom-harness`, `manual` |
| `outerloop-version` | `latest` | npm version pin (e.g. `0.3.1`) |
| `require-verdict` | `false` | Fail if no ledger entry exists for packaged evidence |

## Outputs

| Output | Description |
|--------|-------------|
| `evidence-id` | UUID of the saved EvidencePackage |
| `risk-score` | Risk score 0–10 |

## Example: pin version + require verdict

```yaml
jobs:
  gate:
    uses: cobusgreyling/outerloop/.github/workflows/evidence-gate.yml@v0.3.1
    with:
      run-id: ${{ github.sha }}
      evidence-source: claude-code
      outerloop-version: "0.3.1"
      require-verdict: true
```

## Prerequisites

Run `outerloop init` in your repo (commit `.outerloop/` scaffold or generate in an earlier CI step).

For loop-engineering projects:

```bash
outerloop init --with-loop-engineering
```

## Local equivalent

```bash
outerloop evidence package --run-id latest --from custom-harness --project-root .
```