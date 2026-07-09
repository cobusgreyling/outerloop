import { describe, expect, it } from "vitest";
import { createEvidencePackage } from "@cobusgreyling/outerloop-core";
import { renderEvidenceReview } from "./display.js";

describe("renderEvidenceReview", () => {
  it("renders key sections for review", () => {
    const evidence = createEvidencePackage({
      runId: "2026-07-08T10:01:59Z",
      loopId: "daily-triage",
      source: "loop-engineering",
      goal: "Triage",
    });

    const output = renderEvidenceReview({
      ...evidence,
      summaries: {
        executive: "Report-only run.",
        technical: "Pattern: daily-triage",
        decisionRelevant: "No code changes.",
      },
      riskAssessment: { score: 2, factors: ["No changes"], mitigations: [] },
    });

    expect(output).toContain("Evidence Review");
    expect(output).toContain("Report-only run.");
    expect(output).toContain("Score: 2/10");
  });
});