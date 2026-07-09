import { describe, expect, it } from "vitest";
import { estimateCognitiveDebt } from "./debt-estimator.js";

describe("estimateCognitiveDebt", () => {
  it("scores sensitive large changes high", () => {
    const report = estimateCognitiveDebt(
      {
        filesChanged: ["src/auth/login.ts", "src/auth/session.ts"],
        totalAdditions: 600,
        totalDeletions: 50,
        commits: 12,
      },
      { unverdictedEvidence: 2, avgRiskScore: 7 },
    );

    expect(report.score).toBeGreaterThanOrEqual(5);
    expect(report.questions.length).toBeGreaterThan(0);
  });
});