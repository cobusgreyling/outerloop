# Adopting outerloop

How to add outerloop governance to an existing project or agentic workflow.

## Prerequisites

- Node.js 18+
- A project where agents produce runs, diffs, or test output you want to govern

## One-command setup

```bash
npx @cobusgreyling/outerloop init
```

Options:

```bash
outerloop init \
  --name my-service \
  --boundary moderate \
  --with-loop-engineering \
  --with-cursor
```

| Flag | Effect |
|------|--------|
| `--boundary strict` | Tighter agent tool whitelist; all merges need human verdict |
| `--boundary moderate` | Default — balanced inner/outer separation |
| `--boundary permissive` | Looser agent autonomy; production still gated |
| `--with-loop-engineering` | Writes `outerloop.config.yaml`, post-run hook, GitHub workflow |
| `--with-cursor` | Installs `.cursor/rules/outerloop.mdc` and verdict-aware prompts |
| `--no-coordination` | Skip multi-loop coordination registry |

## What `init` creates

```
.outerloop/
├── evidence/          # EvidencePackages + index
├── verdicts/          # Human decisions with rationale
├── ledger/            # Provenance chain (index + entries.jsonl)
├── manifests/         # Commit/run manifests
├── harness/           # Inner/outer boundary spec
├── policy/            # Active backpressure policy
├── taste/             # Versioned taste profiles
└── coordination/      # Multi-loop registry (unless skipped)
backpressure.yaml      # Policy template (activated on init)
```

## Integrations

### loop-engineering

If you use [loop-engineering](https://github.com/cobusgreyling/loop-engineering):

```bash
outerloop integrate loop-engineering
```

This wires a post-run hook that auto-packages evidence from `loop-run-log.md` and `STATE.md`.

### Cursor

```bash
outerloop cursor setup
```

Installs verdict-aware rules so Composer sessions respect evidence/verdict/ledger workflow.

## CI hooks

After `integrate loop-engineering`, a GitHub workflow template is written to `.github/workflows/outerloop-evidence.yml`. Customize workflow names to match your loop-engineering patterns.

For any CI, the minimum viable gate is:

```bash
outerloop evidence package --run-id "$RUN_ID" --project-root .
# Human or policy-gated:
outerloop policy evaluate "$EVIDENCE_ID"
outerloop verdict issue --evidence-id "$EVIDENCE_ID" --decision ship --rationale "..."
```

## Governance cadence

| Event | Command |
|-------|---------|
| Agent run completes | `outerloop evidence package --run-id latest` |
| Ready to ship | `outerloop verdict review <evidence-id>` |
| Audit / retro | `outerloop ledger why <sha-or-evidence-id>` |
| Health check | `outerloop audit` |
| Team dashboard | `outerloop dashboard` or `outerloop dashboard serve` |

## Taste and policy

Capture organizational taste from critique sessions:

```bash
outerloop taste capture --from-critique notes.md --profile team-default
outerloop taste apply --profile team-default
```

Set backpressure policy:

```bash
outerloop policy set --file backpressure.yaml
outerloop policy evaluate <evidence-id>
```

## Multi-loop teams

For factories running several agent loops (PR babysitter, CI sweeper, daily triage):

```bash
outerloop coordination init
outerloop coordination status --pattern ci-sweeper --status acting --acting-on pr-42
outerloop coordination check --pattern pr-babysitter --target pr-42
```

## Local development (unpublished CLI)

```bash
git clone https://github.com/cobusgreyling/outerloop.git
cd outerloop && pnpm install && pnpm build
alias outerloop='node /path/to/outerloop/packages/cli/dist/cli.js'
outerloop init --project-root /path/to/your-project
```

## Next steps

- [QUICKSTART.md](../QUICKSTART.md) — five-minute walkthrough
- [SPEC.md](../SPEC.md) — schemas, architecture, CLI reference
- [examples/](../examples/) — runnable demos