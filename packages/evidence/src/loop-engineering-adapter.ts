import fs from "node:fs/promises";
import path from "node:path";
import { EvidencePackageBuilder } from "@cobusgreyling/outerloop-core";
import type { EvidencePackage } from "@cobusgreyling/outerloop-core";
import { collectGitDiffs, getCurrentCommitSha } from "./git-diffs.js";
import { parseRunLog, resolveRunEntry } from "./parse-run-log.js";
import { parseStateMd } from "./parse-state.js";
import { parseTestOutput } from "./parse-tests.js";
import { scoreRisk } from "./risk-scorer.js";

export interface LoopEngineeringAdapterOptions {
  projectRoot: string;
  runId: string;
  stateFile?: string;
  runLogFile?: string;
  testOutputFile?: string;
  diffBase?: string;
}

async function readOptionalFile(filePath: string): Promise<string | undefined> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return undefined;
  }
}

function buildSummaries(
  runEntry: ReturnType<typeof resolveRunEntry>,
  state: ReturnType<typeof parseStateMd>,
  filesChanged: string[],
  riskScore: number,
): EvidencePackage["summaries"] {
  const pattern = runEntry?.pattern ?? "unknown";
  const outcome = runEntry?.outcome ?? "unknown";
  const items = runEntry?.items_found ?? 0;
  const escalations = runEntry?.escalations ?? 0;

  const executive =
    filesChanged.length === 0
      ? `${pattern} run (${outcome}): ${items} item(s), no code changes.`
      : `${pattern} run proposes changes to ${filesChanged.length} file(s) (risk ${riskScore}/10).`;

  const technical = [
    `Pattern: ${pattern}`,
    `Outcome: ${outcome}`,
    `Items found: ${items}`,
    `Actions taken: ${runEntry?.actions_taken ?? 0}`,
    `Escalations: ${escalations}`,
    state.highPriority.length > 0
      ? `High priority: ${state.highPriority.slice(0, 3).join("; ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const decisionRelevant = [
    escalations > 0 ? "Escalations require human attention." : null,
    filesChanged.length > 0
      ? `Review diffs for: ${filesChanged.slice(0, 5).join(", ")}${filesChanged.length > 5 ? "…" : ""}`
      : "Report-only — verdict is about whether findings warrant action.",
    `Risk score: ${riskScore}/10`,
  ]
    .filter(Boolean)
    .join(" ");

  return { executive, technical, decisionRelevant };
}

export async function packageFromLoopEngineering(
  options: LoopEngineeringAdapterOptions,
): Promise<EvidencePackage> {
  const {
    projectRoot,
    runId,
    stateFile = "STATE.md",
    runLogFile = "loop-run-log.md",
    testOutputFile,
    diffBase = "HEAD",
  } = options;

  const runLogContent = await readOptionalFile(path.join(projectRoot, runLogFile));
  const stateContent = await readOptionalFile(path.join(projectRoot, stateFile));
  const testContent = testOutputFile
    ? await readOptionalFile(testOutputFile)
    : undefined;

  const runEntries = runLogContent ? parseRunLog(runLogContent) : [];
  const runEntry = resolveRunEntry(runEntries, runId);

  if (!runEntry && runId !== "latest") {
    throw new Error(`Run ID "${runId}" not found in ${runLogFile}`);
  }

  const state = stateContent
    ? parseStateMd(stateContent)
    : { highPriority: [], watchList: [], recentNoise: [], raw: "" };

  const { diffs, filesChanged } = await collectGitDiffs(projectRoot, diffBase);
  const tests = testContent ? parseTestOutput(testContent) : [];
  const risk = scoreRisk({ filesChanged, runEntry, testResults: tests });
  const commitSha = await getCurrentCommitSha(projectRoot);

  const resolvedRunId = runEntry?.run_id ?? runId;
  const loopId = runEntry?.pattern ?? "loop-engineering";

  const builder = new EvidencePackageBuilder({
    runId: resolvedRunId,
    loopId,
    source: "loop-engineering",
    goal: `${loopId}: ${runEntry?.outcome ?? "package evidence for verdict"}`,
    steps: [
      "Parse loop-run-log and STATE.md",
      "Collect git diffs and test output",
      "Score risk and generate summaries",
    ],
    assumptions: [
      state.lastRun ? `STATE.md last run: ${state.lastRun}` : "No STATE.md last-run marker",
    ],
    harnessBoundary: {
      name: "loop-engineering",
      version: "1.0.0",
      path: projectRoot,
    },
  });

  const summaries = buildSummaries(runEntry, state, filesChanged, risk.score);

  const traces = runEntry
    ? [
        {
          id: runEntry.run_id,
          label: `${runEntry.pattern} run`,
          timestamp: new Date(runEntry.run_id).toISOString(),
          detail: `outcome=${runEntry.outcome}, items=${runEntry.items_found}`,
        },
      ]
    : [];

  return builder
    .withDiffs(diffs, filesChanged)
    .withVerification({ tests })
    .withRiskAssessment(risk)
    .withSummaries(summaries)
    .withObservability({
      logs: runLogContent ? [`Loaded ${runLogFile}`] : [],
      traces,
      cost: runEntry?.tokens_estimate
        ? {
            input: Math.floor(runEntry.tokens_estimate * 0.7),
            output: Math.floor(runEntry.tokens_estimate * 0.3),
            total: runEntry.tokens_estimate,
          }
        : undefined,
    })
    .withRawArtifacts({
      stateFile: stateContent ? stateFile : undefined,
      runLogFile: runLogContent ? runLogFile : undefined,
      commitSha,
      runEntry,
      stateSummary: {
        highPriorityCount: state.highPriority.length,
        watchListCount: state.watchList.length,
      },
    })
    .build();
}