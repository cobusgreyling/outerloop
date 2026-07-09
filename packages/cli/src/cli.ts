#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import { Command } from "commander";
import chalk from "chalk";
import { registerEvidenceCommands } from "./commands/evidence.js";
import { registerVerdictCommands } from "./commands/verdict.js";
import { registerLedgerCommands } from "./commands/ledger.js";
import { registerGovernanceCommands } from "./commands/governance.js";

const VERSION = "0.1.0";

export function createProgram(): Command {
  const program = new Command();

  program
    .name("outerloop")
    .description(
      chalk.bold("Own the Outer Loop") +
        " — Evidence → Verdict → Answerability",
    )
    .version(VERSION);

  registerEvidenceCommands(program);
  registerVerdictCommands(program);
  registerLedgerCommands(program);
  registerGovernanceCommands(program);

  program
    .command("audit")
    .description("Score how well outerloop itself is using outerloop")
    .action(() => {
      console.log(chalk.yellow("Coming in Phase 3: outerloop audit scoring."));
    });

  return program;
}

export function run(argv: string[] = process.argv): void {
  const program = createProgram();
  program.parse(argv);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}