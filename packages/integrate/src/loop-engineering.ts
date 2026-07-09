import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

export interface LoopEngineeringIntegrateOptions {
  projectRoot: string;
  cliCommand?: string;
  pattern?: string;
}

export interface IntegrateResult {
  filesWritten: string[];
  instructions: string[];
}

const CONFIG_FILE = "outerloop.config.yaml";
const HOOK_SCRIPT = "scripts/outerloop-post-run.sh";
const WORKFLOW_FILE = ".github/workflows/outerloop-evidence.yml";

const DEFAULT_CONFIG = {
  version: 1,
  integration: "loop-engineering",
  evidence: {
    autoPackage: true,
    runLog: "loop-run-log.md",
    stateFile: "STATE.md",
    onRunComplete: `./${HOOK_SCRIPT}`,
  },
  policy: {
    file: ".outerloop/policy/active.yaml",
  },
  taste: {
    activeProfile: "team-default",
  },
  verdict: {
    requireRationale: true,
    attachManifest: true,
  },
};

const POST_RUN_SCRIPT = `#!/usr/bin/env bash
# outerloop post-run hook — auto-package evidence after loop-engineering runs
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUN_ID="\${OUTERLOOP_RUN_ID:-latest}"
CLI="\${OUTERLOOP_CLI:-npx @cobusgreyling/outerloop}"

cd "$ROOT"
$CLI evidence package \\
  --run-id "$RUN_ID" \\
  --from loop-engineering \\
  --project-root "$ROOT"

echo "outerloop: evidence packaged for run $RUN_ID"
`;

const WORKFLOW = `name: outerloop Evidence

on:
  workflow_run:
    workflows: ["Daily Triage", "daily-triage"]
    types: [completed]

jobs:
  package-evidence:
    if: \${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - run: npm install -g @cobusgreyling/outerloop@latest || npx @cobusgreyling/outerloop --version

      - name: Package evidence from latest loop run
        run: |
          npx @cobusgreyling/outerloop evidence package \\
            --run-id latest \\
            --from loop-engineering \\
            --project-root .
        env:
          OUTERLOOP_RUN_ID: latest
`;

export async function integrateLoopEngineering(
  options: LoopEngineeringIntegrateOptions,
): Promise<IntegrateResult> {
  const { projectRoot } = options;
  const filesWritten: string[] = [];

  const configPath = path.join(projectRoot, CONFIG_FILE);
  await fs.writeFile(configPath, YAML.stringify(DEFAULT_CONFIG), "utf8");
  filesWritten.push(configPath);

  const hookPath = path.join(projectRoot, HOOK_SCRIPT);
  await fs.mkdir(path.dirname(hookPath), { recursive: true });
  await fs.writeFile(hookPath, POST_RUN_SCRIPT, { mode: 0o755 });
  filesWritten.push(hookPath);

  const workflowPath = path.join(projectRoot, WORKFLOW_FILE);
  await fs.mkdir(path.dirname(workflowPath), { recursive: true });

  try {
    await fs.access(workflowPath);
  } catch {
    await fs.writeFile(workflowPath, WORKFLOW, "utf8");
    filesWritten.push(workflowPath);
  }

  const loopDocPath = path.join(projectRoot, "LOOP.md");
  const marker = "## outerloop Integration";
  const section = `
${marker}

Auto-evidence hook installed by \`outerloop integrate loop-engineering\`.

- Config: \`${CONFIG_FILE}\`
- Post-run hook: \`${HOOK_SCRIPT}\`
- After each significant loop run: \`./${HOOK_SCRIPT}\` or set \`OUTERLOOP_RUN_ID\`
- Evidence lands in \`.outerloop/evidence/\` for verdict review
`;

  try {
    const loopDoc = await fs.readFile(loopDocPath, "utf8");
    if (!loopDoc.includes(marker)) {
      await fs.appendFile(loopDocPath, section, "utf8");
      filesWritten.push(loopDocPath);
    }
  } catch {
    // LOOP.md optional
  }

  return {
    filesWritten,
    instructions: [
      `Run ./${HOOK_SCRIPT} after loop-engineering runs to auto-package evidence.`,
      "Set OUTERLOOP_RUN_ID=<run_id> to target a specific run.",
      "Review with: outerloop verdict review <evidence-id>",
      "GitHub Actions workflow added for workflow_run triggers (if not already present).",
    ],
  };
}