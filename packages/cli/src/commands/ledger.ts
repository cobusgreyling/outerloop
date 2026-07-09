import { Command } from "commander";
import chalk from "chalk";
import path from "node:path";
import { reconstructWhy, queryLedger } from "@cobusgreyling/outerloop-ledger";

export function registerLedgerCommands(program: Command): void {
  const ledger = program
    .command("ledger")
    .description("Query and reconstruct decision provenance");

  ledger
    .command("why")
    .description("Reconstruct full answerability chain for a commit or run")
    .argument("<ref>", "Commit SHA, run ID, evidence ID, or verdict ID")
    .option("--project-root <path>", "Project root", process.cwd())
    .option("--json", "Output structured JSON instead of narrative")
    .action(async (ref: string, options) => {
      const cwd = path.resolve(options.projectRoot);

      try {
        const chain = await reconstructWhy(ref, cwd);

        if (options.json) {
          console.log(JSON.stringify(chain, null, 2));
        } else {
          console.log(chain.narrative);
        }
      } catch (err) {
        console.error(chalk.red((err as Error).message));
        process.exitCode = 1;
      }
    });

  ledger
    .command("query")
    .description("Query ledger entries")
    .option("--owner <name>", "Filter by verdict owner")
    .option("--since <duration>", "Time window (e.g. 7d, 30d)")
    .option("--project-root <path>", "Project root", process.cwd())
    .action(async (options) => {
      const cwd = path.resolve(options.projectRoot);
      const entries = await queryLedger(
        { owner: options.owner, since: options.since },
        cwd,
      );

      if (entries.length === 0) {
        console.log(chalk.dim("No ledger entries found."));
        return;
      }

      for (const entry of entries) {
        console.log(
          `${chalk.cyan(entry.id)}  ${entry.decision}  owner=${entry.owner}  run=${entry.runId ?? "-"}  commit=${entry.commitSha?.slice(0, 7) ?? "-"}`,
        );
      }
    });
}