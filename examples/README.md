# Examples

Progressive examples for learning and dogfooding outerloop. Start at **full-factory**, then explore by phase.

## Index

| Example | Start here if you want to… | Demo script |
|---------|---------------------------|-------------|
| [full-factory](./full-factory/) | See the core loop end-to-end | `pnpm demo` |
| [phase2](./phase2/) | Add taste profiles and backpressure policy | `pnpm demo:phase2` |
| [phase3](./phase3/) | Harness boundaries, cognitive debt, audit | `pnpm demo:phase3` |
| [v2](./v2/) | Ink TUI, web dashboard, coordination | `pnpm demo:v2` |

## Recommended path

1. **full-factory** — evidence package → verdict → ledger → answerability
2. **phase2** — capture taste from critique sessions, evaluate policy
3. **phase3** — harness init, attention routing, brownfield scan
4. **v2** — dashboards and multi-loop coordination registry

## Fixtures

`full-factory/fixtures/` contains a loop-engineering-style project with pre-built `.outerloop/` artifacts. Most demos use this as `--project-root`.

```bash
pnpm build
pnpm outerloop evidence package --run-id latest \
  --project-root examples/full-factory/fixtures
```