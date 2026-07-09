# OUTERLOOP.md — outerloop Self-Governance

How this repository is built and maintained using outer loop primitives and [loop-engineering](https://github.com/cobusgreyling/loop-engineering) patterns for inner-loop work.

## Philosophy

Every significant change to this repo should:

1. Produce an **EvidencePackage**
2. Receive a human **Verdict** with captured rationale
3. Be recorded in the **Ledger** for answerability

The CLI and schemas for this workflow ship today — dogfood them on significant PRs to `main`.

## Active loops

### Implementation loop (inner — loop-engineering patterns)

- **Harness**: Cursor / Grok with TypeScript monorepo tooling
- **Cadence**: Iterative, verdict-gated PRs to `main`
- **Verifier**: `pnpm build && pnpm test` before merge
- **State**: SPEC.md is source of truth; ROADMAP.md tracks phase progress

### Governance loop (outer — outerloop primitives)

- **Evidence**: Package significant PRs with plan, diffs, test results, risk score
- **Verdict**: Mandatory rationale on merges to `main`
- **Ledger**: `outerloop ledger why <sha>` reconstructs why each release exists
- **Taste**: Rules for what good outerloop code looks like (explicit, typed, answerable)

## Harness boundary

| Inside (agent capability) | Outside (human agency) |
|---------------------------|------------------------|
| TypeScript implementation | Architecture decisions in SPEC |
| Schema design from spec | Phase scope and priority calls |
| Test writing | Verdict on ship/block |
| CLI scaffolding | Taste rules and policy defaults |
| Documentation drafts | Public messaging and positioning |

## Backpressure defaults

Active policy lives at `.outerloop/policy/active.yaml`. Default template:

```yaml
backpressure:
  maxAutonomyHours: 4
  sampling:
    highRisk: 100%
    mediumRisk: 30%
    lowRisk: 5%
  timebox:
    defaultLoop: 2h
```

## Local commands

```bash
pnpm build && pnpm test
pnpm demo
pnpm outerloop audit --project-root .
```

## Stories

Real usage observations live in [`stories/`](./stories/). Add successes, failures, and cognitive debt notes as the framework matures.