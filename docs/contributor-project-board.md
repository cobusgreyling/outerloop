# Contributor project board

Triage board for [good first issues](./good-first-issues.md), help-wanted work, and the **v3 / Future** milestone.

## One-time CLI setup

Projects require extra `gh` scopes (not included in default `repo` tokens):

```bash
gh auth refresh -h github.com -s project,read:project
bash scripts/setup-contributor-project.sh
```

The script creates **outerloop contributor backlog**, links it to this repo, and seeds open good-first / help-wanted / v3 issues.

## UI polish (optional)

1. Open the project → add filtered views:
   - **Good first** — `label:"good first issue" is:open`
   - **Help wanted** — `label:"help wanted" is:open`
   - **v3 / Future** — `milestone:"v3 / Future"`
2. Repo → **Projects** → pin the board
3. Profile → **Customize your pins** → include [outerloop](https://github.com/cobusgreyling/outerloop) (profile pins are UI-only; no public API)

## Manual UI path

1. [github.com/cobusgreyling/outerloop](https://github.com/cobusgreyling/outerloop) → **Projects** → **New project**
2. Board template → name **outerloop contributor backlog**
3. Add the views above and link issues from [good-first-issues.md](./good-first-issues.md)