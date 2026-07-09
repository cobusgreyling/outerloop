import { Command } from "commander";
import chalk from "chalk";

export function registerGovernanceCommands(program: Command): void {
  const harness = program
    .command("harness")
    .description("Define and validate harness boundaries");

  harness
    .command("init")
    .description("Initialize a harness boundary spec")
    .argument("<name>", "Harness name")
    .option("--boundary <level>", "Boundary strictness", "strict")
    .action((name: string, options) => {
      console.log(
        chalk.yellow(
          `Coming in Phase 3: harness init for ${name} (${options.boundary})`,
        ),
      );
    });

  harness
    .command("validate")
    .description("Validate harness boundary spec")
    .action(() => {
      console.log(chalk.yellow("Coming in Phase 3: harness validation."));
    });

  const taste = program
    .command("taste")
    .description("Capture and apply organizational taste");

  taste
    .command("capture")
    .description("Extract taste rules from critique sessions")
    .option("--from-critique <path>", "Critique session notes file")
    .option("--extract-rules", "Extract enforceable rules")
    .action(() => {
      console.log(chalk.yellow("Coming in Phase 2: taste capture pipeline."));
    });

  taste
    .command("apply")
    .description("Apply a taste profile")
    .option("--profile <name>", "Taste profile name", "team-default")
    .action((options) => {
      console.log(
        chalk.yellow(`Coming in Phase 2: apply taste profile ${options.profile}`),
      );
    });

  const policy = program
    .command("policy")
    .description("Manage backpressure policies");

  policy
    .command("set")
    .description("Set backpressure policy from file")
    .requiredOption("--file <path>", "Policy YAML file")
    .action(() => {
      console.log(chalk.yellow("Coming in Phase 2: policy engine."));
    });

  const cognitive = program
    .command("cognitive")
    .description("Cognitive debt mitigation tools");

  cognitive
    .command("check")
    .description("Generate understanding questions and debt estimate")
    .option("--changes <ref>", "Git ref for changes", "HEAD~5")
    .action((options) => {
      console.log(
        chalk.yellow(
          `Coming in Phase 3: cognitive check for ${options.changes}`,
        ),
      );
    });

  const attention = program
    .command("attention")
    .description("Attention routing for pending verdicts");

  attention
    .command("route")
    .description("Smart prioritization of pending verdicts")
    .option("--batch", "Batch review mode")
    .action(() => {
      console.log(chalk.yellow("Coming in Phase 3: attention router."));
    });

  program
    .command("integrate")
    .description("Integration adapters")
    .argument("<target>", "loop-engineering | cursor | claude-code | github")
    .action((target: string) => {
      console.log(
        chalk.yellow(`Coming in Phase 2: integrate with ${target}.`),
      );
    });

  const cursor = program
    .command("cursor")
    .description("Cursor-specific setup");

  cursor
    .command("setup")
    .description("Install Cursor rules for verdict-aware development")
    .action(() => {
      console.log(chalk.yellow("Coming in Phase 2: Cursor setup templates."));
    });
}