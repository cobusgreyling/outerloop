import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { initProject } from "./init-project.js";

const tempDirs: string[] = [];

async function makeTempDir(): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "outerloop-init-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })),
  );
});

describe("initProject", () => {
  it("creates .outerloop scaffold with harness, policy, and taste", async () => {
    const projectRoot = await makeTempDir();

    const result = await initProject({
      projectRoot,
      name: "demo-app",
      boundary: "strict",
      withCoordination: false,
    });

    expect(result.harnessName).toBe("demo-app");
    expect(result.boundary).toBe("strict");

    const outerloopDir = path.join(projectRoot, ".outerloop");
    await expect(fs.access(path.join(outerloopDir, "harness/demo-app.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(outerloopDir, "policy/active.yaml"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(outerloopDir, "taste/profiles/team-default.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(outerloopDir, "evidence/index.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(outerloopDir, "ledger/index.json"))).resolves.toBeUndefined();
  });

  it("installs optional integrations", async () => {
    const projectRoot = await makeTempDir();

    const result = await initProject({
      projectRoot,
      withLoopEngineering: true,
      withCursor: true,
      withCoordination: true,
    });

    expect(result.integrations).toContain("loop-engineering");
    expect(result.integrations).toContain("cursor");
    expect(result.integrations).toContain("coordination");
    await expect(fs.access(path.join(projectRoot, "outerloop.config.yaml"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(projectRoot, ".cursor/rules/outerloop.mdc"))).resolves.toBeUndefined();
  });
});