import { describe, expect, it } from "vitest";
import { EvidencePackageBuilder } from "@cobusgreyling/outerloop-core";
import { evaluatePolicy, classifyRiskBand } from "./enforcer.js";
import { defaultPolicy } from "./store.js";

describe("policy enforcer", () => {
  it("classifies risk bands", () => {
    expect(classifyRiskBand(2)).toBe("low");
    expect(classifyRiskBand(5)).toBe("medium");
    expect(classifyRiskBand(8)).toBe("high");
  });

  it("requires review for high risk and escalations", () => {
    const evidence = new EvidencePackageBuilder({
      runId: "run-1",
      loopId: "daily-triage",
      source: "loop-engineering",
      goal: "Payment fix",
    })
      .withDiffs([
        {
          path: "src/payments/charge.ts",
          hunks: "@@",
          additions: 10,
          deletions: 2,
        },
      ])
      .withRiskAssessment({ score: 9, factors: ["payments"] })
      .build();

    const result = evaluatePolicy(evidence, defaultPolicy(), "test-seed");
    expect(result.riskBand).toBe("high");
    expect(result.requiresReview).toBe(true);
    expect(result.escalations.length).toBeGreaterThan(0);
  });

  it("allows sample-pass for low risk with favorable roll", () => {
    const evidence = new EvidencePackageBuilder({
      runId: "low-risk-run",
      loopId: "daily-triage",
      source: "loop-engineering",
      goal: "Report only",
    })
      .withRiskAssessment({ score: 1, factors: [] })
      .build();

    const result = evaluatePolicy(evidence, defaultPolicy(), "low-risk-pass");
    expect(result.riskBand).toBe("low");
  });
});