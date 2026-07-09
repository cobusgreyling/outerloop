import fs from "node:fs/promises";
import path from "node:path";

export interface ClaudeCodeSetupOptions {
  projectRoot: string;
}

export interface ClaudeCodeSetupResult {
  filesWritten: string[];
}

const CLAUDE_MD = `# outerloop — Own the Outer Loop

This project uses **outerloop** governance. Every significant agent change must be explainable.

## Workflow

1. **Evidence** — Package what the agent did:
   \`outerloop evidence package --run-id latest --from claude-code\`

2. **Verdict** — A human owner issues a decision with mandatory rationale:
   \`outerloop verdict review <evidence-id>\`

3. **Answerability** — Reconstruct why something shipped:
   \`outerloop ledger why <evidence-id>\`

## Rules for agent work

- Separate **inner loop** (implement, verify) from **outer loop** (constraints, verdict, ownership).
- Never treat approval as implicit — capture rationale at decision time.
- Apply active taste profile (\`.outerloop/taste/active-profile.txt\`) and policy (\`.outerloop/policy/active.yaml\`).
- Escalate to a human verdict when risk score ≥ 7 or taste rules require it.
- Summarize work as: executive (1–2 sentences), decision-relevant, technical.

## Answerability test

Can the accountable owner explain exactly why this is safe enough to ship?
`;

const SETTINGS_FRAGMENT = `{
  "permissions": {
    "allow": [
      "Bash(outerloop *)",
      "Bash(npx @cobusgreyling/outerloop *)"
    ]
  }
}
`;

export async function setupClaudeCode(
  options: ClaudeCodeSetupOptions,
): Promise<ClaudeCodeSetupResult> {
  const { projectRoot } = options;
  const filesWritten: string[] = [];

  const claudeMdPath = path.join(projectRoot, "CLAUDE.md");
  try {
    await fs.access(claudeMdPath);
    const existing = await fs.readFile(claudeMdPath, "utf8");
    if (!existing.includes("outerloop")) {
      await fs.writeFile(
        claudeMdPath,
        `${existing.trimEnd()}\n\n---\n\n${CLAUDE_MD}`,
        "utf8",
      );
      filesWritten.push(claudeMdPath);
    }
  } catch {
    await fs.writeFile(claudeMdPath, CLAUDE_MD, "utf8");
    filesWritten.push(claudeMdPath);
  }

  const claudeDir = path.join(projectRoot, ".claude");
  await fs.mkdir(claudeDir, { recursive: true });

  const settingsExample = path.join(claudeDir, "settings.outerloop.json");
  await fs.writeFile(settingsExample, SETTINGS_FRAGMENT, "utf8");
  filesWritten.push(settingsExample);

  const hookPath = path.join(claudeDir, "post-run-outerloop.sh");
  const hook = `#!/usr/bin/env bash
# Package evidence after a Claude Code session (run manually or from your harness)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI="\${OUTERLOOP_CLI:-npx @cobusgreyling/outerloop}"
cd "$ROOT"
$CLI evidence package --run-id "\${OUTERLOOP_RUN_ID:-latest}" --from claude-code --project-root "$ROOT"
`;
  await fs.writeFile(hookPath, hook, "utf8");
  await fs.chmod(hookPath, 0o755);
  filesWritten.push(hookPath);

  return { filesWritten };
}