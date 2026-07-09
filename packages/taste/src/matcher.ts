import type { EvidencePackage, TasteRule } from "@cobusgreyling/outerloop-core";
import type { TasteProfile } from "./profile.js";

export interface TasteMatch {
  rule: TasteRule;
  reason: string;
}

function matchesWhen(when: string, evidence: EvidencePackage): string | undefined {
  const lower = when.toLowerCase();
  const files = evidence.implementation.filesChanged.join(" ").toLowerCase();
  const risk = evidence.riskAssessment.score;

  const riskGt = lower.match(/risk\s*score\s*>\s*(\d+)/);
  if (riskGt) {
    const threshold = Number.parseInt(riskGt[1] ?? "0", 10);
    if (risk > threshold) {
      return `risk score ${risk} > ${threshold}`;
    }
  }

  const riskGte = lower.match(/risk\s*score\s*>=\s*(\d+)/);
  if (riskGte) {
    const threshold = Number.parseInt(riskGte[1] ?? "0", 10);
    if (risk >= threshold) {
      return `risk score ${risk} >= ${threshold}`;
    }
  }

  const touches = lower.match(/touches\s+(\w+)/);
  if (touches) {
    const topic = touches[1] ?? "";
    if (files.includes(topic)) {
      return `touches ${topic}`;
    }
  }

  if (lower.includes("touches auth") && /auth/.test(files)) {
    return "touches auth paths";
  }
  if (lower.includes("touches payment") && /payment|billing/.test(files)) {
    return "touches payment paths";
  }

  if (lower.includes("escalation") && evidence.rawArtifacts.runEntry) {
    const entry = evidence.rawArtifacts.runEntry as { escalations?: number };
    if ((entry.escalations ?? 0) > 0) {
      return "run had escalations";
    }
  }

  if (lower.includes("failing test")) {
    const fails = evidence.verification.tests.filter((t) => t.status === "fail");
    if (fails.length > 0) return `${fails.length} failing test(s)`;
  }

  if (lower.includes("report-only") && evidence.implementation.filesChanged.length === 0) {
    return "report-only run with no code changes";
  }

  // Literal substring match against summaries for flexible rules
  const haystack = [
    evidence.summaries.executive,
    evidence.summaries.decisionRelevant,
    evidence.plan.goal,
    ...evidence.riskAssessment.factors,
  ]
    .join(" ")
    .toLowerCase();

  if (when.length > 10 && haystack.includes(lower)) {
    return "matched decision-relevant content";
  }

  return undefined;
}

export function matchTasteRules(
  evidence: EvidencePackage,
  profile: TasteProfile,
): TasteMatch[] {
  const matches: TasteMatch[] = [];

  for (const rule of profile.rules) {
    const reason = matchesWhen(rule.when, evidence);
    if (reason) {
      matches.push({ rule, reason });
    }
  }

  return matches;
}

export function summarizeTasteMatches(matches: TasteMatch[]): string[] {
  return matches.map((m) => `${m.rule.name} (${m.rule.action}): ${m.reason}`);
}