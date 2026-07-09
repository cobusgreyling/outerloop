import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setupCursor } from "./cursor.js";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "outerloop-cursor-"));
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe("setupCursor", () => {
  it("writes cursor rules and composer prompt", async () => {
    const result = await setupCursor({ projectRoot: tmpDir });
    expect(result.filesWritten.length).toBeGreaterThanOrEqual(2);

    const rule = await fs.readFile(
      path.join(tmpDir, ".cursor", "rules", "outerloop.mdc"),
      "utf8",
    );
    expect(rule).toContain("outerloop");
    expect(rule).toContain("mandatory rationale");
  });
});