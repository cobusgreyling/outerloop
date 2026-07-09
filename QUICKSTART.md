# Quick Start

Get from zero to a working **Evidence → Verdict → Answerability** loop in under five minutes.

## Try it in this repo (fastest path)

```bash
git clone https://github.com/cobusgreyling/outerloop.git
cd outerloop
pnpm install
pnpm build
pnpm demo
```

You should see:

1. An **evidence package** with a risk score
2. A **verdict** recorded (`ship`)
3. An **answerability chain** from `ledger why`

## Use the CLI locally

After `pnpm build`, run commands via the repo alias:

```bash
pnpm outerloop --help
pnpm outerloop evidence package --run-id latest \
  --project-root examples/full-factory/fixtures
pnpm outerloop verdict review <evidence-id> \
  --project-root examples/full-factory/fixtures
pnpm outerloop ledger why <evidence-id> \
  --project-root examples/full-factory/fixtures
```

## Use on your own project

Install from npm:

```bash
npx @cobusgreyling/outerloop init
npx @cobusgreyling/outerloop init --with-cursor
npx @cobusgreyling/outerloop init --with-claude-code
npx @cobusgreyling/outerloop init --with-loop-engineering
```

Or from a local clone:

```bash
pnpm build
node /path/to/outerloop/packages/cli/dist/cli.js init --project-root /path/to/your-project
```

`init` creates `.outerloop/`, a harness boundary, default backpressure policy, taste profile, and optional integrations.

### Daily workflow

```bash
# 1. After an agent run, package evidence
outerloop evidence package --run-id latest

# 2. Human review (interactive TUI) or non-interactive issue
outerloop verdict review <evidence-id>
# or
outerloop verdict issue --evidence-id <id> --decision ship --rationale "..."

# 3. Reconstruct why something shipped
outerloop ledger why <evidence-id>
outerloop ledger why HEAD
```

## More demos

| Command | What it shows |
|---------|---------------|
| `pnpm demo` | Core loop: evidence → verdict → ledger |
| `pnpm demo:phase2` | Taste capture + backpressure policy |
| `pnpm demo:phase3` | Harness, cognitive debt, audit |
| `pnpm demo:v2` | Dashboard + multi-loop coordination |

See [examples/README.md](./examples/README.md) for details.

## Learn more

- [docs/adopting.md](./docs/adopting.md) — adopt outerloop on a real repo
- [SPEC.md](./SPEC.md) — full architecture and data models
- [CONTRIBUTING.md](./CONTRIBUTING.md) — development setup