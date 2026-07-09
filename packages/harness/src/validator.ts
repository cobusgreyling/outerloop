import type { EvidencePackage, HarnessSpec } from "@cobusgreyling/outerloop-core";

export interface HarnessValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateHarnessSpec(spec: HarnessSpec): HarnessValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!spec.name) errors.push("Harness name is required");
  if (spec.inside.capabilities.length === 0) {
    errors.push("Inside capabilities must not be empty");
  }
  if (spec.outside.humanAgency.length === 0) {
    errors.push("Outside humanAgency must define at least one human-owned concern");
  }
  if (spec.outside.vetoConditions.length === 0) {
    warnings.push("No veto conditions — boundary may be too permissive");
  }
  if (!spec.backpressureDefaults.policyId) {
    warnings.push("No backpressure policy linked");
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function checkEvidenceAgainstHarness(
  evidence: EvidencePackage,
  spec: HarnessSpec,
): HarnessValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (evidence.harnessBoundary.name !== spec.name) {
    warnings.push(
      `Evidence harness "${evidence.harnessBoundary.name}" differs from active "${spec.name}"`,
    );
  }

  const hasWrites = evidence.implementation.filesChanged.length > 0;
  const strictWriteBlock = spec.outside.vetoConditions.includes("agent-write-without-evidence");

  if (hasWrites && strictWriteBlock && !evidence.summaries.decisionRelevant) {
    errors.push("Agent write detected without decision-relevant summary (strict boundary)");
  }

  if (
    evidence.riskAssessment.score >= 7 &&
    !spec.outside.humanAgency.includes("all-merges")
  ) {
    warnings.push("High-risk evidence should route through human agency / verdict");
  }

  return { valid: errors.length === 0, errors, warnings };
}