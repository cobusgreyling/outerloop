import type { EvidencePackage } from "@cobusgreyling/outerloop-core";
import {
  getActiveTasteProfile,
  matchTasteRules,
  summarizeTasteMatches,
} from "@cobusgreyling/outerloop-taste";
import {
  loadActivePolicy,
  defaultPolicy,
  evaluatePolicy,
  type PolicyEvaluation,
} from "@cobusgreyling/outerloop-policy";
import chalk from "chalk";

export interface GovernanceContext {
  tasteRuleIds: string[];
  tasteSummary: string[];
  policyEvaluation: PolicyEvaluation;
  backpressureApplied: string[];
}

export async function loadGovernanceContext(
  evidence: EvidencePackage,
  cwd: string,
): Promise<GovernanceContext> {
  const profile = await getActiveTasteProfile(cwd);
  const tasteMatches = profile ? matchTasteRules(evidence, profile) : [];
  const policy = (await loadActivePolicy(cwd)) ?? defaultPolicy();
  const policyEvaluation = evaluatePolicy(evidence, policy);

  return {
    tasteRuleIds: tasteMatches.map((m) => m.rule.id),
    tasteSummary: summarizeTasteMatches(tasteMatches),
    policyEvaluation,
    backpressureApplied: policyEvaluation.appliedRules,
  };
}

export function renderGovernanceContext(ctx: GovernanceContext): string {
  const lines: string[] = [];

  lines.push(chalk.bold.magenta("\n── Governance Context ──\n"));

  lines.push(chalk.bold("Policy"));
  lines.push(
    `  Band: ${ctx.policyEvaluation.riskBand} | Review required: ${ctx.policyEvaluation.requiresReview ? chalk.yellow("yes") : chalk.green("no")}`,
  );
  lines.push(
    `  Sampling: ${(ctx.policyEvaluation.samplingRate * 100).toFixed(0)}% → ${ctx.policyEvaluation.samplingDecision}`,
  );
  if (ctx.policyEvaluation.escalations.length > 0) {
    for (const e of ctx.policyEvaluation.escalations) {
      lines.push(chalk.red(`  ⚠ ${e}`));
    }
  }

  if (ctx.tasteSummary.length > 0) {
    lines.push("");
    lines.push(chalk.bold("Taste Rules Matched"));
    for (const t of ctx.tasteSummary) {
      lines.push(`  • ${t}`);
    }
  } else {
    lines.push("");
    lines.push(chalk.dim("  No taste rules matched (or no active profile)."));
  }

  lines.push("");
  return lines.join("\n");
}