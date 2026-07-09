# Contributing to outerloop

Thank you for helping build the governance layer for agentic engineering.

## Principles

- Make answerability cheap and reconstruction trivial.
- Treat taste as a versioned, first-class engineering artifact.
- Separate agent *capability* (inner loop) from human *agency* (outer loop).
- Build for the accountable owner, not just the implementer.

## Where to start

1. Read [Contributor start here](https://github.com/cobusgreyling/outerloop/discussions/19) and browse [good first issues](docs/good-first-issues.md) / [open issues](https://github.com/cobusgreyling/outerloop/issues?q=label%3A%22good+first+issue%22).
2. Read [ROADMAP.md](./ROADMAP.md) for planned v3 work.
3. Run the five-minute loop in [QUICKSTART.md](./QUICKSTART.md).
4. Read [SPEC.md](./SPEC.md) before substantial schema or CLI changes.

## Development setup

```bash
git clone https://github.com/cobusgreyling/outerloop.git
cd outerloop
pnpm install
pnpm build
pnpm test
pnpm demo
```

**Dev Container:** open the repo in VS Code / GitHub Codespaces — `.devcontainer/` runs install + build on create.

Run the CLI locally:

```bash
pnpm outerloop --help
pnpm outerloop evidence package --run-id latest --project-root examples/full-factory/fixtures
pnpm outerloop init --project-root /tmp/my-project
```

## Pull request workflow

### 1. Fork and branch

```bash
git checkout -b feat/short-description   # or fix/, docs/, chore/
```

Use focused branches. One logical change per PR.

### 2. Implement with tests

- TypeScript strict mode, Zod for artifact schemas, Vitest for tests.
- Match patterns in the package you are editing (`packages/<name>/`).
- Run before opening a PR:

```bash
pnpm build
pnpm test
```

Add tests in `src/*.test.ts` for behavior changes. Demos under `examples/` should keep working.

### 3. Changesets (published packages)

If your PR changes user-facing behavior in any `@cobusgreyling/outerloop*` package:

```bash
pnpm changeset
```

Select affected packages and semver bump (`patch` / `minor` / `major`). Commit the generated `.changeset/*.md` file with your PR.

Docs-only or internal test changes do **not** need a changeset.

### 4. Open the PR

- Fill out the [PR template](.github/pull_request_template.md).
- Link the issue: `Fixes #123`.
- Include **rationale** for significant changes — we dogfood outer-loop answerability on our own PRs.
- Keep PRs small; split large features across stacked PRs when possible.

### 5. Review

Maintainers will review for:

- Correctness and test coverage
- Schema/CLI consistency with SPEC.md
- Changeset presence when needed
- Clear rationale in the PR description

Address feedback with additional commits. Squash-merge is fine.

## Reporting bugs and proposing features

- **Bugs:** [bug report template](.github/ISSUE_TEMPLATE/bug_report.yml)
- **Features:** [feature request template](.github/ISSUE_TEMPLATE/feature_request.yml) — check ROADMAP.md first
- **Security:** see [SECURITY.md](./SECURITY.md) — do not file public issues for vulnerabilities

## Code style

- TypeScript strict mode
- Zod for all artifact schemas
- Vitest for tests
- Small, focused PRs with clear rationale
- No drive-by refactors in the same PR as a feature fix

## Community

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). Be respectful and constructive.

## Release process (maintainers)

Releases use [Changesets](https://github.com/changesets/changesets). See [docs/PUBLISHING.md](./docs/PUBLISHING.md).