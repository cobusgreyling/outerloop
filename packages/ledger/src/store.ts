import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  LedgerEntry,
  LedgerEntrySchema,
  Verdict,
  VerdictSchema,
  EvidencePackage,
  getLedgerDir,
  getVerdictsDir,
  getManifestsDir,
} from "@cobusgreyling/outerloop-core";

export interface LedgerIndexEntry {
  id: string;
  verdictId: string;
  evidenceId: string;
  commitSha?: string;
  runId?: string;
  owner: string;
  timestamp: string;
  decision: string;
}

export interface LedgerIndex {
  entries: LedgerIndexEntry[];
}

export interface VerdictManifest {
  verdictId: string;
  evidenceId: string;
  decision: string;
  rationale: string;
  owner: string;
  timestamp: string;
  ledgerEntryId: string;
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

function ledgerEntriesPath(cwd: string): string {
  return path.join(getLedgerDir(cwd), "entries.jsonl");
}

function ledgerIndexPath(cwd: string): string {
  return path.join(getLedgerDir(cwd), "index.json");
}

function verdictPath(cwd: string, id: string): string {
  return path.join(getVerdictsDir(cwd), `${id}.json`);
}

function manifestPath(cwd: string, commitSha: string): string {
  return path.join(getManifestsDir(cwd), `${commitSha}.json`);
}

export async function saveVerdict(
  verdict: Verdict,
  cwd = process.cwd(),
): Promise<string> {
  const validated = VerdictSchema.parse(verdict);
  await ensureDir(getVerdictsDir(cwd));
  const filePath = verdictPath(cwd, validated.id);
  await fs.writeFile(filePath, JSON.stringify(validated, null, 2), "utf8");
  return filePath;
}

export async function loadVerdict(
  id: string,
  cwd = process.cwd(),
): Promise<Verdict | undefined> {
  try {
    const content = await fs.readFile(verdictPath(cwd, id), "utf8");
    return VerdictSchema.parse(JSON.parse(content));
  } catch {
    return undefined;
  }
}

export async function appendLedgerEntry(
  entry: LedgerEntry,
  meta: {
    owner: string;
    decision: string;
    runId?: string;
  },
  cwd = process.cwd(),
): Promise<string> {
  const validated = LedgerEntrySchema.parse(entry);
  await ensureDir(getLedgerDir(cwd));

  await fs.appendFile(
    ledgerEntriesPath(cwd),
    `${JSON.stringify(validated)}\n`,
    "utf8",
  );

  const indexFile = ledgerIndexPath(cwd);
  let index: LedgerIndex = { entries: [] };

  try {
    const raw = await fs.readFile(indexFile, "utf8");
    index = JSON.parse(raw) as LedgerIndex;
  } catch {
    // fresh index
  }

  index.entries.push({
    id: validated.id,
    verdictId: validated.verdictId,
    evidenceId: validated.evidenceId,
    commitSha: validated.commitSha,
    runId: meta.runId,
    owner: meta.owner,
    timestamp: new Date().toISOString(),
    decision: meta.decision,
  });

  await fs.writeFile(indexFile, JSON.stringify(index, null, 2), "utf8");
  return validated.id;
}

export async function writeCommitManifest(
  commitSha: string,
  manifest: VerdictManifest,
  cwd = process.cwd(),
): Promise<string> {
  await ensureDir(getManifestsDir(cwd));
  const filePath = manifestPath(cwd, commitSha);
  await fs.writeFile(filePath, JSON.stringify(manifest, null, 2), "utf8");
  return filePath;
}

export async function loadCommitManifest(
  commitSha: string,
  cwd = process.cwd(),
): Promise<VerdictManifest | undefined> {
  try {
    const content = await fs.readFile(manifestPath(cwd, commitSha), "utf8");
    return JSON.parse(content) as VerdictManifest;
  } catch {
    return undefined;
  }
}

export function buildLedgerEntry(
  verdict: Verdict,
  evidence: EvidencePackage,
  commitSha?: string,
): LedgerEntry {
  return LedgerEntrySchema.parse({
    id: randomUUID(),
    verdictId: verdict.id,
    evidenceId: evidence.id,
    commitSha,
    fullChain: [
      {
        step: "evidence",
        evidence: evidence.id,
        decision: `Packaged from ${evidence.source} run ${evidence.runId}`,
      },
      {
        step: "risk-assessment",
        evidence: `score=${evidence.riskAssessment.score}`,
        decision: evidence.riskAssessment.factors.join("; ") || "no factors",
      },
      {
        step: "verdict",
        evidence: verdict.id,
        decision: `${verdict.decision}: ${verdict.rationale}`,
      },
    ],
    answerabilitySummary: [
      `Run ${evidence.runId} (${evidence.loopId}) produced evidence ${evidence.id}.`,
      evidence.summaries.executive,
      `Risk ${evidence.riskAssessment.score}/10.`,
      `${verdict.owner} issued ${verdict.decision}: ${verdict.rationale}`,
    ].join(" "),
  });
}

export async function queryLedger(
  filters: { owner?: string; since?: string },
  cwd = process.cwd(),
): Promise<LedgerIndexEntry[]> {
  try {
    const raw = await fs.readFile(ledgerIndexPath(cwd), "utf8");
    let entries = (JSON.parse(raw) as LedgerIndex).entries;

    if (filters.owner) {
      entries = entries.filter((e) => e.owner === filters.owner);
    }

    if (filters.since) {
      const ms = parseDuration(filters.since);
      if (ms > 0) {
        const cutoff = Date.now() - ms;
        entries = entries.filter((e) => new Date(e.timestamp).getTime() >= cutoff);
      }
    }

    return entries;
  } catch {
    return [];
  }
}

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([dhm])$/);
  if (!match) return 0;

  const value = Number.parseInt(match[1] ?? "0", 10);
  const unit = match[2];

  switch (unit) {
    case "d":
      return value * 24 * 60 * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "m":
      return value * 60 * 1000;
    default:
      return 0;
  }
}