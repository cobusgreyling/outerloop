import { Command } from "commander";
import chalk from "chalk";
import fs from "node:fs/promises";
import path from "node:path";
import { createEvidencePackage } from "@cobusgreyling/outerloop-core";
import {
  packageFromLoopEngineering,
  saveEvidencePackage,
} from "@cobusgreyling/outerloop-evidence";

export function registerEvidenceCommands(program: Command): void {
  const evidence = program
    .command("evidence")
    .description("Generate and package evidence from agent runs");

  evidence
    .command("package")
    .description("Package evidence from a run into an EvidencePackage")
    .requiredOption("--run-id <id>", "Run identifier (e.g. latest, run-001)")
    .option("--from <source>", "Evidence source", "loop-engineering")
    .option("--loop-id <id>", "Loop identifier (manual mode only)")
    .option("--goal <goal>", "Run goal summary (manual mode only)")
    .option("--project-root <path>", "Project root for artifact discovery", process.cwd())
    .option("--state-file <path>", "STATE.md path relative to project root", "STATE.md")
    .option("--run-log <path>", "Run log path relative to project root", "loop-run-log.md")
    .option("--test-output <path>", "Test output file to parse")
    .option("--diff-base <ref>", "Git ref for diff collection", "HEAD")
    .option("--output <path>", "Write JSON to file path")
    .option("--json", "Output raw JSON to stdout")
    .action(async (options) => {
      const projectRoot = path.resolve(options.projectRoot);

      let pkg;
      if (options.from === "loop-engineering") {
        pkg = await packageFromLoopEngineering({
          projectRoot,
          runId: options.runId,
          stateFile: options.stateFile,
          runLogFile: options.runLog,
          testOutputFile: options.testOutput,
          diffBase: options.diffBase,
        });
      } else {
        pkg = createEvidencePackage({
          runId: options.runId,
          loopId: options.loopId ?? "default",
          source: options.from,
          goal: options.goal ?? `Evidence package for run ${options.runId}`,
        });
      }

      const savedPath = await saveEvidencePackage(pkg, projectRoot);
      const log = options.json
        ? (msg: string) => console.error(msg)
        : (msg: string) => console.log(msg);

      if (options.output) {
        const outPath = path.resolve(options.output);
        await fs.writeFile(outPath, JSON.stringify(pkg, null, 2), "utf8");
        log(chalk.green(`Evidence package ${pkg.id} written to ${outPath}`));
      }

      log(chalk.green(`Evidence package ${pkg.id} saved to ${savedPath}`));
      log(chalk.dim(`  Run: ${pkg.runId} | Risk: ${pkg.riskAssessment.score}/10`));

      if (options.json) {
        console.log(JSON.stringify(pkg, null, 2));
      } else if (!options.output) {
        console.log(JSON.stringify(pkg, null, 2));
      }
    });

  evidence
    .command("list")
    .description("List packaged evidence in the local ledger")
    .option("--project-root <path>", "Project root", process.cwd())
    .action(async (options) => {
      const { listEvidencePackages } = await import("@cobusgreyling/outerloop-evidence");
      const entries = await listEvidencePackages(path.resolve(options.projectRoot));

      if (entries.length === 0) {
        console.log(chalk.dim("No evidence packages found."));
        return;
      }

      for (const entry of entries) {
        console.log(
          `${chalk.cyan(entry.id)}  run=${entry.runId}  risk=${entry.riskScore}/10  ${entry.timestamp}`,
        );
      }
    });
}