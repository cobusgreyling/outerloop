import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { setupClaudeCode } from "./claude-code.js";

let tmpDir: string;

afterEach(async () => {
  if (tmpDir) {
    await fs.rm(tmpDir, { recursive: true, force: true });
    tmpDir = "";
  }
});

describe("setupClaudeCode", () => {
  it("writes CLAUDE.md and claude helper files", async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "outerloop-claude-"));
    const result = await setupClaudeCode({ projectRoot: tmpDir });

    expect(result.filesWritten.length).toBeGreaterThan(0);

    const claudeMd = await fs.readFile(path.join(tmpDir, "CLAUDE.md"), "utf8");
    expect(claudeMd).toContain("outerloop");
    expect(claudeMd).toContain("evidence package");

    await expect(
      fs.access(path.join(tmpDir, ".claude", "settings.outerloop.json")),
    ).resolves.toBeUndefined();
    await expect(
      fs.access(path.join(tmpDir, ".claude", "post-run-outerloop.sh")),
    ).resolves.toBeUndefined();
  });
});