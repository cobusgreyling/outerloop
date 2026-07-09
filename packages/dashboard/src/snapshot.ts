import { routeAttention } from "@cobusgreyling/outerloop-attention";
import { runOuterloopAudit } from "@cobusgreyling/outerloop-audit";
import { runCognitiveCheck } from "@cobusgreyling/outerloop-cognitive";
import { listEvidencePackages } from "@cobusgreyling/outerloop-evidence";
import { getActiveHarnessSpec } from "@cobusgreyling/outerloop-harness";
import { queryLedger } from "@cobusgreyling/outerloop-ledger";

export interface DashboardSnapshot {
  generatedAt: string;
  projectRoot: string;
  audit: Awaited<ReturnType<typeof runOuterloopAudit>>;
  attention: Awaited<ReturnType<typeof routeAttention>>;
  cognitive: Awaited<ReturnType<typeof runCognitiveCheck>>;
  evidenceCount: number;
  ledgerCount: number;
  harness: Awaited<ReturnType<typeof getActiveHarnessSpec>>;
}

export async function getDashboardSnapshot(cwd: string): Promise<DashboardSnapshot> {
  const [attention, cognitive, audit, evidence, ledger, harness] = await Promise.all([
    routeAttention(cwd, true),
    runCognitiveCheck({ cwd }),
    runOuterloopAudit(cwd),
    listEvidencePackages(cwd),
    queryLedger({}, cwd),
    getActiveHarnessSpec(cwd),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    projectRoot: cwd,
    audit,
    attention,
    cognitive,
    evidenceCount: evidence.length,
    ledgerCount: ledger.length,
    harness,
  };
}