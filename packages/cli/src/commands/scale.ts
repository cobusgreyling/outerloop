import { Command } from "commander";
import chalk from "chalk";
import path from "node:path";
import { scanBrownfield, saveBrownfieldReport } from "@cobusgreyling/outerloop-brownfield";
import { runOuterloopAudit } from "@cobusgreyling/outerloop-audit";
import {
  getDashboardSnapshot,
  renderTextDashboard,
  runInkDashboard,
  startWebDashboard,
} from "@cobusgreyling/outerloop-dashboard";

export function registerScaleCommands(program: Command): void {
  const dashboard = program
    .command("dashboard")
    .description("Governance dashboard (text, TUI, or web)");

  dashboard
    .option("--project-root <path>", "Project root", process.cwd())
    .action(async (options) => {
      const cwd = path.resolve(options.projectRoot);
      const snapshot = await getDashboardSnapshot(cwd);
      console.log(renderTextDashboard(snapshot));
    });

  dashboard
    .command("tui")
    .description("Rich Ink TUI dashboard (auto-refresh)")
    .option("--project-root <path>", "Project root", process.cwd())
    .action(async (options) => {
      const cwd = path.resolve(options.projectRoot);
      await runInkDashboard(cwd);
    });

  dashboard
    .command("serve")
    .description("Start local web dashboard")
    .option("--project-root <path>", "Project root", process.cwd())
    .option("--port <port>", "HTTP port", "4040")
    .option("--host <host>", "Bind host", "127.0.0.1")
    .action(async (options) => {
      const cwd = path.resolve(options.projectRoot);
      const port = Number.parseInt(options.port, 10);
      const server = startWebDashboard({ cwd, port, host: options.host });
      console.log(
        chalk.green(`Web dashboard: http://${options.host}:${port}/`),
      );
      console.log(chalk.dim(`API: http://${options.host}:${port}/api/snapshot`));
      console.log(chalk.dim("Press Ctrl+C to stop"));

      await new Promise<void>((resolve) => {
        const shutdown = () => {
          server.close(() => resolve());
        };
        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);
      });
    });

  const brownfield = program
    .command("brownfield")
    .description("Brownfield introspection helpers");

  brownfield
    .command("scan")
    .description("Scan project for legacy scars and implicit knowledge signals")
    .option("--project-root <path>", "Project root", process.cwd())
    .option("--json", "Output JSON")
    .option("--save", "Save report to .outerloop/brownfield/")
    .action(async (options) => {
      const cwd = path.resolve(options.projectRoot);
      const report = await scanBrownfield(cwd);

      if (options.save) {
        const saved = await saveBrownfieldReport(report, cwd);
        console.log(chalk.dim(`Report saved: ${saved}`));
      }

      if (options.json) {
        console.log(JSON.stringify(report, null, 2));
        return;
      }

      const color =
        report.level === "healthy" ? chalk.green : report.level === "scarred" ? chalk.yellow : chalk.red;
      console.log(chalk.bold("\nBrownfield Scan\n"));
      console.log(`  ${color(`${report.level} (${report.score}/10)`)}`);
      console.log(`  ${report.summary}`);
      console.log("");
      if (report.signals.length > 0) {
        console.log(chalk.bold(`Signals (top ${Math.min(10, report.signals.length)})`));
        for (const s of report.signals.slice(0, 10)) {
          console.log(`  [${s.type}] ${s.file}`);
          console.log(chalk.dim(`    ${s.detail.slice(0, 80)}`));
        }
        console.log("");
      }
      console.log(chalk.bold("Recommendations"));
      for (const r of report.recommendations) console.log(`  → ${r}`);
    });

  program
    .command("audit")
    .description("Score how well this project uses outerloop governance")
    .option("--project-root <path>", "Project root", process.cwd())
    .option("--json", "Output JSON")
    .action(async (options) => {
      const cwd = path.resolve(options.projectRoot);
      const report = await runOuterloopAudit(cwd);

      if (options.json) {
        console.log(JSON.stringify(report, null, 2));
        return;
      }

      console.log(chalk.bold("\nouterloop Self-Governance Audit\n"));
      const gradeColor =
        report.grade === "A" || report.grade === "B" ? chalk.green : report.grade === "C" ? chalk.yellow : chalk.red;
      console.log(`  Score: ${gradeColor(`${report.score}/${report.maxScore} (${report.grade})`)}`);
      console.log("");
      for (const c of report.checks) {
        const icon = c.passed ? chalk.green("✓") : chalk.red("✗");
        console.log(`  ${icon} ${c.name}: ${c.points}/${c.maxPoints} — ${c.detail}`);
      }
      console.log("");
      console.log(chalk.bold("Recommendations"));
      for (const r of report.recommendations) console.log(`  → ${r}`);
    });
}