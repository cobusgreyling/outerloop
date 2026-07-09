# Publishing to npm

The `@cobusgreyling/outerloop` package is configured for public npm publish. Releases use [Changesets](https://github.com/changesets/changesets).

## One-time setup

1. Create an npm account and org scope `@cobusgreyling` (or use your user scope).
2. Generate an npm access token with publish rights.
3. Add `NPM_TOKEN` to GitHub repository secrets.
4. Merge to `main` — the [release workflow](../.github/workflows/release.yml) runs CI, then opens a version PR or publishes.

## Manual publish

```bash
pnpm install
pnpm build
pnpm test
npm login
pnpm changeset          # describe changes (if not already done)
pnpm version-packages   # bump versions from changesets
pnpm release            # build + publish all versioned packages
```

## Verify after publish

```bash
npx @cobusgreyling/outerloop --version
npx @cobusgreyling/outerloop init --help
npx @cobusgreyling/outerloop evidence package --help
```

## Consumer quick start (post-publish)

```bash
npx @cobusgreyling/outerloop init --with-cursor
npx @cobusgreyling/outerloop evidence package --run-id latest
npx @cobusgreyling/outerloop verdict review <evidence-id>
npx @cobusgreyling/outerloop ledger why <evidence-id>
```