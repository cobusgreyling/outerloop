# Changelog

All notable changes to `@cobusgreyling/outerloop` are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/).

## [0.3.2] - 2026-07-09

Same as [0.3.1](#031---2026-07-09) — version bump from changeset publish of all workspace packages.

## [0.3.1] - 2026-07-09

### Fixed

- **CLI bin entrypoint** — `npx @cobusgreyling/outerloop` and npm `.bin` symlinks now run correctly (symlink-safe `realpath` check).
- Published-package smoke test added to CI.

### Added

- **Claude Code integration** — `outerloop integrate claude-code` and `outerloop init --with-claude-code`.
- Reusable GitHub Action: `.github/workflows/evidence-gate.yml`.
- Adoption docs: concepts guide, CLI reference, API guide, vs-alternatives, good-first-issues.
- Example patterns: `patterns/cursor-daily-triage`, `patterns/ci-gate-before-merge`.
- Case study: `stories/001-v0.3.1-release.md`.

## [0.3.0] - 2026-07-09

### Added

- Initial public release: evidence → verdict → ledger → answerability loop.
- `outerloop init` scaffolding for `.outerloop/`, harness, policy, taste.
- Integrations: loop-engineering, Cursor.
- Ink TUI and web dashboards, multi-loop coordination, audit scoring.
- Examples: full-factory, phase2, phase3, v2.

[0.3.2]: https://github.com/cobusgreyling/outerloop/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/cobusgreyling/outerloop/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/cobusgreyling/outerloop/releases/tag/v0.3.0