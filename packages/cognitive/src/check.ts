import { listEvidencePackages } from "@cobusgreyling/outerloop-evidence";
import { queryLedger } from "@cobusgreyling/outerloop-ledger";
import { summarizeGitChanges } from "./git-changes.js";
import { estimateCognitiveDebt, type CognitiveDebtReport } from "./debt-estimator.js";

export interface CognitiveCheckOptions {
  cwd: string;
  changesRef?: string;
}

export interface CognitiveCheckResult extends CognitiveDebtReport {
  changes: Awaited<ReturnType<typeof summarizeGitChanges>>;
  unverdictedEvidence: number;
}

export async function runCognitiveCheck(
  options: CognitiveCheckOptions,
): Promise<CognitiveCheckResult> {
  const changes = await summarizeGitChanges(options.cwd, options.changesRef ?? "HEAD~5");

  const evidence = await listEvidencePackages(options.cwd);
  const ledger = await queryLedger({}, options.cwd);
  const verdictedIds = new Set(ledger.map((e) => e.evidenceId));
  const unverdicted = evidence.filter((e) => !verdictedIds.has(e.id));
  const avgRisk =
    evidence.length > 0
      ? evidence.reduce((s, e) => s + e.riskScore, 0) / evidence.length
      : 0;

  const debt = estimateCognitiveDebt(changes, {
    unverdictedEvidence: unverdicted.length,
    avgRiskScore: avgRisk,
  });

  return {
    ...debt,
    changes,
    unverdictedEvidence: unverdicted.length,
  };
}