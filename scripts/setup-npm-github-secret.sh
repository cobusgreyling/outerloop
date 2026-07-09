#!/usr/bin/env bash
set -euo pipefail

if ! npm whoami >/dev/null 2>&1; then
  echo "ERROR: npm whoami failed. Run: npm login --auth-type=web --scope=@cobusgreyling"
  exit 1
fi

TOKEN="$(node -e "
  const fs = require('fs');
  const rc = fs.readFileSync(process.env.HOME + '/.npmrc', 'utf8');
  const m = rc.match(/_authToken=(.+)/);
  if (!m) process.exit(1);
  console.log(m[1].trim());
")"

if [[ -z "${TOKEN}" ]]; then
  echo "ERROR: No _authToken in ~/.npmrc"
  exit 1
fi

echo "Setting NPM_TOKEN for cobusgreyling/outerloop (from ~/.npmrc)..."
echo "${TOKEN}" | gh secret set NPM_TOKEN --repo cobusgreyling/outerloop
echo "Done. Release workflow can now publish on version bumps."