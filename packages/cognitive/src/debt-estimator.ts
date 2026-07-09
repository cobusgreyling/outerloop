import type { ChangeSummary } from "./git-changes.js";

export interface CognitiveDebtReport {
  score: number;
  level: "low" | "moderate" | "high" | "critical";
  factors: string[];
  questions: string[];
  narrative: string;
}

const SENSITIVE = [/auth/i, /payment/i, /security/i, /crypto/i];

export function estimateCognitiveDebt(
  changes: ChangeSummary,
  context?: { unverdictedEvidence?: number; avgRiskScore?: number },
): CognitiveDebtReport {
  const factors: string[] = [];
  const questions: string[] = [];
  let score = 0;

  const fileCount = changes.filesChanged.length;
  if (fileCount > 20) {
    score += 3;
    factors.push(`Large recent change set (${fileCount} files)`);
    questions.push("Can you explain the purpose of each major file changed?");
  } else if (fileCount > 8) {
    score += 2;
    factors.push(`Moderate change set (${fileCount} files)`);
  } else if (fileCount > 0) {
    score += 1;
    factors.push(`Recent changes in ${fileCount} file(s)`);
  }

  const linesChanged = changes.totalAdditions + changes.totalDeletions;
  if (linesChanged > 500) {
    score += 2;
    factors.push(`High line churn (${linesChanged} lines)`);
    questions.push("What invariants must hold after this volume of change?");
  }

  if (changes.commits > 10) {
    score += 1;
    factors.push(`${changes.commits} commits in window — context switching cost`);
  }

  const sensitive = changes.filesChanged.filter((f) =>
    SENSITIVE.some((p) => p.test(f)),
  );
  if (sensitive.length > 0) {
    score += 3;
    factors.push(`Sensitive paths touched: ${sensitive.join(", ")}`);
    questions.push("What is the rollback plan if this change is wrong in production?");
    questions.push("Who is the accountable owner for these sensitive paths?");
  }

  if ((context?.unverdictedEvidence ?? 0) > 0) {
    score += 2;
    factors.push(`${context!.unverdictedEvidence} evidence package(s) without verdict`);
    questions.push("Why haven't pending evidence packages received verdicts yet?");
  }

  if ((context?.avgRiskScore ?? 0) >= 6) {
    score += 2;
    factors.push(`Elevated average risk score (${context!.avgRiskScore}/10)`);
  }

  if (questions.length === 0 && fileCount > 0) {
    questions.push("If asked tomorrow, could you explain why these changes are safe?");
    questions.push("What would you monitor after shipping?");
  }

  if (fileCount === 0) {
    questions.push("No recent code changes — is cognitive debt accumulating from unreviewed agent runs?");
  }

  const level =
    score >= 8 ? "critical" : score >= 5 ? "high" : score >= 3 ? "moderate" : "low";

  const narrative = [
    `Cognitive debt estimate: ${score}/10 (${level}).`,
    factors.length > 0 ? factors.join(" ") : "No major debt signals in the change window.",
    "Answer the understanding questions before issuing a ship verdict.",
  ].join(" ");

  return { score: Math.min(score, 10), level, factors, questions, narrative };
}