# v2 — Rich Dashboard, Coordination, Releases

## Ink TUI (auto-refresh every 3s)

```bash
node packages/cli/dist/cli.js dashboard tui --project-root examples/full-factory/fixtures
```

## Web dashboard

```bash
node packages/cli/dist/cli.js dashboard serve --port 4040 --project-root .
# Open http://127.0.0.1:4040/
# API: http://127.0.0.1:4040/api/snapshot
```

## Multi-loop coordination

```bash
outerloop coordination init
outerloop coordination list
outerloop coordination status --pattern ci-sweeper --status acting --acting-on pr-42
outerloop coordination check --pattern pr-babysitter --target pr-42
```

## npm release (maintainers)

```bash
pnpm changeset          # describe changes
pnpm version-packages   # bump versions locally
pnpm release            # build + publish to npm
```

GitHub Actions `release.yml` automates version PRs and publish when `NPM_TOKEN` is configured.

## Demo

```bash
bash scripts/demo-v2.sh
```