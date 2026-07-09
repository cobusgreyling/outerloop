import { Command } from "commander";
import chalk from "chalk";
import { createEvidencePackage } from "@cobusgreyling/outerloop-core";

export function registerEvidenceCommands(program: Command): void {
  const evidence = program
    .command("evidence")
    .description("Generate and package evidence from agent runs");

  evidence
    .command("package")
    .description("Package evidence from a run into an EvidencePackage")
    .requiredOption("--run-id <id>", "Run identifier (e.g. latest, run-001)")
    .option(
      "--from <source>",
      "Evidence source",
      "loop-engineering",
    )
    .option("--loop-id <id>", "Loop identifier", "default")
    .option("--goal <goal>", "Run goal summary")
    .option("--output <path>", "Write JSON to file path")
    .action((options) => {
      const pkg = createEvidencePackage({
        runId: options.runId,
        loopId: options.loopId,
        source: options.from,
        goal: options.goal ?? `Evidence package for run ${options.runId}`,
      });

      const json = JSON.stringify(pkg, null, 2);

      if (options.output) {
        console.log(
          chalk.green(`Evidence package ${pkg.id} ready for ${options.output}`),
        );
        console.log(
          chalk.dim(
            "(File write lands in Phase 1 — outputting to stdout for now)",
          ),
        );
      } else {
        console.log(chalk.green(`Evidence package ${pkg.id} created`));
      }

      console.log(json);
    });
}