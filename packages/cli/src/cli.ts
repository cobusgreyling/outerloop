#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import { Command } from "commander";
import chalk from "chalk";
import { registerEvidenceCommands } from "./commands/evidence.js";
import { registerVerdictCommands } from "./commands/verdict.js";
import { registerLedgerCommands } from "./commands/ledger.js";
import { registerGovernanceCommands } from "./commands/governance.js";
import { registerTasteCommands } from "./commands/taste.js";
import { registerPolicyCommands } from "./commands/policy-cmd.js";
import { registerIntegrateCommands } from "./commands/integrate-cmd.js";
import { registerScaleCommands } from "./commands/scale.js";
import { registerCoordinationCommands } from "./commands/coordination-cmd.js";

const VERSION = "0.2.0";

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
  registerTasteCommands(program);
  registerPolicyCommands(program);
  registerIntegrateCommands(program);
  registerScaleCommands(program);
  registerCoordinationCommands(program);

  return program;
}

export function run(argv: string[] = process.argv): void {
  const program = createProgram();
  program.parse(argv);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}