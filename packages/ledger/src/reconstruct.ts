import fs from "node:fs/promises";
import path from "node:path";
import {
  LedgerEntry,
  LedgerEntrySchema,
  getLedgerDir,
  getVerdictsDir,
  getEvidenceDir,
  EvidencePackageSchema,
  VerdictSchema,
} from "@cobusgreyling/outerloop-core";
import { loadCommitManifest, queryLedger, type LedgerIndexEntry } from "./store.js";

export interface AnswerabilityChain {
  ref: string;
  refType: "commit" | "run-id" | "evidence-id" | "verdict-id";
  ledgerEntry?: LedgerEntry;
  verdict?: ReturnType<typeof VerdictSchema.parse>;
  evidence?: ReturnType<typeof EvidencePackageSchema.parse>;
  manifest?: Awaited<ReturnType<typeof loadCommitManifest>>;
  indexEntry?: LedgerIndexEntry;
  narrative: string;
}

async function readLedgerEntries(cwd: string): Promise<LedgerEntry[]> {
  const file = path.join(getLedgerDir(cwd), "entries.jsonl");
  try {
    const content = await fs.readFile(file, "utf8");
    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => LedgerEntrySchema.parse(JSON.parse(line)));
  } catch {
    return [];
  }
}

async function loadEvidenceById(id: string, cwd: string) {
  try {
    const content = await fs.readFile(
      path.join(getEvidenceDir(cwd), `${id}.json`),
      "utf8",
    );
    return EvidencePackageSchema.parse(JSON.parse(content));
  } catch {
    return undefined;
  }
}

async function loadVerdictById(id: string, cwd: string) {
  try {
    const content = await fs.readFile(
      path.join(getVerdictsDir(cwd), `${id}.json`),
      "utf8",
    );
    return VerdictSchema.parse(JSON.parse(content));
  } catch {
    return undefined;
  }
}

function buildNarrative(chain: Omit<AnswerabilityChain, "narrative">): string {
  const lines: string[] = [];

  lines.push(`# Answerability Chain: ${chain.ref}`);
  lines.push("");

  if (chain.manifest) {
    lines.push("## Commit Manifest");
    lines.push(`- Decision: **${chain.manifest.decision}**`);
    lines.push(`- Owner: ${chain.manifest.owner}`);
    lines.push(`- Rationale: ${chain.manifest.rationale}`);
    lines.push("");
  }

  if (chain.evidence) {
    lines.push("## Evidence");
    lines.push(`- ID: ${chain.evidence.id}`);
    lines.push(`- Run: ${chain.evidence.runId} (${chain.evidence.loopId})`);
    lines.push(`- Executive: ${chain.evidence.summaries.executive}`);
    lines.push(`- Risk: ${chain.evidence.riskAssessment.score}/10`);
    if (chain.evidence.riskAssessment.factors.length > 0) {
      lines.push(`- Factors: ${chain.evidence.riskAssessment.factors.join("; ")}`);
    }
    lines.push("");
  }

  if (chain.verdict) {
    lines.push("## Verdict");
    lines.push(`- Decision: **${chain.verdict.decision}**`);
    lines.push(`- Owner: ${chain.verdict.owner}`);
    lines.push(`- Rationale: ${chain.verdict.rationale}`);
    lines.push(`- Status: ${chain.verdict.postVerdictStatus}`);
    lines.push("");
  }

  if (chain.ledgerEntry) {
    lines.push("## Provenance Chain");
    for (const step of chain.ledgerEntry.fullChain) {
      lines.push(`1. **${step.step}** — ${step.decision}`);
    }
    lines.push("");
    lines.push("## Answerability Summary");
    lines.push(chain.ledgerEntry.answerabilitySummary);
  }

  if (!chain.ledgerEntry && !chain.evidence) {
    lines.push("_No ledger entry found for this reference._");
  }

  return lines.join("\n");
}

export async function reconstructWhy(
  ref: string,
  cwd = process.cwd(),
): Promise<AnswerabilityChain> {
  const indexEntries = await queryLedger({}, cwd);
  const ledgerEntries = await readLedgerEntries(cwd);

  // Try commit SHA (full or short)
  let indexEntry = indexEntries.find(
    (e) => e.commitSha === ref || e.commitSha?.startsWith(ref),
  );
  let ledgerEntry = ledgerEntries.find(
    (e) => e.commitSha === ref || e.commitSha?.startsWith(ref),
  );
  let refType: AnswerabilityChain["refType"] = "commit";
  let manifest = await loadCommitManifest(ref, cwd);

  if (!manifest && ref.length >= 7) {
    const manifests = await findManifestByPrefix(ref, cwd);
    manifest = manifests;
  }

  // Try run ID
  if (!ledgerEntry && !indexEntry) {
    indexEntry = indexEntries.find(
      (e) => e.runId === ref || e.runId?.startsWith(ref),
    );
    ledgerEntry = ledgerEntries.find((e) => {
      return indexEntry?.id === e.id;
    });
    if (indexEntry) refType = "run-id";
  }

  // Try evidence ID
  if (!ledgerEntry) {
    ledgerEntry = ledgerEntries.find((e) => e.evidenceId === ref);
    if (ledgerEntry) refType = "evidence-id";
  }

  // Try verdict ID
  if (!ledgerEntry) {
    ledgerEntry = ledgerEntries.find((e) => e.verdictId === ref);
    if (ledgerEntry) refType = "verdict-id";
  }

  const evidenceId = ledgerEntry?.evidenceId ?? manifest?.evidenceId;
  const verdictId = ledgerEntry?.verdictId ?? manifest?.verdictId;

  const evidence = evidenceId ? await loadEvidenceById(evidenceId, cwd) : undefined;
  const verdict = verdictId ? await loadVerdictById(verdictId, cwd) : undefined;

  if (!indexEntry && ledgerEntry) {
    indexEntry = indexEntries.find((e) => e.id === ledgerEntry!.id);
  }

  const partial = {
    ref,
    refType,
    ledgerEntry,
    verdict,
    evidence,
    manifest,
    indexEntry,
  };

  return {
    ...partial,
    narrative: buildNarrative(partial),
  };
}

async function findManifestByPrefix(
  prefix: string,
  cwd: string,
): Promise<Awaited<ReturnType<typeof loadCommitManifest>> | undefined> {
  const { getManifestsDir } = await import("@cobusgreyling/outerloop-core");
  const dir = getManifestsDir(cwd);

  try {
    const files = await fs.readdir(dir);
    const match = files.find((f) => f.replace(".json", "").startsWith(prefix));
    if (match) {
      return loadCommitManifest(match.replace(".json", ""), cwd);
    }
  } catch {
    // no manifests dir
  }

  return undefined;
}