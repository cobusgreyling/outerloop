# Cursor-only example

Adopt outerloop **without** loop-engineering. For teams using Cursor Composer as their agent harness.

## Setup

```bash
npx @cobusgreyling/outerloop init --with-cursor --name my-app
```

This creates `.outerloop/`, Cursor rules (`.cursor/rules/outerloop.mdc`), and a composer prompt.

## Simulated workflow

After a Composer session that changed files:

```bash
# 1. Package evidence (point at your repo root)
outerloop evidence package \
  --run-id latest \
  --from cursor \
  --project-root .

# 2. Review
outerloop verdict review <evidence-id>

# 3. Answerability
outerloop ledger why <evidence-id>
```

## Non-interactive CI / script path

```bash
EVIDENCE_ID=$(outerloop evidence package --run-id latest --from cursor --json | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).id))")

outerloop verdict issue \
  --evidence-id "$EVIDENCE_ID" \
  --decision ship \
  --rationale "Cursor session: tests pass, scope limited to requested feature."

outerloop ledger why "$EVIDENCE_ID"
```

## Next

- [patterns/cursor-daily-triage](../../patterns/cursor-daily-triage.md)
- [docs/adopting.md](../../docs/adopting.md)