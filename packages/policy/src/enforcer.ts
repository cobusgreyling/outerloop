import type { BackpressurePolicy, EvidencePackage } from "@cobusgreyling/outerloop-core";

export type RiskBand = "high" | "medium" | "low";

export interface PolicyEvaluation {
  riskBand: RiskBand;
  requiresReview: boolean;
  samplingRate: number;
  samplingDecision: "review" | "sample-pass" | "auto-pass";
  escalations: string[];
  appliedRules: string[];
  timebox?: string;
}

function parseSamplingRate(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const normalized = value.trim().replace("%", "");
  const num = Number.parseFloat(normalized);
  if (Number.isNaN(num)) return fallback;
  return Math.min(Math.max(num / 100, 0), 1);
}

export function classifyRiskBand(score: number): RiskBand {
  if (score >= 7) return "high";
  if (score >= 4) return "medium";
  return "low";
}

function evaluateEscalationCondition(
  condition: string,
  evidence: EvidencePackage,
): boolean {
  const lower = condition.toLowerCase();
  const files = evidence.implementation.filesChanged.join(" ").toLowerCase();
  const risk = evidence.riskAssessment.score;

  const riskGt = lower.match(/riskscore\s*>\s*(\d+)/);
  if (riskGt && risk > Number.parseInt(riskGt[1] ?? "0", 10)) return true;

  if (lower.includes("riskscore >") || lower.includes("risk score >")) {
    const m = lower.match(/risk\s*score\s*>\s*(\d+)/);
    if (m && risk > Number.parseInt(m[1] ?? "0", 10)) return true;
  }

  if (lower.includes("touchespayments") || lower.includes("touches payments")) {
    if (/payment|billing/.test(files)) return true;
  }

  if (lower.includes("touchesauth") || lower.includes("touches auth")) {
    if (/auth/.test(files)) return true;
  }

  if (lower.includes("escalation")) {
    const entry = evidence.rawArtifacts.runEntry as { escalations?: number } | undefined;
    if ((entry?.escalations ?? 0) > 0) return true;
  }

  const failing = evidence.verification.tests.some((t) => t.status === "fail");
  if (lower.includes("failingtest") || lower.includes("failing test")) {
    if (failing) return true;
  }

  return false;
}

export function evaluatePolicy(
  evidence: EvidencePackage,
  policy: BackpressurePolicy,
  seed?: string,
): PolicyEvaluation {
  const riskBand = classifyRiskBand(evidence.riskAssessment.score);
  const sampling = policy.sampling;

  const rates = {
    high: parseSamplingRate(sampling?.highRisk, 1),
    medium: parseSamplingRate(sampling?.mediumRisk, 0.3),
    low: parseSamplingRate(sampling?.lowRisk, 0.05),
  };

  const samplingRate = rates[riskBand];
  const hash = simpleHash(`${seed ?? evidence.id}:${evidence.runId}`);
  const roll = (hash % 10000) / 10000;

  const escalations: string[] = [];
  for (const rule of policy.escalation ?? []) {
    if (evaluateEscalationCondition(rule.if, evidence)) {
      escalations.push(`${rule.if} → ${rule.then}`);
    }
  }

  const requiresReview =
    escalations.length > 0 || roll < samplingRate || riskBand === "high";

  let samplingDecision: PolicyEvaluation["samplingDecision"] = "auto-pass";
  if (escalations.length > 0 || roll < samplingRate) {
    samplingDecision = "review";
  } else if (riskBand === "medium") {
    samplingDecision = "sample-pass";
  }

  const appliedRules: string[] = [
    `riskBand=${riskBand}`,
    `samplingRate=${(samplingRate * 100).toFixed(0)}%`,
    `roll=${(roll * 100).toFixed(1)}%`,
  ];
  appliedRules.push(...escalations);

  return {
    riskBand,
    requiresReview,
    samplingRate,
    samplingDecision,
    escalations,
    appliedRules,
    timebox: policy.timebox?.defaultLoop,
  };
}

function simpleHash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}