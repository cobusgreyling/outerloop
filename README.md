<p align="center">
  <img src="https://raw.githubusercontent.com/cobusgreyling/outerloop/main/docs/outerloop.jpg" alt="Outerloop" />
</p>

# outerloop

[![CI](https://github.com/cobusgreyling/outerloop/actions/workflows/ci.yml/badge.svg)](https://github.com/cobusgreyling/outerloop/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@cobusgreyling/outerloop)](https://www.npmjs.com/package/@cobusgreyling/outerloop)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Own the Outer Loop. Evidence → Verdict → Answerability.**

Governance primitives for agentic engineering — any harness, any team size.

Companion to [loop-engineering](https://github.com/cobusgreyling/loop-engineering) (inner loops) and [harness-foundry](https://github.com/cobusgreyling/harness-foundry) (composable harness runtime). Works standalone with Cursor, Claude Code, or custom agents.

## The loop in 60 seconds

```
Agent run  →  Evidence package  →  Human verdict  →  Ledger  →  Answerability
(inner)         (what happened)      (why ship/block)   (provenance)  (reconstruct why)
```

Humans define constraints and taste. Agents produce evidence. Humans issue verdicts with captured rationale. The system guarantees you can explain **why** something shipped.

→ [Core concepts](docs/concepts.md) (5 min) · [vs alternatives](docs/vs-alternatives.md)

## Try it now

```bash
npx @cobusgreyling/outerloop init
npx @cobusgreyling/outerloop evidence package --run-id latest
npx @cobusgreyling/outerloop verdict issue \
  --evidence-id <id> --decision ship --rationale "Tests pass; scope reviewed."
npx @cobusgreyling/outerloop ledger why <id>
```

Or clone and run the full demo:

```bash
git clone https://github.com/cobusgreyling/outerloop.git
cd outerloop && pnpm install && pnpm build && pnpm demo
```

<details>
<summary>Example demo output</summary>

```
=== 1. Package evidence ===
  Run: 2026-07-08T10:01:59Z | Risk: 4/10
Evidence ID: 97fb7345-6849-41a1-bb68-f9446bf6824b

=== 2. Issue verdict ===
✓ Verdict recorded: ship

=== 3. Reconstruct answerability ===
# Answerability Chain: 97fb7345-...
## Verdict
- Decision: **ship**
- Rationale: Report-only daily triage: no code changes, tests pass.
```

</details>

→ [QUICKSTART.md](./QUICKSTART.md)

## Choose your harness

| Persona | Get started |
|---------|-------------|
| **Any agent** | `npx @cobusgreyling/outerloop init` |
| **Cursor** | `npx @cobusgreyling/outerloop init --with-cursor` |
| **Claude Code** | `npx @cobusgreyling/outerloop init --with-claude-code` |
| **loop-engineering** | `npx @cobusgreyling/outerloop init --with-loop-engineering` |

```bash
outerloop evidence package --run-id latest --from cursor    # or claude-code, custom-harness
outerloop verdict review <evidence-id>
outerloop ledger why <evidence-id>
```

→ [Adoption guide](docs/adopting.md) · [Cursor-only example](examples/cursor-only/)

## Progressive adoption

| Level | What you get | Docs |
|-------|--------------|------|
| **1 — Core loop** | evidence, verdict, ledger | [concepts](docs/concepts.md) |
| **2 — Teams** | taste, policy, CI gate | [patterns](patterns/) · [GitHub Action](docs/github-action.md) |
| **3 — Factories** | dashboard, coordination, audit | [architecture](docs/architecture.md) |

## CLI essentials

| Command | Purpose |
|---------|---------|
| `init` | Scaffold `.outerloop/`, harness, policy, taste |
| `evidence package` | Package agent run into EvidencePackage |
| `verdict review` / `issue` | Human decision with mandatory rationale |
| `ledger why` | Reconstruct answerability chain |
| `audit` | Score governance health |

→ Full reference: [docs/cli.md](docs/cli.md) · Programmatic API: [docs/api.md](docs/api.md)

## CI integration

```yaml
jobs:
  evidence:
    uses: cobusgreyling/outerloop/.github/workflows/evidence-gate.yml@main
    with:
      run-id: ${{ github.sha }}
      evidence-source: custom-harness
```

→ [docs/github-action.md](docs/github-action.md)

## Examples & patterns

| Resource | What it shows |
|----------|---------------|
| [full-factory](examples/full-factory/) | Core evidence → verdict → ledger |
| [cursor-only](examples/cursor-only/) | Cursor without loop-engineering |
| [cursor-daily-triage](patterns/cursor-daily-triage.md) | Daily Cursor governance cadence |
| [ci-gate-before-merge](patterns/ci-gate-before-merge.md) | CI evidence gate pattern |

## Status

**v0.3.2** — Adoption release (CLI bin fix, contributor backlog). Phases 0–3 and v2 complete.

| Phase | Status |
|-------|--------|
| Phase 0–1 | ✅ Core + evidence/verdict/ledger |
| Phase 2 | ✅ Taste + policy + integrations |
| Phase 3 | ✅ Harness, cognitive, audit, brownfield |
| v2 | ✅ Ink TUI, web dashboard, coordination |

→ [CHANGELOG.md](./CHANGELOG.md) · [ROADMAP.md](./ROADMAP.md)

## Development

```bash
git clone https://github.com/cobusgreyling/outerloop.git
cd outerloop && pnpm install && pnpm build && pnpm test
pnpm demo
```

→ [Contributor start here](https://github.com/cobusgreyling/outerloop/discussions/19) · [CONTRIBUTING.md](./CONTRIBUTING.md) · [Good first issues](docs/good-first-issues.md)  
[Code of Conduct](./CODE_OF_CONDUCT.md) · [Security policy](./SECURITY.md)

## Contributing philosophy

- Make answerability cheap and reconstruction trivial.
- Treat taste as a versioned, first-class engineering artifact.
- Separate agent *capability* (inner) from human *agency* (outer).
- Build for the accountable owner, not just the implementer.

An agent can write it. Before it reaches users, someone must explain why it should exist, why it's safe enough, and what they will do when it is wrong. That is the work of the outer loop.

---

*Built on loop-engineering, Addy Osmani's outer loop thinking, and the broader agentic engineering community.*