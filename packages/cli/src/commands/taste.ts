import { Command } from "commander";
import chalk from "chalk";
import fs from "node:fs/promises";
import path from "node:path";
import {
  buildProfileFromCritique,
  saveTasteProfile,
  setActiveTasteProfile,
  loadTasteProfile,
  listTasteProfiles,
  matchTasteRules,
  summarizeTasteMatches,
  getActiveTasteProfile,
} from "@cobusgreyling/outerloop-taste";
import { loadEvidencePackage } from "@cobusgreyling/outerloop-evidence";

export function registerTasteCommands(program: Command): void {
  const taste = program
    .command("taste")
    .description("Capture and apply organizational taste");

  taste
    .command("capture")
    .description("Extract taste rules from critique sessions")
    .requiredOption("--from-critique <path>", "Critique session notes file")
    .option("--extract-rules", "Extract enforceable rules", true)
    .option("--profile <name>", "Profile name", "team-default")
    .option("--project-root <path>", "Project root", process.cwd())
    .action(async (options) => {
      const cwd = path.resolve(options.projectRoot);
      const critiquePath = path.resolve(options.fromCritique);
      const content = await fs.readFile(critiquePath, "utf8");

      const profile = buildProfileFromCritique({
        critiquePath,
        content,
        profileName: options.profile,
      });

      if (profile.rules.length === 0) {
        console.log(
          chalk.yellow(
            "No rules extracted. Add a ## Taste Rules section or RULE: lines.",
          ),
        );
        return;
      }

      const saved = await saveTasteProfile(profile, cwd);
      console.log(
        chalk.green(
          `Captured ${profile.rules.length} rule(s) → profile "${profile.name}"`,
        ),
      );
      console.log(chalk.dim(`  Saved: ${saved}`));

      for (const rule of profile.rules) {
        console.log(`  • [${rule.action}] ${rule.when}`);
      }
    });

  taste
    .command("apply")
    .description("Activate a taste profile for matching")
    .option("--profile <name>", "Taste profile name", "team-default")
    .option("--project-root <path>", "Project root", process.cwd())
    .action(async (options) => {
      const cwd = path.resolve(options.projectRoot);
      const profile = await loadTasteProfile(options.profile, cwd);

      if (!profile) {
        console.error(
          chalk.red(
            `Profile not found: ${options.profile}. Run taste capture first.`,
          ),
        );
        process.exitCode = 1;
        return;
      }

      await setActiveTasteProfile(options.profile, cwd);
      console.log(
        chalk.green(`Active taste profile: ${options.profile} (${profile.rules.length} rules)`),
      );
    });

  taste
    .command("list")
    .description("List taste profiles")
    .option("--project-root <path>", "Project root", process.cwd())
    .action(async (options) => {
      const cwd = path.resolve(options.projectRoot);
      const profiles = await listTasteProfiles(cwd);

      if (profiles.length === 0) {
        console.log(chalk.dim("No taste profiles. Run taste capture first."));
        return;
      }

      for (const name of profiles) {
        const profile = await loadTasteProfile(name, cwd);
        console.log(
          `${chalk.cyan(name)}  ${profile?.rules.length ?? 0} rules  v${profile?.version ?? "?"}`,
        );
      }
    });

  taste
    .command("match")
    .description("Match active taste profile against evidence")
    .argument("<evidence-id>", "Evidence package or run ID")
    .option("--project-root <path>", "Project root", process.cwd())
    .option("--profile <name>", "Override active profile")
    .action(async (evidenceId: string, options) => {
      const cwd = path.resolve(options.projectRoot);
      const evidence = await loadEvidencePackage(evidenceId, cwd);

      if (!evidence) {
        console.error(chalk.red(`Evidence not found: ${evidenceId}`));
        process.exitCode = 1;
        return;
      }

      const profile = options.profile
        ? await loadTasteProfile(options.profile, cwd)
        : await getActiveTasteProfile(cwd);

      if (!profile) {
        console.log(chalk.yellow("No active taste profile. Run taste apply first."));
        return;
      }

      const matches = matchTasteRules(evidence, profile);
      if (matches.length === 0) {
        console.log(chalk.green("No taste rules matched."));
        return;
      }

      console.log(chalk.bold(`Taste matches (${matches.length}):`));
      for (const line of summarizeTasteMatches(matches)) {
        console.log(`  • ${line}`);
      }
    });
}