import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  getEvidenceDir,
  getLedgerDir,
  getManifestsDir,
  getOuterloopDir,
  getVerdictsDir,
} from "@cobusgreyling/outerloop-core";
import { initRegistry } from "@cobusgreyling/outerloop-coordination";
import { createHarnessSpec, saveHarnessSpec } from "@cobusgreyling/outerloop-harness";
import type { BoundaryLevel } from "@cobusgreyling/outerloop-harness";
import {
  integrateLoopEngineering,
  setupCursor,
} from "@cobusgreyling/outerloop-integrate";
import {
  defaultPolicy,
  saveActivePolicy,
  writeDefaultPolicyTemplate,
} from "@cobusgreyling/outerloop-policy";
import { saveTasteProfile, setActiveTasteProfile } from "@cobusgreyling/outerloop-taste";
import type { TasteProfile } from "@cobusgreyling/outerloop-taste";

export interface InitProjectOptions {
  projectRoot: string;
  name?: string;
  boundary?: BoundaryLevel;
  withLoopEngineering?: boolean;
  withCursor?: boolean;
  withCoordination?: boolean;
}

export interface InitProjectResult {
  projectRoot: string;
  harnessName: string;
  boundary: BoundaryLevel;
  filesWritten: string[];
  integrations: string[];
}

function defaultHarnessName(projectRoot: string): string {
  const base = path.basename(projectRoot);
  const sanitized = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return sanitized || "my-project";
}

function defaultTasteProfile(): TasteProfile {
  const now = new Date().toISOString();
  return {
    name: "team-default",
    version: 1,
    description: "Default taste profile created by outerloop init",
    rules: [
      {
        id: randomUUID(),
        name: "failing-tests-block-ship",
        description: "Failing tests must block ship",
        rationale: "Ship decisions require a green verification signal",
        when: "failing tests",
        action: "block",
        examples: { good: [], bad: [] },
        version: 1,
        provenance: { capturedFrom: "outerloop init", date: now },
      },
      {
        id: randomUUID(),
        name: "high-risk-escalation",
        description: "High-risk evidence requires senior owner review",
        rationale: "Risk score >= 7 needs explicit human escalation",
        when: "riskScore >= 7",
        action: "escalate",
        examples: { good: [], bad: [] },
        version: 1,
        provenance: { capturedFrom: "outerloop init", date: now },
      },
      {
        id: randomUUID(),
        name: "verdict-rationale-required",
        description: "Never merge without captured verdict rationale",
        rationale: "Answerability requires rationale at decision time",
        when: "missing verdict rationale",
        action: "block",
        examples: { good: [], bad: [] },
        version: 1,
        provenance: { capturedFrom: "outerloop init", date: now },
      },
    ],
    updatedAt: now,
  };
}

async function writeJsonIfMissing(filePath: string, data: unknown): Promise<boolean> {
  try {
    await fs.access(filePath);
    return false;
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    return true;
  }
}

async function writeFileIfMissing(filePath: string, content: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return false;
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, "utf8");
    return true;
  }
}

export async function initProject(
  options: InitProjectOptions,
): Promise<InitProjectResult> {
  const cwd = path.resolve(options.projectRoot);
  const harnessName = options.name ?? defaultHarnessName(cwd);
  const boundary = options.boundary ?? "moderate";
  const filesWritten: string[] = [];
  const integrations: string[] = [];

  const outerloopDir = getOuterloopDir(cwd);
  await fs.mkdir(outerloopDir, { recursive: true });

  const scaffoldTargets = [
    getEvidenceDir(cwd),
    getVerdictsDir(cwd),
    getLedgerDir(cwd),
    getManifestsDir(cwd),
  ];
  for (const dir of scaffoldTargets) {
    await fs.mkdir(dir, { recursive: true });
  }

  if (await writeJsonIfMissing(path.join(getEvidenceDir(cwd), "index.json"), { entries: [] })) {
    filesWritten.push(path.join(getEvidenceDir(cwd), "index.json"));
  }
  if (await writeJsonIfMissing(path.join(getLedgerDir(cwd), "index.json"), { entries: [] })) {
    filesWritten.push(path.join(getLedgerDir(cwd), "index.json"));
  }
  if (await writeFileIfMissing(path.join(getLedgerDir(cwd), "entries.jsonl"), "")) {
    filesWritten.push(path.join(getLedgerDir(cwd), "entries.jsonl"));
  }

  const harnessPath = await saveHarnessSpec(createHarnessSpec(harnessName, boundary), cwd);
  filesWritten.push(harnessPath);
  filesWritten.push(path.join(path.dirname(harnessPath), "active.json"));

  const policyTemplate = path.join(cwd, "backpressure.yaml");
  try {
    await fs.access(policyTemplate);
  } catch {
    await writeDefaultPolicyTemplate(policyTemplate);
    filesWritten.push(policyTemplate);
  }
  const policyDest = await saveActivePolicy(policyTemplate, cwd);
  filesWritten.push(policyDest);

  const tastePath = await saveTasteProfile(defaultTasteProfile(), cwd);
  filesWritten.push(tastePath);
  await setActiveTasteProfile("team-default", cwd);
  filesWritten.push(path.join(outerloopDir, "taste/active-profile.txt"));

  const readmePath = path.join(outerloopDir, "README.md");
  if (
    await writeFileIfMissing(
      readmePath,
      `# .outerloop

Governance artifacts for this project.

| Path | Purpose |
|------|---------|
| \`evidence/\` | EvidencePackages from agent runs |
| \`verdicts/\` | Human verdicts with captured rationale |
| \`ledger/\` | Decision provenance and answerability chain |
| \`manifests/\` | Commit/run manifests linking verdicts |
| \`harness/\` | Inner/outer loop boundary spec |
| \`policy/\` | Active backpressure policy |
| \`taste/\` | Versioned taste profiles |
| \`coordination/\` | Multi-loop coordination registry (optional) |

## Next commands

\`\`\`bash
outerloop evidence package --run-id latest
outerloop verdict review <evidence-id>
outerloop ledger why <evidence-id>
outerloop audit
\`\`\`
`,
    )
  ) {
    filesWritten.push(readmePath);
  }

  if (options.withCoordination ?? true) {
    const registry = await initRegistry(cwd);
    integrations.push("coordination");
    filesWritten.push(path.join(outerloopDir, "coordination/registry.json"));
    void registry;
  }

  if (options.withLoopEngineering) {
    const result = await integrateLoopEngineering({ projectRoot: cwd });
    integrations.push("loop-engineering");
    filesWritten.push(...result.filesWritten);
  }

  if (options.withCursor) {
    const result = await setupCursor({ projectRoot: cwd });
    integrations.push("cursor");
    filesWritten.push(...result.filesWritten);
  }

  void defaultPolicy();

  return {
    projectRoot: cwd,
    harnessName,
    boundary,
    filesWritten,
    integrations,
  };
}