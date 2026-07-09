import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { scanBrownfield } from "./scan.js";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "outerloop-bf-"));
  await fs.writeFile(
    path.join(tmpDir, "legacy.ts"),
    "// FIXME: tribal knowledge here\nexport const x = 1;\n",
    "utf8",
  );
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe("scanBrownfield", () => {
  it("detects fixme and legacy signals", async () => {
    const report = await scanBrownfield(tmpDir);
    expect(report.signals.length).toBeGreaterThan(0);
    expect(report.recommendations.length).toBeGreaterThan(0);
  });
});