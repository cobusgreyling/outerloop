import chalk from "chalk";
import type { EvidencePackage } from "@cobusgreyling/outerloop-core";

function riskColor(score: number): (text: string) => string {
  if (score <= 3) return chalk.green;
  if (score <= 6) return chalk.yellow;
  return chalk.red;
}

export function renderEvidenceReview(evidence: EvidencePackage): string {
  const lines: string[] = [];
  const color = riskColor(evidence.riskAssessment.score);

  lines.push(chalk.bold.cyan("\n═══ Evidence Review ═══\n"));
  lines.push(chalk.bold("Executive Summary"));
  lines.push(evidence.summaries.executive || chalk.dim("(not generated)"));
  lines.push("");

  lines.push(chalk.bold("Decision-Relevant"));
  lines.push(evidence.summaries.decisionRelevant || chalk.dim("(not generated)"));
  lines.push("");

  lines.push(chalk.bold("Technical"));
  lines.push(evidence.summaries.technical || chalk.dim("(not generated)"));
  lines.push("");

  lines.push(chalk.bold("Risk Assessment"));
  lines.push(color(`Score: ${evidence.riskAssessment.score}/10`));
  for (const factor of evidence.riskAssessment.factors) {
    lines.push(`  • ${factor}`);
  }
  if (evidence.riskAssessment.mitigations.length > 0) {
    lines.push(chalk.dim("Mitigations:"));
    for (const m of evidence.riskAssessment.mitigations) {
      lines.push(chalk.dim(`  → ${m}`));
    }
  }
  lines.push("");

  lines.push(chalk.bold(`Files Changed (${evidence.implementation.filesChanged.length})`));
  if (evidence.implementation.filesChanged.length === 0) {
    lines.push(chalk.dim("  (none)"));
  } else {
    for (const file of evidence.implementation.filesChanged.slice(0, 10)) {
      lines.push(`  ${file}`);
    }
    if (evidence.implementation.filesChanged.length > 10) {
      lines.push(chalk.dim(`  … and ${evidence.implementation.filesChanged.length - 10} more`));
    }
  }
  lines.push("");

  if (evidence.implementation.diffs.length > 0) {
    lines.push(chalk.bold("Diff Preview"));
    const first = evidence.implementation.diffs[0]!;
    const preview = first.hunks.split("\n").slice(0, 20).join("\n");
    lines.push(chalk.dim(preview));
    if (first.hunks.split("\n").length > 20) {
      lines.push(chalk.dim("… (truncated)"));
    }
    lines.push("");
  }

  const tests = evidence.verification.tests;
  lines.push(chalk.bold(`Tests (${tests.length})`));
  if (tests.length === 0) {
    lines.push(chalk.dim("  (none parsed)"));
  } else {
    const passed = tests.filter((t) => t.status === "pass").length;
    const failed = tests.filter((t) => t.status === "fail").length;
    lines.push(`  ${chalk.green(`${passed} passed`)}${failed > 0 ? `, ${chalk.red(`${failed} failed`)}` : ""}`);
  }
  lines.push("");

  if (evidence.observability.traces.length > 0) {
    lines.push(chalk.bold("Traces"));
    for (const trace of evidence.observability.traces) {
      lines.push(`  ${trace.label}: ${trace.detail ?? ""}`);
    }
    lines.push("");
  }

  lines.push(chalk.bold("What would go wrong if we ship this?"));
  lines.push(chalk.dim("Consider blast radius, rollback plan, and monitoring."));
  lines.push("");

  return lines.join("\n");
}