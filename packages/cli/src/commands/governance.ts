import { Command } from "commander";
import chalk from "chalk";
import path from "node:path";
import { runCognitiveCheck } from "@cobusgreyling/outerloop-cognitive";
import {
  createHarnessSpec,
  saveHarnessSpec,
  getActiveHarnessSpec,
  validateHarnessSpec,
} from "@cobusgreyling/outerloop-harness";
import { loadEvidencePackage } from "@cobusgreyling/outerloop-evidence";
import { checkEvidenceAgainstHarness } from "@cobusgreyling/outerloop-harness";
import { routeAttention } from "@cobusgreyling/outerloop-attention";

export function registerGovernanceCommands(program: Command): void {
  const harness = program
    .command("harness")
    .description("Define and validate harness boundaries");

  harness
    .command("init")
    .description("Initialize a harness boundary spec")
    .argument("<name>", "Harness name")
    .option("--boundary <level>", "strict | moderate | permissive", "strict")
    .option("--project-root <path>", "Project root", process.cwd())
    .action(async (name: string, options) => {
      const cwd = path.resolve(options.projectRoot);
      const spec = createHarnessSpec(name, options.boundary);
      const saved = await saveHarnessSpec(spec, cwd);
      console.log(chalk.green(`Harness "${name}" initialized (${options.boundary})`));
      console.log(chalk.dim(`  Saved: ${saved}`));
      console.log(chalk.dim(`  Inside tools: ${spec.inside.toolsWhitelist.join(", ")}`));
    });

  harness
    .command("show")
    .description("Show active harness boundary spec")
    .option("--project-root <path>", "Project root", process.cwd())
    .option("--json", "Output JSON")
    .action(async (options) => {
      const cwd = path.resolve(options.projectRoot);
      const spec = await getActiveHarnessSpec(cwd);
      if (!spec) {
        console.log(chalk.yellow("No active harness. Run: outerloop harness init <name>"));
        return;
      }
      if (options.json) {
        console.log(JSON.stringify(spec, null, 2));
      } else {
        console.log(chalk.bold(`Harness: ${spec.name} v${spec.version}`));
        console.log(`  Inside:  ${spec.inside.capabilities.join(", ")}`);
        console.log(`  Outside: ${spec.outside.humanAgency.join(", ")}`);
        console.log(`  Veto:    ${spec.outside.vetoConditions.join(", ")}`);
      }
    });

  harness
    .command("validate")
    .description("Validate harness boundary spec")
    .option("--project-root <path>", "Project root", process.cwd())
    .option("--evidence-id <id>", "Also check evidence against harness")
    .action(async (options) => {
      const cwd = path.resolve(options.projectRoot);
      const spec = await getActiveHarnessSpec(cwd);

      if (!spec) {
        console.error(chalk.red("No active harness spec."));
        process.exitCode = 1;
        return;
      }

      const result = validateHarnessSpec(spec);
      if (result.valid) {
        console.log(chalk.green("Harness spec is valid."));
      } else {
        console.log(chalk.red("Harness spec has errors:"));
        for (const e of result.errors) console.log(`  ✗ ${e}`);
        process.exitCode = 1;
      }
      for (const w of result.warnings) {
        console.log(chalk.yellow(`  ⚠ ${w}`));
      }

      if (options.evidenceId) {
        const evidence = await loadEvidencePackage(options.evidenceId, cwd);
        if (evidence) {
          const check = checkEvidenceAgainstHarness(evidence, spec);
          console.log("");
          console.log(chalk.bold("Evidence boundary check:"));
          if (check.valid) {
            console.log(chalk.green("  Evidence respects harness boundary."));
          } else {
            for (const e of check.errors) console.log(chalk.red(`  ✗ ${e}`));
          }
          for (const w of check.warnings) console.log(chalk.yellow(`  ⚠ ${w}`));
        }
      }
    });

  const cognitive = program
    .command("cognitive")
    .description("Cognitive debt mitigation tools");

  cognitive
    .command("check")
    .description("Generate understanding questions and debt estimate")
    .option("--changes <ref>", "Git ref window", "HEAD~5")
    .option("--project-root <path>", "Project root", process.cwd())
    .option("--json", "Output JSON")
    .action(async (options) => {
      const cwd = path.resolve(options.projectRoot);
      const result = await runCognitiveCheck({ cwd, changesRef: options.changes });

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      const color =
        result.level === "low" ? chalk.green : result.level === "moderate" ? chalk.yellow : chalk.red;
      console.log(chalk.bold("\nCognitive Debt Check\n"));
      console.log(`  Score: ${color(`${result.score}/10 (${result.level})`)}`);
      console.log(`  Changes: ${result.changes.filesChanged.length} files, ${result.changes.commits} commits`);
      console.log(`  Unverdicted evidence: ${result.unverdictedEvidence}`);
      console.log("");
      if (result.factors.length > 0) {
        console.log(chalk.bold("Factors"));
        for (const f of result.factors) console.log(`  • ${f}`);
        console.log("");
      }
      console.log(chalk.bold("Understanding Questions"));
      for (const q of result.questions) console.log(`  ? ${q}`);
      console.log("");
      console.log(chalk.dim(result.narrative));
    });

  const attention = program
    .command("attention")
    .description("Attention routing for pending verdicts");

  attention
    .command("route")
    .description("Smart prioritization of pending verdicts")
    .option("--batch", "Batch review recommendations")
    .option("--project-root <path>", "Project root", process.cwd())
    .option("--json", "Output JSON")
    .action(async (options) => {
      const cwd = path.resolve(options.projectRoot);
      const result = await routeAttention(cwd, options.batch);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      console.log(chalk.bold(`\nAttention Router — ${result.total} pending\n`));
      if (result.pending.length === 0) {
        console.log(chalk.green("Queue empty. No verdicts pending."));
        return;
      }

      for (const item of result.pending) {
        const risk =
          item.riskScore >= 7 ? chalk.red : item.riskScore >= 4 ? chalk.yellow : chalk.green;
        console.log(
          `${risk(`${item.riskScore}/10`)}  p=${item.priority}  ${item.evidenceId.slice(0, 8)}…  ${item.loopId}`,
        );
        console.log(chalk.dim(`    ${item.reason}`));
        if (item.executive) console.log(chalk.dim(`    ${item.executive}`));
      }
      console.log("");
      console.log(chalk.bold("Recommendation:"), result.batchRecommendation);
    });
}