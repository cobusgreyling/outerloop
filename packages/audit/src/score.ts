import fs from "node:fs/promises";
import path from "node:path";
import { getOuterloopDir } from "@cobusgreyling/outerloop-core";
import { listEvidencePackages } from "@cobusgreyling/outerloop-evidence";
import { queryLedger } from "@cobusgreyling/outerloop-ledger";
import { getActiveHarnessSpec } from "@cobusgreyling/outerloop-harness";
import { loadActivePolicy } from "@cobusgreyling/outerloop-policy";
import { getActiveTasteProfile } from "@cobusgreyling/outerloop-taste";

export interface AuditCheck {
  name: string;
  passed: boolean;
  points: number;
  maxPoints: number;
  detail: string;
}

export interface AuditReport {
  score: number;
  maxScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  checks: AuditCheck[];
  recommendations: string[];
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function runOuterloopAudit(cwd: string): Promise<AuditReport> {
  const checks: AuditCheck[] = [];
  const ol = getOuterloopDir(cwd);

  const hasOuterloopDir = await fileExists(ol);
  checks.push({
    name: "outerloop data directory",
    passed: hasOuterloopDir,
    points: hasOuterloopDir ? 10 : 0,
    maxPoints: 10,
    detail: hasOuterloopDir ? ".outerloop/ present" : "No .outerloop/ — governance not initialized",
  });

  const evidence = await listEvidencePackages(cwd);
  checks.push({
    name: "evidence packaging",
    passed: evidence.length > 0,
    points: evidence.length > 0 ? 15 : 0,
    maxPoints: 15,
    detail: `${evidence.length} evidence package(s)`,
  });

  const ledger = await queryLedger({}, cwd);
  const verdictRate =
    evidence.length > 0 ? ledger.length / evidence.length : 0;
  checks.push({
    name: "verdict coverage",
    passed: verdictRate >= 0.5,
    points: Math.round(verdictRate * 20),
    maxPoints: 20,
    detail: `${ledger.length}/${evidence.length} evidence has ledger entries`,
  });

  const policy = await loadActivePolicy(cwd);
  checks.push({
    name: "backpressure policy",
    passed: !!policy,
    points: policy ? 15 : 0,
    maxPoints: 15,
    detail: policy ? "Active policy configured" : "No policy — using implicit defaults",
  });

  const taste = await getActiveTasteProfile(cwd);
  checks.push({
    name: "taste profile",
    passed: !!taste && (taste.rules.length ?? 0) > 0,
    points: taste && taste.rules.length > 0 ? 15 : 0,
    maxPoints: 15,
    detail: taste ? `Profile "${taste.name}" with ${taste.rules.length} rules` : "No active taste profile",
  });

  const harness = await getActiveHarnessSpec(cwd);
  checks.push({
    name: "harness boundary",
    passed: !!harness,
    points: harness ? 15 : 0,
    maxPoints: 15,
    detail: harness ? `Active harness "${harness.name}"` : "No harness spec",
  });

  const hasOuterloopMd =
    (await fileExists(path.join(cwd, "OUTERLOOP.md"))) ||
    (await fileExists(path.join(cwd, "LOOP.md")));
  checks.push({
    name: "dogfooding manifest",
    passed: hasOuterloopMd,
    points: hasOuterloopMd ? 10 : 0,
    maxPoints: 10,
    detail: hasOuterloopMd ? "OUTERLOOP.md or LOOP.md present" : "No governance manifest doc",
  });

  const score = checks.reduce((s, c) => s + c.points, 0);
  const maxScore = checks.reduce((s, c) => s + c.maxPoints, 0);
  const pct = maxScore > 0 ? score / maxScore : 0;

  const grade: AuditReport["grade"] =
    pct >= 0.9 ? "A" : pct >= 0.75 ? "B" : pct >= 0.6 ? "C" : pct >= 0.4 ? "D" : "F";

  const recommendations: string[] = [];
  for (const c of checks.filter((x) => !x.passed)) {
    recommendations.push(`Improve: ${c.name} — ${c.detail}`);
  }
  if (recommendations.length === 0) {
    recommendations.push("Strong outerloop governance — maintain verdict discipline on merges.");
  }

  return { score, maxScore, grade, checks, recommendations };
}