# CLI reference

Install: `npx @cobusgreyling/outerloop@latest` or `npm install -g @cobusgreyling/outerloop`.

Global flag: `--project-root <path>` (default: current directory) on most commands.

## init

Scaffold `.outerloop/`, harness, policy, taste, and optional integrations.

```bash
outerloop init [--name <name>] [--boundary strict|moderate|permissive]
               [--with-cursor] [--with-claude-code] [--with-loop-engineering]
               [--no-coordination]
```

## evidence

| Command | Description |
|---------|-------------|
| `evidence package` | Build and save an EvidencePackage from a run |
| `evidence list` | List indexed evidence packages |

**package** options:

- `--run-id <id>` — Run identifier (default: `latest`)
- `--from <source>` — `loop-engineering`, `cursor`, `claude-code`, `custom-harness`, `manual`
- `--test-output <file>` — Test log for risk scoring
- `--output <file>` — Write JSON to file instead of saving to `.outerloop/`
- `--json` — Print JSON to stdout

## verdict

| Command | Description |
|---------|-------------|
| `verdict review <evidence-id>` | Interactive TUI review |
| `verdict issue` | Non-interactive verdict |

**issue** options: `--evidence-id`, `--decision` (`ship`|`block`|`narrow`|`redirect`|`reject`), `--rationale`, `--owner`, `--commit`.

## ledger

| Command | Description |
|---------|-------------|
| `ledger why <id-or-sha>` | Reconstruct answerability chain |
| `ledger query` | Filter by owner, decision, date |

## taste

| Command | Description |
|---------|-------------|
| `taste capture` | Extract rules from critique notes |
| `taste apply` | Activate a profile |
| `taste list` | List profiles |
| `taste match` | Test rules against evidence |

## policy

| Command | Description |
|---------|-------------|
| `policy init` | Write default `backpressure.yaml` |
| `policy set --file <path>` | Activate policy |
| `policy show` | Display active policy |
| `policy evaluate <evidence-id>` | Check backpressure rules |

## integrate

```bash
outerloop integrate <loop-engineering|cursor|claude-code|github>
outerloop cursor setup
```

## dashboard

```bash
outerloop dashboard              # text snapshot
outerloop dashboard tui          # Ink TUI
outerloop dashboard serve        # web UI + /api/snapshot
```

## coordination

```bash
outerloop coordination init
outerloop coordination list
outerloop coordination register --pattern <name> --owner <user>
outerloop coordination status --pattern <name> --status <state>
outerloop coordination check --pattern <name> --target <id>
```

## Other

| Command | Description |
|---------|-------------|
| `harness init` / `show` / `validate` | Boundary spec |
| `cognitive check` | Cognitive debt estimate |
| `attention route` | Pending verdict routing |
| `brownfield scan` | Legacy codebase introspection |
| `audit` | Governance health score |

## Environment

| Variable | Purpose |
|----------|---------|
| `OUTERLOOP_CLI` | Override CLI binary in integration hooks |
| `OUTERLOOP_RUN_ID` | Run ID for post-run hooks |