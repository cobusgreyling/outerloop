import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Diff } from "@cobusgreyling/outerloop-core";

const execFileAsync = promisify(execFile);

export async function collectGitDiffs(
  cwd: string,
  baseRef = "HEAD",
): Promise<{ diffs: Diff[]; filesChanged: string[] }> {
  try {
    const { stdout: statOut } = await execFileAsync(
      "git",
      ["diff", "--numstat", baseRef],
      { cwd, maxBuffer: 10 * 1024 * 1024 },
    );

    const filesChanged: string[] = [];
    const diffs: Diff[] = [];

    for (const line of statOut.split("\n").filter(Boolean)) {
      const [adds, dels, file] = line.split("\t");
      if (!file) continue;

      filesChanged.push(file);

      let hunks = "";
      try {
        const { stdout: patch } = await execFileAsync(
          "git",
          ["diff", baseRef, "--", file],
          { cwd, maxBuffer: 5 * 1024 * 1024 },
        );
        hunks = patch;
      } catch {
        hunks = "(diff unavailable)";
      }

      diffs.push({
        path: file,
        hunks,
        additions: Number.parseInt(adds ?? "0", 10) || 0,
        deletions: Number.parseInt(dels ?? "0", 10) || 0,
      });
    }

    return { diffs, filesChanged };
  } catch {
    return { diffs: [], filesChanged: [] };
  }
}

export async function getCurrentCommitSha(cwd: string): Promise<string | undefined> {
  try {
    const { stdout } = await execFileAsync("git", ["rev-parse", "HEAD"], { cwd });
    return stdout.trim() || undefined;
  } catch {
    return undefined;
  }
}