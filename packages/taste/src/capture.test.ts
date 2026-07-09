import { describe, expect, it } from "vitest";
import { buildProfileFromCritique } from "./capture.js";

const CRITIQUE = `
# Session critique — daily triage

## Taste Rules

- riskScore > 7 or touches auth → escalate to senior owner
- RULE: failing tests must block ship
- Never merge without captured verdict rationale
`;

describe("capture", () => {
  it("extracts rules from critique sections", () => {
    const profile = buildProfileFromCritique({
      critiquePath: "session-notes.md",
      content: CRITIQUE,
      profileName: "team-default",
    });

    expect(profile.rules.length).toBeGreaterThanOrEqual(2);
    expect(profile.rules.some((r: { action: string }) => r.action === "block")).toBe(true);
    expect(profile.rules.some((r: { when: string }) => r.when.includes("auth"))).toBe(true);
  });
});