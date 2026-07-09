import { Command } from "commander";
import chalk from "chalk";

export function registerLedgerCommands(program: Command): void {
  const ledger = program
    .command("ledger")
    .description("Query and reconstruct decision provenance");

  ledger
    .command("why")
    .description("Reconstruct full answerability chain for a commit or run")
    .argument("<ref>", "Commit SHA or run ID")
    .action((ref: string) => {
      console.log(
        chalk.yellow(
          `Coming in Phase 1: answerability reconstruction for ${ref}`,
        ),
      );
      console.log(
        chalk.dim(
          "Will traverse evidence → verdict → ledger entries and produce an explainable chain.",
        ),
      );
    });

  ledger
    .command("query")
    .description("Query ledger entries")
    .option("--owner <name>", "Filter by verdict owner")
    .option("--since <duration>", "Time window (e.g. 7d, 30d)")
    .action((options) => {
      console.log(chalk.yellow("Coming in Phase 1: ledger query engine."));
      if (options.owner) {
        console.log(chalk.dim(`Owner filter: ${options.owner}`));
      }
      if (options.since) {
        console.log(chalk.dim(`Since: ${options.since}`));
      }
    });
}