import { describe, expect, it } from "vitest";
import { createHarnessSpec } from "./templates.js";
import { validateHarnessSpec } from "./validator.js";

describe("validateHarnessSpec", () => {
  it("validates a strict harness", () => {
    const spec = createHarnessSpec("my-project", "strict");
    const result = validateHarnessSpec(spec);
    expect(result.valid).toBe(true);
    expect(spec.outside.vetoConditions).toContain("agent-write-without-evidence");
  });
});