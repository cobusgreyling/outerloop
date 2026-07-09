# outerloop Roadmap

Implementation phases from [SPEC.md](./SPEC.md). Status as of initial repo creation (July 2026).

## Phase 0 — Foundation ✅ (current)

- [x] TypeScript monorepo (pnpm workspaces + Turborepo)
- [x] Core Zod schemas (`EvidencePackage`, `Verdict`, `LedgerEntry`, `HarnessSpec`, `TasteRule`, `BackpressurePolicy`)
- [x] `EvidencePackageBuilder` with validation
- [x] CLI skeleton with all planned subcommands (stubs for Phase 1+)
- [x] `OUTERLOOP.md` dogfooding manifest
- [x] Project structure per SPEC

## Phase 1 — Evidence + Verdict Core (next)

- [ ] Evidence packaging from loop-engineering run artifacts (STATE.md, worktree diffs, test output)
- [ ] `outerloop evidence package` with file output and loop-engineering adapter
- [ ] Rich `outerloop verdict review` TUI (diffs, risk viz, mandatory rationale)
- [ ] File-based Ledger (JSON/JSONL + index) with `why` reconstruction
- [ ] Git note or commit manifest attachment for verdicts
- [ ] End-to-end example: loop-engineering daily-triage → evidence → verdict → ledger

## Phase 2 — Taste + Policy + Integration

- [ ] Taste capture from critique sessions + rule application
- [ ] YAML policy engine (sampling, escalation)
- [ ] loop-engineering integration adapter (auto-evidence hooks)
- [ ] Cursor rules + composer prompt templates

## Phase 3 — Cognitive, Harness, Scale

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