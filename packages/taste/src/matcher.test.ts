import { describe, expect, it } from "vitest";
import { EvidencePackageBuilder } from "@cobusgreyling/outerloop-core";
import { matchTasteRules } from "./matcher.js";
import type { TasteProfile } from "./profile.js";

describe("matchTasteRules", () => {
  it("matches risk and path rules", () => {
    const evidence = new EvidencePackageBuilder({
      runId: "run-1",
      loopId: "daily-triage",
      source: "loop-engineering",
      goal: "Fix auth flow",
    })
      .withDiffs([
        {
          path: "src/auth/login.ts",
          hunks: "@@",
          additions: 1,
          deletions: 0,
        },
      ])
      .withRiskAssessment({ score: 8, factors: ["High risk change"] })
      .build();

    const profile: TasteProfile = {
      name: "team-default",
      version: 1,
      rules: [
        {
          id: "1",
          name: "Auth escalation",
          description: "Auth changes need senior review",
          rationale: "Security",
          when: "touches auth",
          action: "escalate",
          examples: { good: [], bad: [] },
          version: 1,
          provenance: { capturedFrom: "test", date: new Date().toISOString() },
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    const matches = matchTasteRules(evidence, profile);
    expect(matches).toHaveLength(1);
    expect(matches[0]?.rule.action).toBe("escalate");
  });
});