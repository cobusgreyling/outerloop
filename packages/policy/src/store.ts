import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import { getPolicyDir } from "@cobusgreyling/outerloop-core";
import type { BackpressurePolicy } from "@cobusgreyling/outerloop-core";
import { parsePolicyFile } from "./parser.js";

const ACTIVE_POLICY = "active.yaml";

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

export async function saveActivePolicy(
  sourcePath: string,
  cwd = process.cwd(),
): Promise<string> {
  const content = await fs.readFile(sourcePath, "utf8");
  parsePolicyFile(content); // validate before save

  await ensureDir(getPolicyDir(cwd));
  const dest = path.join(getPolicyDir(cwd), ACTIVE_POLICY);
  await fs.writeFile(dest, content, "utf8");
  return dest;
}

export async function loadActivePolicy(
  cwd = process.cwd(),
): Promise<BackpressurePolicy | undefined> {
  try {
    const content = await fs.readFile(
      path.join(getPolicyDir(cwd), ACTIVE_POLICY),
      "utf8",
    );
    return parsePolicyFile(content);
  } catch {
    return undefined;
  }
}

export async function writeDefaultPolicyTemplate(
  outputPath: string,
): Promise<void> {
  const content = YAML.stringify({ backpressure: defaultPolicy() });
  await fs.writeFile(outputPath, content, "utf8");
}

export function defaultPolicy(): BackpressurePolicy {
  return {
    maxAutonomyHours: 4,
    sampling: {
      highRisk: "100%",
      mediumRisk: "30%",
      lowRisk: "5%",
    },
    escalation: [
      { if: "riskScore > 8 or touchesPayments", then: "requireSeniorVerdict + extraEvidence" },
      { if: "touches auth", then: "requireSeniorVerdict" },
    ],
    timebox: { defaultLoop: "2h" },
  };
}