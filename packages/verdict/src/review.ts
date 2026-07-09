import { randomUUID } from "node:crypto";
import { input, select, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import type { EvidencePackage, Verdict, VerdictDecision } from "@cobusgreyling/outerloop-core";
import {
  appendLedgerEntry,
  buildLedgerEntry,
  saveVerdict,
  writeCommitManifest,
} from "@cobusgreyling/outerloop-ledger";
import { loadEvidencePackage } from "@cobusgreyling/outerloop-evidence";
import { getCurrentCommitSha } from "@cobusgreyling/outerloop-evidence";
import { renderEvidenceReview } from "./display.js";

export interface ReviewOptions {
  evidenceId: string;
  cwd?: string;
  owner?: string;
  interactive?: boolean;
  dryRun?: boolean;
}

export interface ReviewResult {
  verdict: Verdict;
  ledgerEntryId: string;
  manifestPath?: string;
}

const DECISIONS: { value: VerdictDecision; label: string }[] = [
  { value: "ship", label: "Ship — accept and proceed" },
  { value: "block", label: "Block — do not proceed" },
  { value: "redirect", label: "Redirect — send back for rework" },
  { value: "narrow", label: "Narrow — reduce scope" },
  { value: "guardrail", label: "Guardrail — ship with added constraints" },
  { value: "reject", label: "Reject — discard this work" },
];

export async function reviewEvidence(
  options: ReviewOptions,
): Promise<ReviewResult | undefined> {
  const cwd = options.cwd ?? process.cwd();
  const owner = options.owner ?? process.env.USER ?? "unknown";
  const interactive = options.interactive ?? true;

  const evidence = await loadEvidencePackage(options.evidenceId, cwd);
  if (!evidence) {
    throw new Error(`Evidence package not found: ${options.evidenceId}`);
  }

  console.log(renderEvidenceReview(evidence));

  if (!interactive) {
    return undefined;
  }

  const proceed = await confirm({
    message: "Proceed to verdict?",
    default: true,
  });

  if (!proceed) {
    console.log(chalk.yellow("Review cancelled."));
    return undefined;
  }

  const decision = await select<VerdictDecision>({
    message: "Verdict decision",
    choices: DECISIONS,
  });

  let rationale = await input({
    message: "Rationale (mandatory — why this decision?)",
    validate: (value) => (value.trim().length > 0 ? true : "Rationale is required"),
  });

  if (decision === "ship" && evidence.riskAssessment.score >= 7) {
    const ack = await confirm({
      message: chalk.red(
        `High risk (${evidence.riskAssessment.score}/10). Confirm ship anyway?`,
      ),
      default: false,
    });
    if (!ack) {
      console.log(chalk.yellow("Verdict not issued."));
      return undefined;
    }
    rationale = `${rationale} [High-risk ship acknowledged]`;
  }

  return issueVerdict({
    evidence,
    decision,
    rationale,
    owner,
    cwd,
    dryRun: options.dryRun,
  });
}

export interface IssueVerdictOptions {
  evidence: EvidencePackage;
  decision: VerdictDecision;
  rationale: string;
  owner: string;
  cwd?: string;
  commitSha?: string;
  dryRun?: boolean;
}

export async function issueVerdict(
  options: IssueVerdictOptions,
): Promise<ReviewResult> {
  const cwd = options.cwd ?? process.cwd();
  const commitSha =
    options.commitSha ??
    (await getCurrentCommitSha(cwd)) ??
    (options.evidence.rawArtifacts.commitSha as string | undefined);

  const verdict: Verdict = {
    id: randomUUID(),
    evidenceId: options.evidence.id,
    decision: options.decision,
    rationale: options.rationale,
    owner: options.owner,
    timestamp: new Date().toISOString(),
    linkedCommits: commitSha ? [commitSha] : [],
    linkedPRs: [],
    postVerdictStatus:
      options.decision === "ship" ? "accepted" : `pending-${options.decision}`,
    tasteRulesApplied: [],
    backpressureApplied: [],
  };

  const ledgerEntry = buildLedgerEntry(verdict, options.evidence, commitSha);

  if (options.dryRun) {
    console.log(chalk.dim("Dry run — verdict not persisted."));
    return { verdict, ledgerEntryId: ledgerEntry.id };
  }

  await saveVerdict(verdict, cwd);
  const ledgerEntryId = await appendLedgerEntry(
    ledgerEntry,
    {
      owner: options.owner,
      decision: options.decision,
      runId: options.evidence.runId,
    },
    cwd,
  );

  let manifestPath: string | undefined;
  if (commitSha) {
    manifestPath = await writeCommitManifest(
      commitSha,
      {
        verdictId: verdict.id,
        evidenceId: options.evidence.id,
        decision: verdict.decision,
        rationale: verdict.rationale,
        owner: verdict.owner,
        timestamp: verdict.timestamp,
        ledgerEntryId,
      },
      cwd,
    );
  }

  console.log(chalk.green(`\n✓ Verdict recorded: ${verdict.decision}`));
  console.log(chalk.dim(`  Verdict ID: ${verdict.id}`));
  console.log(chalk.dim(`  Ledger entry: ${ledgerEntryId}`));
  if (manifestPath) {
    console.log(chalk.dim(`  Manifest: ${manifestPath}`));
  }

  return { verdict, ledgerEntryId, manifestPath };
}