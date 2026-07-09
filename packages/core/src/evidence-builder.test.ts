import { describe, expect, it } from "vitest";
import { EvidencePackageBuilder, createEvidencePackage } from "./evidence-builder.js";

describe("EvidencePackageBuilder", () => {
  it("creates a valid minimal evidence package", () => {
    const pkg = createEvidencePackage({
      runId: "run-001",
      loopId: "daily-triage",
      source: "loop-engineering",
      goal: "Triage open issues and produce report",
    });

    expect(pkg.id).toBeTruthy();
    expect(pkg.runId).toBe("run-001");
    expect(pkg.source).toBe("loop-engineering");
    expect(pkg.plan.goal).toContain("Triage");
  });

  it("accepts diffs and risk assessment", () => {
    const pkg = new EvidencePackageBuilder({
      runId: "run-002",
      loopId: "pr-babysitter",
      source: "loop-engineering",
      goal: "Review and fix failing PR checks",
    })
      .withDiffs([
        {
          path: "src/index.ts",
          hunks: "@@ -1 +1 @@",
          additions: 1,
          deletions: 0,
        },
      ])
      .withRiskAssessment({ score: 3, factors: ["low blast radius"] })
      .withSummaries({
        executive: "Small fix to unblock CI.",
        technical: "Updated test assertion.",
        decisionRelevant: "No auth or payment paths touched.",
      })
      .build();

    expect(pkg.implementation.filesChanged).toEqual(["src/index.ts"]);
    expect(pkg.riskAssessment.score).toBe(3);
    expect(pkg.summaries.executive).toContain("Small fix");
  });
});