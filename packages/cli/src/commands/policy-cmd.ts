import { Command } from "commander";
import chalk from "chalk";
import path from "node:path";
import {
  saveActivePolicy,
  loadActivePolicy,
  defaultPolicy,
  evaluatePolicy,
  writeDefaultPolicyTemplate,
} from "@cobusgreyling/outerloop-policy";
import { loadEvidencePackage } from "@cobusgreyling/outerloop-evidence";

export function registerPolicyCommands(program: Command): void {
  const policy = program
    .command("policy")
    .description("Manage backpressure policies");

  policy
    .command("set")
    .description("Set active backpressure policy from YAML file")
    .requiredOption("--file <path>", "Policy YAML file")
    .option("--project-root <path>", "Project root", process.cwd())
    .action(async (options) => {
      const cwd = path.resolve(options.projectRoot);
      const filePath = path.resolve(options.file);

      try {
        const dest = await saveActivePolicy(filePath, cwd);
        console.log(chalk.green(`Active policy set from ${filePath}`));
        console.log(chalk.dim(`  Saved: ${dest}`));
      } catch (err) {
        console.error(chalk.red((err as Error).message));
        process.exitCode = 1;
      }
    });

  policy
    .command("show")
    .description("Show active backpressure policy")
    .option("--project-root <path>", "Project root", process.cwd())
    .option("--json", "Output as JSON")
    .action(async (options) => {
      const cwd = path.resolve(options.projectRoot);
      const active = await loadActivePolicy(cwd);
      const policy = active ?? defaultPolicy();

      if (options.json) {
        console.log(JSON.stringify(policy, null, 2));
      } else {
        console.log(chalk.bold("Active backpressure policy:"));
        console.log(JSON.stringify(policy, null, 2));
        if (!active) {
          console.log(chalk.dim("(using built-in defaults — run policy set to persist)"));
        }
      }
    });

  policy
    .command("evaluate")
    .description("Evaluate policy against evidence package")
    .argument("<evidence-id>", "Evidence package or run ID")
    .option("--project-root <path>", "Project root", process.cwd())
    .option("--json", "Output as JSON")
    .action(async (evidenceId: string, options) => {
      const cwd = path.resolve(options.projectRoot);
      const evidence = await loadEvidencePackage(evidenceId, cwd);

      if (!evidence) {
        console.error(chalk.red(`Evidence not found: ${evidenceId}`));
        process.exitCode = 1;
        return;
      }

      const policy = (await loadActivePolicy(cwd)) ?? defaultPolicy();
      const result = evaluatePolicy(evidence, policy);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      console.log(chalk.bold("Policy evaluation:"));
      console.log(`  Risk band: ${result.riskBand}`);
      console.log(`  Requires review: ${result.requiresReview ? chalk.yellow("yes") : chalk.green("no")}`);
      console.log(`  Sampling: ${(result.samplingRate * 100).toFixed(0)}% → ${result.samplingDecision}`);
      if (result.escalations.length > 0) {
        console.log(chalk.red("  Escalations:"));
        for (const e of result.escalations) {
          console.log(`    • ${e}`);
        }
      }
      if (result.timebox) {
        console.log(chalk.dim(`  Timebox: ${result.timebox}`));
      }
    });

  policy
    .command("init")
    .description("Write default backpressure policy template")
    .option("--project-root <path>", "Project root", process.cwd())
    .option("--output <path>", "Output file", "backpressure.yaml")
    .action(async (options) => {
      const out = path.resolve(options.projectRoot, options.output);
      await writeDefaultPolicyTemplate(out);
      console.log(chalk.green(`Default policy template written to ${out}`));
      console.log(chalk.dim("Activate with: outerloop policy set --file backpressure.yaml"));
    });
}