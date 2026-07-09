import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface ChangeSummary {
  filesChanged: string[];
  totalAdditions: number;
  totalDeletions: number;
  commits: number;
}

export async function summarizeGitChanges(
  cwd: string,
  ref = "HEAD~5",
): Promise<ChangeSummary> {
  try {
    const { stdout: logOut } = await execFileAsync(
      "git",
      ["log", `--oneline`, `${ref}..HEAD`],
      { cwd },
    );
    const commits = logOut.split("\n").filter(Boolean).length;

    const { stdout: statOut } = await execFileAsync(
      "git",
      ["diff", "--numstat", ref, "HEAD"],
      { cwd, maxBuffer: 10 * 1024 * 1024 },
    );

    const filesChanged: string[] = [];
    let totalAdditions = 0;
    let totalDeletions = 0;

    for (const line of statOut.split("\n").filter(Boolean)) {
      const [adds, dels, file] = line.split("\t");
      if (!file) continue;
      filesChanged.push(file);
      totalAdditions += Number.parseInt(adds ?? "0", 10) || 0;
      totalDeletions += Number.parseInt(dels ?? "0", 10) || 0;
    }

    return { filesChanged, totalAdditions, totalDeletions, commits };
  } catch {
    return { filesChanged: [], totalAdditions: 0, totalDeletions: 0, commits: 0 };
  }
}