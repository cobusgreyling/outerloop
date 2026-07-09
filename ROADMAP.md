# outerloop Roadmap

Implementation phases from [SPEC.md](./SPEC.md). Status as of July 2026.

## Phase 0–3 ✅

All MVP phases complete. See git history for Phase 0–3 deliverables.

## v2 ✅

- [x] Rich Ink TUI dashboard (`dashboard tui`)
- [x] Web dashboard (`dashboard serve` + `/api/snapshot`)
- [x] Multi-loop coordination registry (`coordination init|list|register|status|check`)
- [x] Changesets + GitHub release workflow for npm publish

## v0.3 ✅ (quick start)

- [x] `outerloop init` — one-command project scaffolding
- [x] `pnpm demo` / `pnpm outerloop` root scripts
- [x] QUICKSTART.md, examples index, adopting guide
- [x] Dev Container for zero-setup clone-and-run

## v0.3.1 ✅ (adoption)

- [x] Fix `npx outerloop` bin symlink entrypoint
- [x] Published-package smoke test in CI
- [x] Claude Code integration (`init --with-claude-code`)
- [x] Reusable GitHub Action (`evidence-gate.yml`)
- [x] Adoption docs: concepts, CLI, API, vs-alternatives, patterns, stories

## Future / v3

- [ ] Hosted dashboard (optional cloud sync)
- [ ] Graphite-style multi-repo coordination
- [ ] Deeper loop-engineering state file parsers for collision detection
- [ ] Cryptographic ledger signatures (explicit non-goal for v1, reconsider for enterprise)

## Non-Goals

- Heavy ML for taste inference
- Replacing existing review tools entirely
- Distributed ledger (v1)