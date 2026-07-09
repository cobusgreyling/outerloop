# Publishing to npm

The `@cobusgreyling/outerloop` package is configured for public npm publish. Releases use [Changesets](https://github.com/changesets/changesets).

## One-time setup

The `@cobusgreyling` org already exists on npm (e.g. `@cobusgreyling/loop-audit`). You only need a **valid auth token** with publish rights.

### 1. Log in to npm (local)

```bash
npm login --auth-type=web --scope=@cobusgreyling
npm whoami   # must succeed — not 401
```

If `npm whoami` returns 401, your `~/.npmrc` token is expired. Re-run `npm login` above, or create a new token at [npmjs.com → Access Tokens](https://www.npmjs.com/settings/~tokens) (type: **Granular**, packages: read+write, org: `cobusgreyling`).

### 2. Publish

```bash
bash scripts/publish-to-npm.sh
```

Or manually:

```bash
pnpm build && pnpm test && pnpm changeset publish
```

### 3. GitHub Actions (CI releases)

```bash
# After npm whoami works — copy token from ~/.npmrc or npm website
gh secret set NPM_TOKEN --repo cobusgreyling/outerloop
```

Then merge to `main` — the [release workflow](../.github/workflows/release.yml) runs CI and publishes on version bumps.

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