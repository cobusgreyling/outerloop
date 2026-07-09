import { describe, expect, it } from "vitest";
import { runOuterloopAudit } from "./score.js";

describe("runOuterloopAudit", () => {
  it("returns graded audit for empty project", async () => {
    const report = await runOuterloopAudit("/tmp/nonexistent-outerloop-" + Date.now());
    expect(report.maxScore).toBeGreaterThan(0);
    expect(["A", "B", "C", "D", "F"]).toContain(report.grade);
    expect(report.checks.length).toBeGreaterThan(0);
  });
});