import { Command } from "commander";
import chalk from "chalk";
import path from "node:path";
import { initProject } from "../init-project.js";

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Initialize outerloop governance in a project")
    .option("--project-root <path>", "Project root", process.cwd())
    .option("--name <name>", "Harness name (default: directory name)")
    .option(
      "--boundary <level>",
      "Harness boundary: strict | moderate | permissive",
      "moderate",
    )
    .option("--with-loop-engineering", "Install loop-engineering integration hooks")
    .option("--with-cursor", "Install Cursor rules for verdict-aware development")
    .option("--with-claude-code", "Install Claude Code CLAUDE.md and post-run helpers")
    .option("--no-coordination", "Skip multi-loop coordination registry")
    .action(async (options) => {
      const cwd = path.resolve(options.projectRoot);
      const boundary = options.boundary as "strict" | "moderate" | "permissive";

      if (!["strict", "moderate", "permissive"].includes(boundary)) {
        console.error(
          chalk.red(`Invalid boundary: ${boundary}. Use strict, moderate, or permissive.`),
        );
        process.exitCode = 1;
        return;
      }

      try {
        const result = await initProject({
          projectRoot: cwd,
          name: options.name,
          boundary,
          withLoopEngineering: options.withLoopEngineering,
          withCursor: options.withCursor,
          withClaudeCode: options.withClaudeCode,
          withCoordination: options.coordination,
        });

        console.log(chalk.green.bold("outerloop initialized"));
        console.log(chalk.dim(`  Project: ${result.projectRoot}`));
        console.log(
          chalk.dim(`  Harness: ${result.harnessName} (${result.boundary} boundary)`),
        );

        if (result.integrations.length > 0) {
          console.log(chalk.dim(`  Integrations: ${result.integrations.join(", ")}`));
        }

        console.log("");
        console.log(chalk.bold("Next steps:"));
        console.log("  1. Package evidence from an agent run:");
        console.log(
          chalk.cyan("     outerloop evidence package --run-id latest --project-root ."),
        );
        console.log("  2. Review and issue a verdict:");
        console.log(chalk.cyan("     outerloop verdict review <evidence-id>"));
        console.log("  3. Reconstruct answerability:");
        console.log(chalk.cyan("     outerloop ledger why <evidence-id>"));
        console.log("");
        console.log(chalk.dim("Docs: https://github.com/cobusgreyling/outerloop/blob/main/QUICKSTART.md"));
      } catch (err) {
        console.error(chalk.red((err as Error).message));
        process.exitCode = 1;
      }
    });
}