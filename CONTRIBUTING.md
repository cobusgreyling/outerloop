# Contributing to outerloop

Thank you for helping build the governance layer for agentic engineering.

## Principles

- Make answerability cheap and reconstruction trivial.
- Treat taste as a versioned, first-class engineering artifact.
- Separate agent *capability* (inner loop) from human *agency* (outer loop).
- Build for the accountable owner, not just the implementer.

## Development Setup

```bash
git clone https://github.com/cobusgreyling/outerloop.git
cd outerloop
pnpm install
pnpm build
pnpm test
pnpm demo
```

Run the CLI locally:

```bash
pnpm outerloop --help
pnpm outerloop evidence package --run-id latest --project-root examples/full-factory/fixtures
pnpm outerloop init --project-root /tmp/my-project
```

See [QUICKSTART.md](./QUICKSTART.md) for the full onboarding path.

## Workflow

1. Read [SPEC.md](./SPEC.md) before substantial changes.
2. Check [ROADMAP.md](./ROADMAP.md) for current phase scope.
3. Use loop-engineering patterns for inner-loop implementation work.
4. As Phase 1 lands: package evidence and capture verdict rationale on significant PRs.

## Code Style

- TypeScript strict mode
- Zod for all artifact schemas
- Vitest for tests
- Small, focused PRs with clear rationale