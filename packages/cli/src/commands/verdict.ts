import { Command } from "commander";
import chalk from "chalk";
import path from "node:path";
import { VerdictDecisionSchema } from "@cobusgreyling/outerloop-core";
import { loadEvidencePackage } from "@cobusgreyling/outerloop-evidence";
import { issueVerdict, reviewEvidence } from "@cobusgreyling/outerloop-verdict";

export function registerVerdictCommands(program: Command): void {
  const verdict = program
    .command("verdict")
    .description("Review evidence and issue production decisions");

  verdict
    .command("review")
    .description("Interactive review of an evidence package (TUI)")
    .argument("<evidence-id>", "Evidence package ID or run ID")
    .option("--project-root <path>", "Project root", process.cwd())
    .option("--owner <name>", "Verdict owner", process.env.USER ?? "unknown")
    .option("--dry-run", "Show review without persisting verdict")
    .action(async (evidenceId: string, options) => {
      const cwd = path.resolve(options.projectRoot);

      try {
        await reviewEvidence({
          evidenceId,
          cwd,
          owner: options.owner,
          interactive: true,
          dryRun: options.dryRun,
        });
      } catch (err) {
        console.error(chalk.red((err as Error).message));
        process.exitCode = 1;
      }
    });

  verdict
    .command("issue")
    .description("Issue a verdict with captured rationale (non-interactive)")
    .requiredOption(
      "--decision <decision>",
      "ship | block | redirect | narrow | guardrail | reject",
    )
    .requiredOption("--rationale <text>", "Mandatory rationale for the decision")
    .requiredOption("--evidence-id <id>", "Linked evidence package ID or run ID")
    .option("--project-root <path>", "Project root", process.cwd())
    .option("--owner <name>", "Verdict owner", process.env.USER ?? "unknown")
    .option("--commit <sha>", "Attach verdict to commit SHA")
    .action(async (options) => {
      const cwd = path.resolve(options.projectRoot);
      const decision = VerdictDecisionSchema.parse(options.decision);

      const evidence = await loadEvidencePackage(options.evidenceId, cwd);
      if (!evidence) {
        console.error(chalk.red(`Evidence not found: ${options.evidenceId}`));
        process.exitCode = 1;
        return;
      }

      try {
        await issueVerdict({
          evidence,
          decision,
          rationale: options.rationale,
          owner: options.owner,
          cwd,
          commitSha: options.commit,
        });
      } catch (err) {
        console.error(chalk.red((err as Error).message));
        process.exitCode = 1;
      }
    });
}