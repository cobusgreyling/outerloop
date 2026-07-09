import fs from "node:fs/promises";
import path from "node:path";
import {
  HarnessSpec,
  HarnessSpecSchema,
  getHarnessDir,
} from "@cobusgreyling/outerloop-core";

const ACTIVE_FILE = "active.json";

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

function specPath(cwd: string, name: string): string {
  return path.join(getHarnessDir(cwd), `${name}.json`);
}

export async function saveHarnessSpec(
  spec: HarnessSpec,
  cwd = process.cwd(),
  setActive = true,
): Promise<string> {
  const validated = HarnessSpecSchema.parse(spec);
  await ensureDir(getHarnessDir(cwd));

  const filePath = specPath(cwd, validated.name);
  await fs.writeFile(filePath, JSON.stringify(validated, null, 2), "utf8");

  if (setActive) {
    await fs.writeFile(
      path.join(getHarnessDir(cwd), ACTIVE_FILE),
      validated.name,
      "utf8",
    );
  }

  return filePath;
}

export async function loadHarnessSpec(
  name: string,
  cwd = process.cwd(),
): Promise<HarnessSpec | undefined> {
  try {
    const content = await fs.readFile(specPath(cwd, name), "utf8");
    return HarnessSpecSchema.parse(JSON.parse(content));
  } catch {
    return undefined;
  }
}

export async function getActiveHarnessSpec(
  cwd = process.cwd(),
): Promise<HarnessSpec | undefined> {
  try {
    const name = (await fs.readFile(path.join(getHarnessDir(cwd), ACTIVE_FILE), "utf8")).trim();
    return loadHarnessSpec(name, cwd);
  } catch {
    return undefined;
  }
}