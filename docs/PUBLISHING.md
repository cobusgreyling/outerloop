# Publishing to npm

The `@cobusgreyling/outerloop` package is configured for public npm publish. Releases use [Changesets](https://github.com/changesets/changesets).

## One-time setup

1. **Create the npm scope** — packages publish under `@cobusgreyling/*`. On [npmjs.com](https://www.npmjs.com/):
   - Create an npm account (if needed)
   - Create an organization named `cobusgreyling`, or link the scope to your user account
   - Without this scope, `pnpm changeset publish` returns `404 Not Found` on PUT
2. Generate an npm **Automation** or **Publish** access token with publish rights to `@cobusgreyling`.
3. Add `NPM_TOKEN` to GitHub repository **Settings → Secrets → Actions**.
4. Merge to `main` — the [release workflow](../.github/workflows/release.yml) runs CI, then opens a version PR or publishes.

Local publish (after `npm login` or `NPM_TOKEN` in env):

```bash
pnpm build && pnpm test && pnpm changeset publish
```

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