import type { EvidencePackage } from "@cobusgreyling/outerloop-core";
import type { LoopRunEntry } from "./parse-run-log.js";

const SENSITIVE_PATH_PATTERNS = [
  /auth/i,
  /payment/i,
  /billing/i,
  /security/i,
  /credential/i,
  /secret/i,
  /token/i,
];

export interface RiskInput {
  filesChanged: string[];
  runEntry?: LoopRunEntry;
  testResults: EvidencePackage["verification"]["tests"];
  escalations?: number;
}

export function scoreRisk(input: RiskInput): EvidencePackage["riskAssessment"] {
  const factors: string[] = [];
  const mitigations: string[] = [];
  let score = 1;

  const fileCount = input.filesChanged.length;
  if (fileCount === 0) {
    factors.push("No code changes detected (report-only run)");
    score = Math.max(score, 1);
  } else if (fileCount <= 3) {
    factors.push(`Small change set (${fileCount} files)`);
    score = Math.max(score, 2);
  } else if (fileCount <= 10) {
    factors.push(`Moderate change set (${fileCount} files)`);
    score = Math.max(score, 4);
  } else {
    factors.push(`Large change set (${fileCount} files)`);
    score = Math.max(score, 6);
  }

  const sensitiveFiles = input.filesChanged.filter((f) =>
    SENSITIVE_PATH_PATTERNS.some((p) => p.test(f)),
  );
  if (sensitiveFiles.length > 0) {
    factors.push(`Touches sensitive paths: ${sensitiveFiles.join(", ")}`);
    score = Math.max(score, 7);
    mitigations.push("Require senior verdict and extra evidence for sensitive paths");
  }

  const escalations = input.runEntry?.escalations ?? input.escalations ?? 0;
  if (escalations > 0) {
    factors.push(`${escalations} escalation(s) in run log`);
    score = Math.max(score, 5);
  }

  const outcome = input.runEntry?.outcome ?? "";
  if (outcome === "escalated") {
    factors.push("Run outcome marked as escalated");
    score = Math.max(score, 6);
  } else if (outcome === "fix-proposed") {
    factors.push("Agent proposed a fix — requires human verdict");
    score = Math.max(score, 4);
  }

  const failedTests = input.testResults.filter((t) => t.status === "fail");
  if (failedTests.length > 0) {
    factors.push(`${failedTests.length} failing test(s)`);
    score = Math.max(score, 8);
    mitigations.push("Block ship until tests pass");
  } else if (input.testResults.length > 0) {
    mitigations.push("All parsed tests passed");
  }

  if (score <= 3) {
    mitigations.push("Low risk — sampling may apply per policy");
  }

  return {
    score: Math.min(score, 10),
    factors,
    mitigations,
  };
}