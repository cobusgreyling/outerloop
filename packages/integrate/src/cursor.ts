import fs from "node:fs/promises";
import path from "node:path";

export interface CursorSetupOptions {
  projectRoot: string;
}

export interface CursorSetupResult {
  filesWritten: string[];
}

const CURSOR_RULE = `---
description: outerloop verdict-aware development — evidence, rationale, answerability
globs:
  - "**/*"
alwaysApply: true
---

# outerloop — Own the Outer Loop

You are working in a project governed by **outerloop**. Every significant change must be explainable.

## Before shipping work

1. **Evidence** — Significant agent runs should produce an EvidencePackage:
   \`outerloop evidence package --run-id latest --from loop-engineering\`

2. **Verdict** — A human (or accountable owner) must issue a verdict with **mandatory rationale**:
   \`outerloop verdict review <evidence-id>\`

3. **Answerability** — The ledger must reconstruct why:
   \`outerloop ledger why <commit-sha>\`

## Rules for agent work

- Separate **inner loop** (implement, verify) from **outer loop** (constraints, verdict, ownership).
- Never treat approval as implicit — capture rationale at decision time.
- Apply active **taste profile** and **backpressure policy** before recommending ship.
- Prefer high-signal summaries: executive (1-2 sentences), decision-relevant, technical.
- When risk score ≥ 7 or taste rules escalate, stop and request human verdict.
- Build for the accountable owner, not just the implementer.

## Taste & policy

- Active taste profile: \`.outerloop/taste/active-profile.txt\`
- Active policy: \`.outerloop/policy/active.yaml\`
- Capture new taste rules: \`outerloop taste capture --from-critique <notes.md> --extract-rules\`
`;

const COMPOSER_PROMPT = `# Verdict-Aware Composer Prompt

Use this when starting a Composer session on significant work.

---

You are building under **outerloop** governance.

**Goal:** {{goal}}

**Constraints:**
- Produce evidence-ready artifacts (plan, diffs, test results, risk factors).
- Do not assume ship — prepare for human verdict with captured rationale.
- Flag anything touching auth, payments, or security for escalation.

**When done:**
1. Summarize: executive + decision-relevant + technical
2. Note risk factors and mitigations
3. Recommend verdict (ship/block/narrow) but defer to human owner

**Answerability test:** Can the accountable owner explain exactly why this is safe enough?
`;

const CURSORRULES_LEGACY = `# outerloop

See .cursor/rules/outerloop.mdc for full verdict-aware development rules.

Quick commands:
- outerloop evidence package --run-id latest
- outerloop verdict review <evidence-id>
- outerloop ledger why HEAD
`;

export async function setupCursor(
  options: CursorSetupOptions,
): Promise<CursorSetupResult> {
  const { projectRoot } = options;
  const filesWritten: string[] = [];

  const rulesDir = path.join(projectRoot, ".cursor", "rules");
  await fs.mkdir(rulesDir, { recursive: true });

  const rulePath = path.join(rulesDir, "outerloop.mdc");
  await fs.writeFile(rulePath, CURSOR_RULE, "utf8");
  filesWritten.push(rulePath);

  const promptsDir = path.join(projectRoot, ".cursor", "prompts");
  await fs.mkdir(promptsDir, { recursive: true });

  const promptPath = path.join(promptsDir, "verdict-aware.md");
  await fs.writeFile(promptPath, COMPOSER_PROMPT, "utf8");
  filesWritten.push(promptPath);

  const legacyPath = path.join(projectRoot, ".cursorrules");
  try {
    await fs.access(legacyPath);
  } catch {
    await fs.writeFile(legacyPath, CURSORRULES_LEGACY, "utf8");
    filesWritten.push(legacyPath);
  }

  return { filesWritten };
}