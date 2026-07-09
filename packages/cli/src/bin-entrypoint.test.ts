import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { isCliEntrypoint } from "./entrypoint.js";

const tempDirs: string[] = [];

async function makeTempDir(): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "outerloop-bin-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })),
  );
});

describe("isCliEntrypoint", () => {
  const srcDir = path.dirname(fileURLToPath(import.meta.url));
  const distCli = path.resolve(srcDir, "../dist/cli.js");

  it("returns true when argv points at the CLI file", async () => {
    await fs.access(distCli);
    expect(isCliEntrypoint(distCli, ["node", distCli, "--version"])).toBe(true);
  });

  it("returns true when argv is a symlink to the CLI file", async () => {
    await fs.access(distCli);
    const projectRoot = await makeTempDir();
    const binDir = path.join(projectRoot, "node_modules", ".bin");
    await fs.mkdir(binDir, { recursive: true });
    const symlinkPath = path.join(binDir, "outerloop");
    await fs.symlink(distCli, symlinkPath);

    expect(isCliEntrypoint(distCli, ["node", symlinkPath, "--version"])).toBe(true);
  });

  it("runs --version when invoked through a bin symlink", async () => {
    await fs.access(distCli);
    await fs.chmod(distCli, 0o755);
    const projectRoot = await makeTempDir();
    const binDir = path.join(projectRoot, ".bin");
    await fs.mkdir(binDir, { recursive: true });
    const symlinkPath = path.join(binDir, "outerloop");
    await fs.symlink(distCli, symlinkPath);

    const result = spawnSync(symlinkPath, ["--version"], {
      encoding: "utf8",
      cwd: path.resolve(srcDir, ".."),
    });
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe("0.3.2");
  });
});