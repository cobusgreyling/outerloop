import { describe, expect, it } from "vitest";
import { checkCollisions } from "./collision.js";
import type { CoordinationRegistry } from "./registry.js";

const REGISTRY: CoordinationRegistry = {
  version: 1,
  priorityStack: ["ci-sweeper", "pr-babysitter", "daily-triage"],
  updatedAt: new Date().toISOString(),
  loops: [
    {
      id: "1",
      pattern: "ci-sweeper",
      level: "L2",
      cadence: "15m",
      stateFile: "ci-sweeper-state.md",
      priority: 1,
      status: "acting",
      actingOn: "pr-42",
    },
    {
      id: "2",
      pattern: "pr-babysitter",
      level: "L2",
      cadence: "10m",
      stateFile: "pr-babysitter-state.md",
      priority: 2,
      status: "idle",
    },
  ],
};

describe("checkCollisions", () => {
  it("detects branch lock collision", () => {
    const result = checkCollisions(REGISTRY, "pr-babysitter", "pr-42");
    expect(result.safe).toBe(false);
    expect(result.conflicts[0]?.conflicting).toBe("ci-sweeper");
  });

  it("allows non-conflicting targets", () => {
    const result = checkCollisions(REGISTRY, "pr-babysitter", "pr-99");
    expect(result.safe).toBe(true);
  });
});