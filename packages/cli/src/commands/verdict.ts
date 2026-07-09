import { Command } from "commander";
import chalk from "chalk";

export function registerVerdictCommands(program: Command): void {
  const verdict = program
    .command("verdict")
    .description("Review evidence and issue production decisions");

  verdict
    .command("review")
    .description("Interactive review of an evidence package (TUI)")
    .argument("<evidence-id>", "Evidence package ID")
    .action((evidenceId: string) => {
      console.log(
        chalk.yellow(
          `Coming in Phase 1: rich TUI review for evidence ${evidenceId}`,
        ),
      );
      console.log(
        chalk.dim(
          "Will show executive summary, diffs, risk score, and mandatory rationale capture.",
        ),
      );
    });

  verdict
    .command("issue")
    .description("Issue a verdict with captured rationale")
    .requiredOption(
      "--decision <decision>",
      "ship | block | redirect | narrow | guardrail | reject",
    )
    .requiredOption("--rationale <text>", "Mandatory rationale for the decision")
    .option("--evidence-id <id>", "Linked evidence package ID")
    .option("--owner <name>", "Verdict owner", process.env.USER ?? "unknown")
    .action((options) => {
      console.log(
        chalk.yellow("Coming in Phase 1: verdict recording to ledger."),
      );
      console.log(
        chalk.dim(
          `Decision: ${options.decision} | Owner: ${options.owner}`,
        ),
      );
      console.log(chalk.dim(`Rationale: ${options.rationale}`));
    });
}