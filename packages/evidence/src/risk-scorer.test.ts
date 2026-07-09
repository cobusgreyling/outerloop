import { describe, expect, it } from "vitest";
import { scoreRisk } from "./risk-scorer.js";

describe("scoreRisk", () => {
  it("scores report-only runs low", () => {
    const risk = scoreRisk({
      filesChanged: [],
      runEntry: {
        run_id: "2026-07-08T10:01:59Z",
        pattern: "daily-triage",
        outcome: "report-only",
        escalations: 0,
      },
      testResults: [],
    });

    expect(risk.score).toBeLessThanOrEqual(3);
  });

  it("elevates score for sensitive paths and failures", () => {
    const risk = scoreRisk({
      filesChanged: ["src/auth/login.ts"],
      testResults: [{ name: "auth test", status: "fail" }],
    });

    expect(risk.score).toBeGreaterThanOrEqual(7);
    expect(risk.factors.some((f) => f.includes("sensitive"))).toBe(true);
  });
});