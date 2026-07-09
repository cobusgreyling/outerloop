# outerloop Roadmap

Implementation phases from [SPEC.md](./SPEC.md). Status as of July 2026.

## Phase 0 — Foundation ✅

- [x] TypeScript monorepo (pnpm workspaces + Turborepo)
- [x] Core Zod schemas (`EvidencePackage`, `Verdict`, `LedgerEntry`, `HarnessSpec`, `TasteRule`, `BackpressurePolicy`)
- [x] `EvidencePackageBuilder` with validation
- [x] CLI skeleton with all planned subcommands
- [x] `OUTERLOOP.md` dogfooding manifest
- [x] Project structure per SPEC

## Phase 1 — Evidence + Verdict Core ✅

- [x] Evidence packaging from loop-engineering run artifacts
- [x] `outerloop evidence package` with file output and loop-engineering adapter
- [x] `outerloop verdict review` TUI with mandatory rationale
- [x] File-based Ledger with `why` reconstruction
- [x] Commit manifest attachment for verdicts
- [x] End-to-end example

## Phase 2 — Taste + Policy + Integration ✅

- [x] Taste capture from critique sessions (`taste capture`, `taste apply`, `taste match`)
- [x] YAML policy engine with sampling + escalation (`policy set`, `policy evaluate`)
- [x] loop-engineering integration adapter (config, post-run hook, GitHub workflow)
- [x] Cursor rules + composer prompt templates (`cursor setup`, `integrate cursor`)
- [x] Governance context wired into verdict review and issue

## Phase 3 — Cognitive, Harness, Scale (next)

- [ ] Cognitive debt tools
- [ ] Harness boundary specs + enforcement
- [ ] Multi-loop coordination + attention router
- [ ] Optional terminal/web dashboard
- [ ] Brownfield introspection helpers

## Non-Goals (v1)

- Cryptographic signatures
- Distributed ledger
- Heavy ML for taste inference
- Replacing existing review tools entirely