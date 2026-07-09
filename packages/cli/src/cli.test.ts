import { describe, expect, it } from "vitest";
import { createProgram } from "./cli.js";

describe("createProgram", () => {
  it("registers core command groups", () => {
    const program = createProgram();
    const names = program.commands.map((cmd) => cmd.name());

    expect(names).toContain("evidence");
    expect(names).toContain("verdict");
    expect(names).toContain("ledger");
    expect(names).toContain("harness");
    expect(names).toContain("taste");
    expect(names).toContain("dashboard");
    expect(names).toContain("audit");
    expect(names).toContain("brownfield");
    expect(names).toContain("coordination");
  });
});