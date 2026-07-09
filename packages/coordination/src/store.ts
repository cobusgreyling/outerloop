import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getCoordinationDir } from "@cobusgreyling/outerloop-core";
import {
  CoordinationRegistry,
  CoordinationRegistrySchema,
  DEFAULT_LOOPS,
  DEFAULT_PRIORITY_STACK,
  LoopRegistration,
  LoopRegistrationSchema,
} from "./registry.js";

const REGISTRY_FILE = "registry.json";

function registryPath(cwd: string): string {
  return path.join(getCoordinationDir(cwd), REGISTRY_FILE);
}

export async function loadRegistry(cwd: string): Promise<CoordinationRegistry | undefined> {
  try {
    const raw = await fs.readFile(registryPath(cwd), "utf8");
    return CoordinationRegistrySchema.parse(JSON.parse(raw));
  } catch {
    return undefined;
  }
}

export async function saveRegistry(
  registry: CoordinationRegistry,
  cwd: string,
): Promise<string> {
  const validated = CoordinationRegistrySchema.parse(registry);
  await fs.mkdir(getCoordinationDir(cwd), { recursive: true });
  const filePath = registryPath(cwd);
  await fs.writeFile(filePath, JSON.stringify(validated, null, 2), "utf8");
  return filePath;
}

export async function initRegistry(cwd: string): Promise<CoordinationRegistry> {
  const registry: CoordinationRegistry = {
    version: 1,
    priorityStack: [...DEFAULT_PRIORITY_STACK],
    loops: DEFAULT_LOOPS.map((l) => ({ ...l, id: randomUUID() })),
    updatedAt: new Date().toISOString(),
  };
  await saveRegistry(registry, cwd);
  return registry;
}

export async function registerLoop(
  cwd: string,
  input: Omit<LoopRegistration, "id"> & { id?: string },
): Promise<LoopRegistration> {
  let registry = (await loadRegistry(cwd)) ?? (await initRegistry(cwd));

  const loop: LoopRegistration = LoopRegistrationSchema.parse({
    ...input,
    id: input.id ?? randomUUID(),
  });

  const idx = registry.loops.findIndex((l) => l.pattern === loop.pattern);
  if (idx >= 0) {
    registry.loops[idx] = loop;
  } else {
    registry.loops.push(loop);
  }

  registry.updatedAt = new Date().toISOString();
  await saveRegistry(registry, cwd);
  return loop;
}

export async function updateLoopStatus(
  cwd: string,
  pattern: string,
  update: Partial<Pick<LoopRegistration, "status" | "actingOn" | "lastRun">>,
): Promise<LoopRegistration | undefined> {
  const registry = await loadRegistry(cwd);
  if (!registry) return undefined;

  const loop = registry.loops.find((l) => l.pattern === pattern);
  if (!loop) return undefined;

  Object.assign(loop, update);
  registry.updatedAt = new Date().toISOString();
  await saveRegistry(registry, cwd);
  return loop;
}