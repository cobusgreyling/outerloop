# Pattern: Cursor daily triage

Govern a daily Cursor/Composer triage session without loop-engineering.

## Setup (once)

```bash
npx @cobusgreyling/outerloop init --with-cursor --name daily-triage
```

## Daily cadence

1. **Run triage** in Cursor with the verdict-aware rules (`.cursor/rules/outerloop.mdc`).
2. **Package evidence** when the session ends:

```bash
outerloop evidence package \
  --run-id "$(date +%Y-%m-%d)" \
  --from cursor \
  --project-root .
```

3. **Human verdict** — interactive or scripted:

```bash
outerloop verdict review <evidence-id>
# or
outerloop verdict issue \
  --evidence-id <evidence-id> \
  --decision ship \
  --rationale "Report-only triage; no production code changed."
```

4. **Answerability check**:

```bash
outerloop ledger why <evidence-id>
```

## Backpressure

Set sampling in `backpressure.yaml` so low-risk report-only runs need verdict only weekly:

```yaml
backpressure:
  sampling:
    lowRisk: 5%
    mediumRisk: 30%
    highRisk: 100%
```

Evaluate before shipping:

```bash
outerloop policy evaluate <evidence-id>
```

## See also

- [examples/cursor-only](../examples/cursor-only/)
- [docs/concepts.md](../docs/concepts.md)