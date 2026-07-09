# Programmatic API

Use these packages when you want to embed outerloop in your own agent harness, CI pipeline, or service — without shelling out to the CLI.

## Packages

| Package | npm | Use for |
|---------|-----|---------|
| `@cobusgreyling/outerloop-core` | [npm](https://www.npmjs.com/package/@cobusgreyling/outerloop-core) | Schemas, paths, EvidencePackage builder |
| `@cobusgreyling/outerloop-evidence` | workspace dep | Save/list evidence, loop-engineering adapter |
| `@cobusgreyling/outerloop-ledger` | workspace dep | Verdicts, ledger entries, `why` reconstruction |

The CLI package composes all of the above. For custom integrations, depend on `outerloop-core` plus the packages you need.

## Quick example: build and save evidence

```ts
import {
  createEvidencePackage,
  EvidencePackageSchema,
} from "@cobusgreyling/outerloop-core";
import { saveEvidencePackage } from "@cobusgreyling/outerloop-evidence";

const pkg = createEvidencePackage({
  runId: "run-2026-07-09",
  loopId: "my-agent",
  source: "custom-harness",
  goal: "Fix flaky login test",
  steps: ["Reproduce", "Patch timeout", "Run suite"],
});

const validated = EvidencePackageSchema.parse(pkg);
const path = await saveEvidencePackage(validated, process.cwd());
console.log("Saved:", path);
```

## EvidencePackage builder

```ts
import { EvidencePackageBuilder } from "@cobusgreyling/outerloop-core";

const pkg = new EvidencePackageBuilder({
  runId: "latest",
  loopId: "ci-sweeper",
  source: "claude-code",
  goal: "Reduce CI queue time",
})
  .withDiffs([{ path: "ci.yml", summary: "Parallelize jobs", linesAdded: 12, linesRemoved: 3 }])
  .withVerification({ tests: [{ name: "ci", status: "pass", durationMs: 42000 }] })
  .withRiskAssessment({ score: 3, factors: ["CI config only"], mitigations: ["Dry-run on fork"] })
  .withSummaries({
    executive: "Parallelize CI jobs; no app code touched.",
    decisionRelevant: "Low risk; rollback is revert one commit.",
    technical: "Matrix strategy splits unit/integration.",
  })
  .build();
```

## Paths helper

```ts
import {
  getOuterloopDir,
  getEvidenceDir,
  getLedgerDir,
  getVerdictsDir,
} from "@cobusgreyling/outerloop-core";

const root = "/path/to/project";
console.log(getEvidenceDir(root)); // .../project/.outerloop/evidence
```

## Record a verdict programmatically

```ts
import { issueVerdict } from "@cobusgreyling/outerloop-verdict";
import type { EvidencePackage } from "@cobusgreyling/outerloop-core";

async function ship(evidence: EvidencePackage) {
  return issueVerdict({
    evidence,
    decision: "ship",
    rationale: "Tests green; scope limited to CI config.",
    owner: "platform-team",
    commitSha: "abc123",
    cwd: process.cwd(),
  });
}
```

## Reconstruct answerability

```ts
import { reconstructWhy } from "@cobusgreyling/outerloop-ledger";

const chain = await reconstructWhy("evidence-id-here", process.cwd());
console.log(chain.narrative);
```

## loop-engineering adapter

```ts
import { packageFromLoopEngineering } from "@cobusgreyling/outerloop-evidence";

const pkg = await packageFromLoopEngineering({
  projectRoot: "/path/to/repo",
  runId: "latest",
  testOutputPath: "/path/to/test-output.txt",
});
```

## TypeScript

All packages ship `.d.ts` types. Use `strict` mode; schemas are Zod-validated at runtime.

## When to use CLI vs API

| Use CLI | Use API |
|---------|---------|
| Local dev, human review TUI | Custom agent harness post-run hook |
| One-off adoption (`npx init`) | SaaS / internal platform integration |
| Shell scripts and GitHub Actions | Type-safe pipeline in Node/Bun |

See also: [CLI reference](./cli.md) · [GitHub Action](./github-action.md)