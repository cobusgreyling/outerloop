import fs from "node:fs/promises";
import path from "node:path";
import {
  EvidencePackage,
  EvidencePackageSchema,
  getEvidenceDir,
} from "@cobusgreyling/outerloop-core";

export interface EvidenceIndexEntry {
  id: string;
  runId: string;
  loopId: string;
  timestamp: string;
  riskScore: number;
  path: string;
}

export interface EvidenceIndex {
  entries: EvidenceIndexEntry[];
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

function indexPath(cwd: string): string {
  return path.join(getEvidenceDir(cwd), "index.json");
}

function packagePath(cwd: string, id: string): string {
  return path.join(getEvidenceDir(cwd), `${id}.json`);
}

export async function saveEvidencePackage(
  pkg: EvidencePackage,
  cwd = process.cwd(),
): Promise<string> {
  const dir = getEvidenceDir(cwd);
  await ensureDir(dir);

  const filePath = packagePath(cwd, pkg.id);
  await fs.writeFile(filePath, JSON.stringify(pkg, null, 2), "utf8");

  const indexFile = indexPath(cwd);
  let index: EvidenceIndex = { entries: [] };

  try {
    const raw = await fs.readFile(indexFile, "utf8");
    index = JSON.parse(raw) as EvidenceIndex;
  } catch {
    // fresh index
  }

  const existing = index.entries.findIndex((e) => e.id === pkg.id);
  const entry: EvidenceIndexEntry = {
    id: pkg.id,
    runId: pkg.runId,
    loopId: pkg.loopId,
    timestamp: pkg.timestamp,
    riskScore: pkg.riskAssessment.score,
    path: filePath,
  };

  if (existing >= 0) {
    index.entries[existing] = entry;
  } else {
    index.entries.push(entry);
  }

  await fs.writeFile(indexFile, JSON.stringify(index, null, 2), "utf8");
  return filePath;
}

export async function loadEvidencePackage(
  idOrRunId: string,
  cwd = process.cwd(),
): Promise<EvidencePackage | undefined> {
  const indexFile = indexPath(cwd);

  try {
    const raw = await fs.readFile(indexFile, "utf8");
    const index = JSON.parse(raw) as EvidenceIndex;

    const match =
      index.entries.find((e) => e.id === idOrRunId) ??
      index.entries.find((e) => e.runId === idOrRunId);

    if (match) {
      const content = await fs.readFile(match.path, "utf8");
      return EvidencePackageSchema.parse(JSON.parse(content));
    }
  } catch {
    // fall through to direct file lookup
  }

  const directPath = packagePath(cwd, idOrRunId);
  try {
    const content = await fs.readFile(directPath, "utf8");
    return EvidencePackageSchema.parse(JSON.parse(content));
  } catch {
    return undefined;
  }
}

export async function listEvidencePackages(
  cwd = process.cwd(),
): Promise<EvidenceIndexEntry[]> {
  try {
    const raw = await fs.readFile(indexPath(cwd), "utf8");
    return (JSON.parse(raw) as EvidenceIndex).entries;
  } catch {
    return [];
  }
}