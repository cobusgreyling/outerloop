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

If your npm account has **2FA** (likely), you need a one-time code from your authenticator app:

```bash
NPM_OTP=123456 bash scripts/publish-to-npm.sh
```

Replace `123456` with the current code — it expires in ~30 seconds.

Without 2FA:

```bash
bash scripts/publish-to-npm.sh
```

**CI tip:** Create an **Automation** token at [npm Access Tokens](https://www.npmjs.com/settings/tokens) (bypasses 2FA) and use it as `NPM_TOKEN` in GitHub secrets.

Or manually:

```bash
pnpm build && pnpm test && pnpm changeset publish
```

### 3. GitHub Actions (CI releases)

**Required:** add `NPM_TOKEN` as a GitHub secret. Without it, the release workflow fails with npm `E404` (looks like "package not in registry" but is actually missing auth).

1. Create an **Automation** token at [npm Access Tokens](https://www.npmjs.com/settings/tokens)
   - Type: Granular or Classic **Automation**
   - Permissions: read + write for `@cobusgreyling/*` packages
2. Set the secret — **either**:

**A)** Manual name (recommended for portability):

```bash
gh secret set NPM_TOKEN --repo cobusgreyling/outerloop
# paste the npm_... token when prompted
```

**B)** npm website → token → destination **GitHub Actions** — npm auto-creates a repo secret named `NPM_<id>`. The release workflow falls back to this if `NPM_TOKEN` is unset.

3. Re-run the failed [Release workflow](https://github.com/cobusgreyling/outerloop/actions/workflows/release.yml) or push to `main`.

**Alternative:** [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC, no token). Configure each package on npmjs.com → Package settings → Trusted publishing → GitHub Actions → repo `cobusgreyling/outerloop`, workflow `release.yml`. The workflow already sets `id-token: write`.

Then merge to `main` — the [release workflow](../.github/workflows/release.yml) runs CI and publishes when versions change.

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