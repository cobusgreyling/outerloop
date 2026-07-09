import { Command } from "commander";
import chalk from "chalk";
import path from "node:path";
import {
  initRegistry,
  loadRegistry,
  registerLoop,
  updateLoopStatus,
  checkCollisions,
  LoopLevelSchema,
} from "@cobusgreyling/outerloop-coordination";

export function registerCoordinationCommands(program: Command): void {
  const coordination = program
    .command("coordination")
    .description("Multi-loop coordination registry");

  coordination
    .command("init")
    .description("Initialize default multi-loop registry (loop-engineering patterns)")
    .option("--project-root <path>", "Project root", process.cwd())
    .action(async (options) => {
      const cwd = path.resolve(options.projectRoot);
      const registry = await initRegistry(cwd);
      console.log(chalk.green(`Registry initialized with ${registry.loops.length} loops`));
      for (const loop of registry.loops) {
        console.log(chalk.dim(`  p${loop.priority} ${loop.pattern} (${loop.cadence}) → ${loop.stateFile}`));
      }
    });

  coordination
    .command("list")
    .description("List registered loops")
    .option("--project-root <path>", "Project root", process.cwd())
    .option("--json", "Output JSON")
    .action(async (options) => {
      const cwd = path.resolve(options.projectRoot);
      const registry = await loadRegistry(cwd);

      if (!registry) {
        console.log(chalk.yellow("No registry. Run: outerloop coordination init"));
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(registry, null, 2));
        return;
      }

      console.log(chalk.bold("\nMulti-loop Registry\n"));
      console.log(chalk.dim(`Priority: ${registry.priorityStack.join(" → ")}`));
      console.log("");
      for (const loop of [...registry.loops].sort((a, b) => a.priority - b.priority)) {
        const statusColor =
          loop.status === "acting" ? chalk.yellow : loop.status === "blocked" ? chalk.red : chalk.green;
        console.log(
          `${statusColor(loop.status.padEnd(7))} p${loop.priority}  ${loop.pattern}  ${loop.cadence}  ${loop.stateFile}`,
        );
        if (loop.actingOn) {
          console.log(chalk.dim(`         acting_on: ${loop.actingOn}`));
        }
      }
    });

  coordination
    .command("register")
    .description("Register or update a loop in the registry")
    .requiredOption("--pattern <name>", "Loop pattern name")
    .requiredOption("--level <level>", "L0 | L1 | L2 | L3")
    .requiredOption("--cadence <cadence>", "e.g. 15m, 1d")
    .requiredOption("--state-file <path>", "State file path")
    .option("--priority <n>", "Priority (1=highest)", "5")
    .option("--project-root <path>", "Project root", process.cwd())
    .action(async (options) => {
      const cwd = path.resolve(options.projectRoot);
      const level = LoopLevelSchema.parse(options.level);

      const loop = await registerLoop(cwd, {
        pattern: options.pattern,
        level,
        cadence: options.cadence,
        stateFile: options.stateFile,
        priority: Number.parseInt(options.priority, 10),
        status: "idle",
      });

      console.log(chalk.green(`Registered ${loop.pattern} (priority ${loop.priority})`));
    });

  coordination
    .command("status")
    .description("Update loop status (acting, idle, etc.)")
    .requiredOption("--pattern <name>", "Loop pattern")
    .requiredOption("--status <status>", "idle | acting | waiting | blocked")
    .option("--acting-on <target>", "Branch, PR, or resource ID")
    .option("--project-root <path>", "Project root", process.cwd())
    .action(async (options) => {
      const cwd = path.resolve(options.projectRoot);
      const updated = await updateLoopStatus(cwd, options.pattern, {
        status: options.status,
        actingOn: options.actingOn,
        lastRun: new Date().toISOString(),
      });

      if (!updated) {
        console.error(chalk.red(`Loop not found: ${options.pattern}`));
        process.exitCode = 1;
        return;
      }

      console.log(chalk.green(`${updated.pattern} → ${updated.status}${updated.actingOn ? ` (${updated.actingOn})` : ""}`));
    });

  coordination
    .command("check")
    .description("Check for multi-loop collisions before acting")
    .requiredOption("--pattern <name>", "Requesting loop pattern")
    .requiredOption("--target <id>", "Branch, PR, or resource to act on")
    .option("--project-root <path>", "Project root", process.cwd())
    .option("--json", "Output JSON")
    .action(async (options) => {
      const cwd = path.resolve(options.projectRoot);
      const registry = await loadRegistry(cwd);

      if (!registry) {
        console.error(chalk.red("No registry. Run: outerloop coordination init"));
        process.exitCode = 1;
        return;
      }

      const result = checkCollisions(registry, options.pattern, options.target);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      if (result.safe) {
        console.log(chalk.green(`Safe for ${options.pattern} to act on ${options.target}`));
      } else {
        console.log(chalk.red(`Collision detected for ${options.pattern} → ${options.target}`));
        for (const c of result.conflicts) {
          console.log(`  • ${c.conflicting} owns ${c.actingOn}`);
          console.log(chalk.dim(`    ${c.recommendation}`));
        }
        process.exitCode = 1;
      }
    });
}