#!/usr/bin/env bash
# One-time: create the outerloop contributor backlog GitHub Project and seed items.
# Requires: gh auth with project + read:project scopes.
set -euo pipefail

OWNER="${OWNER:-cobusgreyling}"
REPO="${REPO:-outerloop}"
TITLE="${TITLE:-outerloop contributor backlog}"

if ! gh auth status -h github.com >/dev/null 2>&1; then
  echo "error: gh is not authenticated. Run: gh auth login" >&2
  exit 1
fi

if ! gh project list --owner "$OWNER" --limit 1 >/dev/null 2>&1; then
  echo "error: token missing project scopes." >&2
  echo "Run once (interactive browser):" >&2
  echo "  gh auth refresh -h github.com -s project,read:project" >&2
  exit 1
fi

echo "Creating project: $TITLE"
# --format json prints project metadata including number/url
PROJECT_JSON="$(gh project create --owner "$OWNER" --title "$TITLE" --format json)"
echo "$PROJECT_JSON"

PROJECT_NUMBER="$(echo "$PROJECT_JSON" | python3 -c 'import json,sys; print(json.load(sys.stdin)["number"])')"
PROJECT_URL="$(echo "$PROJECT_JSON" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("url",""))')"

echo "Linking project to $OWNER/$REPO..."
gh project link "$PROJECT_NUMBER" --owner "$OWNER" --repo "$REPO" 2>/dev/null || \
  echo "note: project link may need UI (Projects tab → Link a project)"

echo "Seeding open good-first / help-wanted / v3 issues..."
# Add open labeled issues + milestone items (idempotent enough for one-time setup)
while read -r n; do
  [ -z "$n" ] && continue
  echo "  + issue #$n"
  gh project item-add "$PROJECT_NUMBER" --owner "$OWNER" --url "https://github.com/$OWNER/$REPO/issues/$n" >/dev/null || true
done < <(
  {
    gh issue list --repo "$OWNER/$REPO" --state open --label "good first issue" --json number --jq '.[].number'
    gh issue list --repo "$OWNER/$REPO" --state open --label "help wanted" --json number --jq '.[].number'
    gh issue list --repo "$OWNER/$REPO" --state open --milestone "v3 / Future" --json number --jq '.[].number'
  } | sort -nu
)

echo
echo "Done."
echo "Project: ${PROJECT_URL:-https://github.com/users/$OWNER/projects/$PROJECT_NUMBER}"
echo
echo "Optional UI polish:"
echo "  1. Open the project → views: Good first / Help wanted / v3 Future"
echo "  2. Repo → Projects → pin this project"
echo "  3. Profile → Customize your pins → add outerloop"
