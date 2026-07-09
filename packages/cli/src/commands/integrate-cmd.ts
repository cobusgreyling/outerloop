import { Command } from "commander";
import chalk from "chalk";
import path from "node:path";
import {
  integrateLoopEngineering,
  setupClaudeCode,
  setupCursor,
} from "@cobusgreyling/outerloop-integrate";

export function registerIntegrateCommands(program: Command): void {
  program
    .command("integrate")
    .description("Install integration adapters")
    .argument("<target>", "loop-engineering | cursor | claude-code | github")
    .option("--project-root <path>", "Project root", process.cwd())
    .action(async (target: string, options) => {
      const cwd = path.resolve(options.projectRoot);

      try {
        if (target === "loop-engineering") {
          const result = await integrateLoopEngineering({ projectRoot: cwd });
          console.log(chalk.green("loop-engineering integration installed:"));
          for (const f of result.filesWritten) {
            console.log(chalk.dim(`  ✓ ${f}`));
          }
          console.log("");
          for (const line of result.instructions) {
            console.log(`  → ${line}`);
          }
        } else if (target === "cursor") {
          const result = await setupCursor({ projectRoot: cwd });
          console.log(chalk.green("Cursor integration installed:"));
          for (const f of result.filesWritten) {
            console.log(chalk.dim(`  ✓ ${f}`));
          }
          console.log("");
          console.log("  → Cursor rules and verdict-aware composer prompt are ready.");
        } else if (target === "claude-code") {
          const result = await setupClaudeCode({ projectRoot: cwd });
          console.log(chalk.green("Claude Code integration installed:"));
          for (const f of result.filesWritten) {
            console.log(chalk.dim(`  ✓ ${f}`));
          }
          console.log("");
          console.log("  → CLAUDE.md and .claude/ helpers are ready.");
        } else if (target === "github") {
          const result = await integrateLoopEngineering({ projectRoot: cwd });
          console.log(chalk.green("GitHub integration (via loop-engineering workflow):"));
          for (const f of result.filesWritten.filter((p) => p.includes(".github"))) {
            console.log(chalk.dim(`  ✓ ${f}`));
          }
        } else {
          console.error(chalk.red(`Unknown target: ${target}`));
          process.exitCode = 1;
        }
      } catch (err) {
        console.error(chalk.red((err as Error).message));
        process.exitCode = 1;
      }
    });

  const cursor = program
    .command("cursor")
    .description("Cursor-specific setup");

  cursor
    .command("setup")
    .description("Install Cursor rules for verdict-aware development")
    .option("--project-root <path>", "Project root", process.cwd())
    .action(async (options) => {
      const cwd = path.resolve(options.projectRoot);
      const result = await setupCursor({ projectRoot: cwd });
      console.log(chalk.green("Cursor setup complete:"));
      for (const f of result.filesWritten) {
        console.log(chalk.dim(`  ✓ ${f}`));
      }
    });
}