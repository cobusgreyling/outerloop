# Changesets

Run `pnpm changeset` after changes that should trigger a release.

Version bumps and changelog updates happen via the Release workflow or locally:

```bash
pnpm changeset version
pnpm build
pnpm release
```