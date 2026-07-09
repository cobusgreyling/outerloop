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

- [x] Evidence packaging from loop-engineering run artifacts (STATE.md, loop-run-log.md, git diffs, test output)
- [x] `outerloop evidence package` with file output and loop-engineering adapter
- [x] `outerloop verdict review` TUI (summaries, diff preview, risk viz, mandatory rationale)
- [x] `outerloop verdict issue` for non-interactive verdict recording
- [x] File-based Ledger (JSONL + index) with `why` reconstruction
- [x] Commit manifest attachment for verdicts
- [x] End-to-end example: daily-triage fixtures → evidence → verdict → ledger

## Phase 2 — Taste + Policy + Integration (next)

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