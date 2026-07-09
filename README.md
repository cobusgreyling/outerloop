<p align="center">
  <img src="https://raw.githubusercontent.com/cobusgreyling/outerloop/main/docs/outerloop.jpg" alt="Outerloop" />
</p>

# outerloop

[![CI](https://github.com/cobusgreyling/outerloop/actions/workflows/ci.yml/badge.svg)](https://github.com/cobusgreyling/outerloop/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Own the Outer Loop. Evidence → Verdict → Answerability. At industrial scale.**

Practical primitives, tooling, and patterns for rigorously owning the human side of agentic software factories.

Companion to [loop-engineering](https://github.com/cobusgreyling/loop-engineering).

## The loop in 60 seconds

```
Agent run  →  Evidence package  →  Human verdict  →  Ledger  →  Answerability
(inner)         (what happened)      (why ship/block)   (provenance)  (reconstruct why)
```

Humans define constraints and taste. Agents produce evidence. Humans issue verdicts with captured rationale. The system guarantees you can explain **why** something shipped.

## Try it now

```bash
git clone https://github.com/cobusgreyling/outerloop.git
cd outerloop
pnpm install
pnpm build
pnpm demo
```

Expected output: evidence ID, risk score, verdict recorded, and an answerability chain from `ledger why`.

More demos: `pnpm demo:phase2`, `pnpm demo:phase3`, `pnpm demo:v2`

→ Full walkthrough: [QUICKSTART.md](./QUICKSTART.md)

## Use on your project

```bash
# After npm publish (or local build — see QUICKSTART.md)
npx @cobusgreyling/outerloop init
npx @cobusgreyling/outerloop init --with-loop-engineering --with-cursor

npx @cobusgreyling/outerloop evidence package --run-id latest
npx @cobusgreyling/outerloop verdict review <evidence-id>
npx @cobusgreyling/outerloop ledger why <evidence-id>
```

→ Adoption guide: [docs/adopting.md](./docs/adopting.md)

## CLI overview

| Command | Purpose |
|---------|---------|
| `init` | Scaffold `.outerloop/`, harness, policy, taste |
| `evidence package` | Package agent run artifacts into EvidencePackage |
| `verdict review` / `issue` | Human decision with mandatory rationale |
| `ledger why` | Reconstruct answerability chain |
| `taste` / `policy` | Organizational taste and backpressure |
| `dashboard` | Text, Ink TUI, or web governance dashboard |
| `audit` | Score governance health for a project |

```bash
pnpm outerloop --help    # local alias after pnpm build
```

## Examples

| Example | What it demonstrates |
|---------|---------------------|
| [full-factory](./examples/full-factory/) | Core evidence → verdict → ledger loop |
| [phase2](./examples/phase2/) | Taste capture + backpressure policy |
| [phase3](./examples/phase3/) | Harness, cognitive debt, audit |
| [v2](./examples/v2/) | Dashboard + multi-loop coordination |

→ Index: [examples/README.md](./examples/README.md)

## Status

**v0.3.0** — Phases 0–3 and v2 are complete. The CLI, schemas, ledger, verdict TUI, taste/policy, dashboards, and coordination registry all ship today.

| Phase | Status |
|-------|--------|
| Phase 0–1 | ✅ Core + evidence/verdict/ledger |
| Phase 2 | ✅ Taste + policy + integrations |
| Phase 3 | ✅ Harness, cognitive, audit, brownfield |
| v2 | ✅ Ink TUI, web dashboard, coordination, changesets |

→ Roadmap: [ROADMAP.md](./ROADMAP.md)

## Architecture

| Package | Responsibility |
|---------|----------------|
| `@cobusgreyling/outerloop-core` | Schemas, types, EvidencePackage builder |
| `@cobusgreyling/outerloop` | CLI entrypoint |
| `evidence` | Generators, normalizers, risk scorers |
| `verdict` | Review TUI, decision recorder |
| `ledger` | Storage, query, provenance reconstruction |
| `taste` | Capture, versioning, rule matching |
| `policy` | Backpressure DSL parser and enforcer |
| `harness` | Boundary spec parser and validator |
| `cognitive` | Debt estimators, narrative generators |
| `integrate` | loop-engineering, Cursor, GitHub adapters |
| `dashboard` | Text, Ink TUI, and web governance views |
| `coordination` | Multi-loop registry and collision checks |

→ Deep dive: [SPEC.md](./SPEC.md) · [docs/architecture.md](./docs/architecture.md)

## Development

```bash
git clone https://github.com/cobusgreyling/outerloop.git
cd outerloop
pnpm install
pnpm build
pnpm test
pnpm outerloop --help
```

→ [CONTRIBUTING.md](./CONTRIBUTING.md) · [docs/PUBLISHING.md](./docs/PUBLISHING.md)

## Contributing philosophy

- Make answerability cheap and reconstruction trivial.
- Treat taste as a versioned, first-class engineering artifact.
- Explicitly separate agent *capability* (inner) from human *agency* (outer).
- Build for the accountable owner, not just the implementer.

An agent can write it. But before it reaches users, someone must explain why it should exist, why it's safe enough, and what they will do when it is wrong. That is the work of the outer loop.

---

*Built on loop-engineering, Addy Osmani's outer loop thinking, and the broader agentic engineering community.*