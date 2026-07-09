import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createEvidencePackage } from "@cobusgreyling/outerloop-core";
import {
  appendLedgerEntry,
  buildLedgerEntry,
  queryLedger,
  saveVerdict,
} from "./store.js";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "outerloop-ledger-"));
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe("ledger store", () => {
  it("persists verdicts and ledger entries", async () => {
    const evidence = createEvidencePackage({
      runId: "2026-07-08T10:01:59Z",
      loopId: "daily-triage",
      source: "loop-engineering",
      goal: "Triage",
    });

    const verdict = {
      id: "verdict-1",
      evidenceId: evidence.id,
      decision: "ship" as const,
      rationale: "Report-only, no code changes.",
      owner: "cobus",
      timestamp: new Date().toISOString(),
      linkedCommits: [],
      linkedPRs: [],
      postVerdictStatus: "accepted",
      tasteRulesApplied: [],
      backpressureApplied: [],
    };

    await saveVerdict(verdict, tmpDir);
    const entry = buildLedgerEntry(verdict, evidence, "abc123");
    await appendLedgerEntry(
      entry,
      { owner: "cobus", decision: "ship", runId: evidence.runId },
      tmpDir,
    );

    const results = await queryLedger({ owner: "cobus" }, tmpDir);
    expect(results).toHaveLength(1);
    expect(results[0]?.decision).toBe("ship");
  });
});