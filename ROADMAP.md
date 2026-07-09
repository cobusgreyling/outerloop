# outerloop Roadmap

Implementation phases from [SPEC.md](./SPEC.md). Status as of July 2026.

## Phase 0–3 ✅

All MVP phases complete. See git history for Phase 0–3 deliverables.

## v2 ✅

- [x] Rich Ink TUI dashboard (`dashboard tui`)
- [x] Web dashboard (`dashboard serve` + `/api/snapshot`)
- [x] Multi-loop coordination registry (`coordination init|list|register|status|check`)
- [x] Changesets + GitHub release workflow for npm publish

## Future / v3

- [ ] Hosted dashboard (optional cloud sync)
- [ ] Graphite-style multi-repo coordination
- [ ] Deeper loop-engineering state file parsers for collision detection
- [ ] Cryptographic ledger signatures (explicit non-goal for v1, reconsider for enterprise)

## Non-Goals

- Heavy ML for taste inference
- Replacing existing review tools entirely
- Distributed ledger (v1)