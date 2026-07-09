import { z } from "zod";

export const LoopStatusSchema = z.enum(["idle", "acting", "waiting", "blocked"]);
export const LoopLevelSchema = z.enum(["L0", "L1", "L2", "L3"]);

export const LoopRegistrationSchema = z.object({
  id: z.string(),
  pattern: z.string(),
  level: LoopLevelSchema,
  cadence: z.string(),
  stateFile: z.string(),
  priority: z.number().int().positive(),
  status: LoopStatusSchema.default("idle"),
  actingOn: z.string().optional(),
  lastRun: z.string().optional(),
  notes: z.string().optional(),
});

export const CoordinationRegistrySchema = z.object({
  version: z.number().int().positive(),
  priorityStack: z.array(z.string()),
  loops: z.array(LoopRegistrationSchema),
  updatedAt: z.string().datetime(),
});

export type LoopRegistration = z.infer<typeof LoopRegistrationSchema>;
export type CoordinationRegistry = z.infer<typeof CoordinationRegistrySchema>;

export const DEFAULT_PRIORITY_STACK = [
  "ci-sweeper",
  "pr-babysitter",
  "dependency-sweeper",
  "post-merge-cleanup",
  "daily-triage",
];

export const DEFAULT_LOOPS: Omit<LoopRegistration, "id">[] = [
  {
    pattern: "ci-sweeper",
    level: "L2",
    cadence: "15m",
    stateFile: "ci-sweeper-state.md",
    priority: 1,
    status: "idle",
  },
  {
    pattern: "pr-babysitter",
    level: "L2",
    cadence: "10m",
    stateFile: "pr-babysitter-state.md",
    priority: 2,
    status: "idle",
  },
  {
    pattern: "dependency-sweeper",
    level: "L2",
    cadence: "6h",
    stateFile: "dependency-sweeper-state.md",
    priority: 3,
    status: "idle",
  },
  {
    pattern: "post-merge-cleanup",
    level: "L1",
    cadence: "1d",
    stateFile: "post-merge-state.md",
    priority: 4,
    status: "idle",
  },
  {
    pattern: "daily-triage",
    level: "L1",
    cadence: "1d",
    stateFile: "STATE.md",
    priority: 5,
    status: "idle",
  },
];