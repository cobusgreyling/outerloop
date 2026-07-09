import chalk from "chalk";
import type { DashboardSnapshot } from "./snapshot.js";

export function renderTextDashboard(snapshot: DashboardSnapshot): string {
  const { audit, attention, cognitive, harness } = snapshot;
  const lines: string[] = [];

  lines.push(chalk.bold.cyan("\n╔══════════════════════════════════════════╗"));
  lines.push(chalk.bold.cyan("║       outerloop Governance Dashboard      ║"));
  lines.push(chalk.bold.cyan("╚══════════════════════════════════════════╝\n"));

  const gradeColor =
    audit.grade === "A" || audit.grade === "B"
      ? chalk.green
      : audit.grade === "C"
        ? chalk.yellow
        : chalk.red;
  lines.push(chalk.bold("Audit Score"));
  lines.push(`  ${gradeColor(`${audit.score}/${audit.maxScore} (${audit.grade})`)}`);
  lines.push("");

  lines.push(chalk.bold("Queue"));
  lines.push(`  Evidence packages: ${snapshot.evidenceCount}`);
  lines.push(`  Ledger entries:    ${snapshot.ledgerCount}`);
  lines.push(`  Pending verdicts:  ${chalk.yellow(String(attention.total))}`);
  lines.push("");

  const debtColor =
    cognitive.level === "low"
      ? chalk.green
      : cognitive.level === "moderate"
        ? chalk.yellow
        : chalk.red;
  lines.push(chalk.bold("Cognitive Debt"));
  lines.push(
    `  ${debtColor(`${cognitive.score}/10 (${cognitive.level})`)} — ${cognitive.unverdictedEvidence} unverdicted`,
  );
  lines.push("");

  lines.push(chalk.bold("Harness"));
  lines.push(
    harness
      ? `  Active: ${harness.name} v${harness.version} (${harness.inside.toolsWhitelist.length} tools inside)`
      : chalk.dim("  No active harness spec"),
  );
  lines.push("");

  if (attention.pending.length > 0) {
    lines.push(chalk.bold("Attention Priority (top 5)"));
    for (const item of attention.pending.slice(0, 5)) {
      const risk =
        item.riskScore >= 7 ? chalk.red : item.riskScore >= 4 ? chalk.yellow : chalk.green;
      lines.push(
        `  ${risk(`${item.riskScore}/10`)} ${item.evidenceId.slice(0, 8)}…  ${item.loopId}  p=${Math.round(item.priority)}`,
      );
      if (item.executive) {
        lines.push(chalk.dim(`    ${item.executive.slice(0, 70)}`));
      }
    }
    lines.push("");
    lines.push(chalk.dim(`Batch: ${attention.batchRecommendation}`));
  }

  lines.push("");
  return lines.join("\n");
}