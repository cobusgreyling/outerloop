import { describe, expect, it } from "vitest";
import { getDashboardSnapshot } from "./snapshot.js";

describe("getDashboardSnapshot", () => {
  it("returns snapshot for empty project path", async () => {
    const snap = await getDashboardSnapshot("/tmp/outerloop-dash-" + Date.now());
    expect(snap.audit.maxScore).toBeGreaterThan(0);
    expect(snap.evidenceCount).toBe(0);
  });
});