import {
  listEvidencePackages,
  loadEvidencePackage,
} from "@cobusgreyling/outerloop-evidence";
import { queryLedger } from "@cobusgreyling/outerloop-ledger";
import {
  loadActivePolicy,
  defaultPolicy,
  evaluatePolicy,
} from "@cobusgreyling/outerloop-policy";

export interface AttentionItem {
  evidenceId: string;
  runId: string;
  loopId: string;
  riskScore: number;
  priority: number;
  reason: string;
  requiresReview: boolean;
  executive?: string;
}

export interface AttentionRouteResult {
  pending: AttentionItem[];
  total: number;
  batchRecommendation: string;
}

function priorityScore(
  risk: number,
  requiresReview: boolean,
  ageHours: number,
): number {
  let score = risk * 10;
  if (requiresReview) score += 30;
  score += Math.min(ageHours * 2, 20);
  return score;
}

export async function routeAttention(
  cwd: string,
  batch = false,
): Promise<AttentionRouteResult> {
  const evidenceIndex = await listEvidencePackages(cwd);
  const ledger = await queryLedger({}, cwd);
  const verdicted = new Set(ledger.map((e) => e.evidenceId));
  const policy = (await loadActivePolicy(cwd)) ?? defaultPolicy();

  const pending: AttentionItem[] = [];

  for (const entry of evidenceIndex) {
    if (verdicted.has(entry.id)) continue;

    const pkg = await loadEvidencePackage(entry.id, cwd);
    if (!pkg) continue;

    const eval_ = evaluatePolicy(pkg, policy);
    const ageHours =
      (Date.now() - new Date(entry.timestamp).getTime()) / (1000 * 60 * 60);

    const reasons: string[] = [];
    if (eval_.requiresReview) reasons.push("policy requires review");
    if (entry.riskScore >= 7) reasons.push("high risk");
    if (eval_.escalations.length > 0) reasons.push(...eval_.escalations);
    if (reasons.length === 0) reasons.push("awaiting verdict");

    pending.push({
      evidenceId: entry.id,
      runId: entry.runId,
      loopId: entry.loopId,
      riskScore: entry.riskScore,
      priority: priorityScore(entry.riskScore, eval_.requiresReview, ageHours),
      reason: reasons.join("; "),
      requiresReview: eval_.requiresReview,
      executive: pkg.summaries.executive,
    });
  }

  pending.sort((a, b) => b.priority - a.priority);

  const batchRecommendation = batch
    ? pending.length > 0
      ? `Review top ${Math.min(3, pending.length)} by priority: ${pending
          .slice(0, 3)
          .map((p) => p.evidenceId.slice(0, 8))
          .join(", ")}`
      : "No pending verdicts — batch review not needed."
    : pending.length > 0
      ? `Start with ${pending[0]!.evidenceId} (priority ${pending[0]!.priority})`
      : "Queue empty.";

  return { pending, total: pending.length, batchRecommendation };
}