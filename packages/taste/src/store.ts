import fs from "node:fs/promises";
import path from "node:path";
import { getTasteDir } from "@cobusgreyling/outerloop-core";
import { TasteProfile, TasteProfileSchema } from "./profile.js";

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

function profilePath(cwd: string, name: string): string {
  return path.join(getTasteDir(cwd), "profiles", `${name}.json`);
}

function activeProfilePath(cwd: string): string {
  return path.join(getTasteDir(cwd), "active-profile.txt");
}

export async function saveTasteProfile(
  profile: TasteProfile,
  cwd = process.cwd(),
): Promise<string> {
  const validated = TasteProfileSchema.parse(profile);
  const dir = path.join(getTasteDir(cwd), "profiles");
  await ensureDir(dir);

  const filePath = profilePath(cwd, validated.name);
  await fs.writeFile(filePath, JSON.stringify(validated, null, 2), "utf8");
  return filePath;
}

export async function loadTasteProfile(
  name: string,
  cwd = process.cwd(),
): Promise<TasteProfile | undefined> {
  try {
    const content = await fs.readFile(profilePath(cwd, name), "utf8");
    return TasteProfileSchema.parse(JSON.parse(content));
  } catch {
    return undefined;
  }
}

export async function setActiveTasteProfile(
  name: string,
  cwd = process.cwd(),
): Promise<void> {
  await ensureDir(getTasteDir(cwd));
  await fs.writeFile(activeProfilePath(cwd), name, "utf8");
}

export async function getActiveTasteProfile(
  cwd = process.cwd(),
): Promise<TasteProfile | undefined> {
  try {
    const name = (await fs.readFile(activeProfilePath(cwd), "utf8")).trim();
    return loadTasteProfile(name, cwd);
  } catch {
    return undefined;
  }
}

export async function listTasteProfiles(
  cwd = process.cwd(),
): Promise<string[]> {
  const dir = path.join(getTasteDir(cwd), "profiles");
  try {
    const files = await fs.readdir(dir);
    return files.filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
  } catch {
    return [];
  }
}