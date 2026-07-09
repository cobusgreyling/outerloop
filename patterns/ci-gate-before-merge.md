# Pattern: CI gate before merge

Package evidence on every agent-assisted push; optionally require a ledger entry before merge.

## One-time setup

```bash
npx @cobusgreyling/outerloop init
git add .outerloop backpressure.yaml
git commit -m "chore: add outerloop governance scaffold"
```

## GitHub Actions

Add `.github/workflows/outerloop-gate.yml`:

```yaml
name: outerloop gate

on:
  pull_request:
  push:
    branches: [main]

jobs:
  evidence:
    uses: cobusgreyling/outerloop/.github/workflows/evidence-gate.yml@main
    with:
      run-id: ${{ github.sha }}
      evidence-source: custom-harness
      outerloop-version: "0.3.1"
```

## Optional: require verdict

For high-risk repos, set `require-verdict: true` only on `main` merges after a human has run `verdict issue` in a prior step or manual workflow.

## Branch protection

Combine with GitHub branch protection:

- Required status check: `outerloop gate / evidence`
- Required reviewers: unchanged — outerloop does not replace human code review

## Local pre-push hook

```bash
#!/usr/bin/env bash
outerloop evidence package --run-id "pre-push-$(git rev-parse --short HEAD)" --from custom-harness
```

## See also

- [docs/github-action.md](../docs/github-action.md)
- [docs/vs-alternatives.md](../docs/vs-alternatives.md)