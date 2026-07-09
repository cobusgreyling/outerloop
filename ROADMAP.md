# outerloop Roadmap

Implementation phases from [SPEC.md](./SPEC.md). Status as of July 2026.

## Phase 0 — Foundation ✅

- [x] TypeScript monorepo (pnpm workspaces + Turborepo)
- [x] Core Zod schemas
- [x] EvidencePackageBuilder + CLI skeleton
- [x] OUTERLOOP.md dogfooding manifest

## Phase 1 — Evidence + Verdict Core ✅

- [x] loop-engineering evidence adapter
- [x] Verdict review TUI + ledger + commit manifests
- [x] End-to-end example

## Phase 2 — Taste + Policy + Integration ✅

- [x] Taste capture, policy engine, loop-engineering + Cursor integration
- [x] Governance context in verdict flow

## Phase 3 — Cognitive, Harness, Scale ✅

- [x] Cognitive debt tools (`cognitive check`)
- [x] Harness boundary specs + validation (`harness init`, `validate`, `show`)
- [x] Attention router for pending verdicts (`attention route`)
- [x] Terminal governance dashboard (`dashboard`)
- [x] Self-governance audit scoring (`audit`)
- [x] Brownfield introspection (`brownfield scan`)

## Future / v2

- [ ] Rich TUI dashboard (Ink/blessed)
- [ ] Web dashboard
- [ ] Multi-loop coordination registry
- [ ] npm publish + changesets release pipeline

## Non-Goals (v1)

- Cryptographic signatures
- Distributed ledger
- Heavy ML for taste inference
- Replacing existing review tools entirely