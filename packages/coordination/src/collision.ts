import type { CoordinationRegistry, LoopRegistration } from "./registry.js";

export interface CollisionCheck {
  safe: boolean;
  conflicts: Array<{
    requesting: string;
    conflicting: string;
    actingOn: string;
    recommendation: string;
  }>;
  nextAllowed?: LoopRegistration;
}

export function checkCollisions(
  registry: CoordinationRegistry,
  requestingPattern: string,
  target: string,
): CollisionCheck {
  const requesting = registry.loops.find((l) => l.pattern === requestingPattern);
  const conflicts: CollisionCheck["conflicts"] = [];

  for (const loop of registry.loops) {
    if (loop.pattern === requestingPattern) continue;
    if (loop.status !== "acting" || !loop.actingOn) continue;

    const sameTarget =
      loop.actingOn === target ||
      loop.actingOn.includes(target) ||
      target.includes(loop.actingOn);

    if (sameTarget) {
      const higherPriority = (requesting?.priority ?? 99) > loop.priority;
      conflicts.push({
        requesting: requestingPattern,
        conflicting: loop.pattern,
        actingOn: loop.actingOn,
        recommendation: higherPriority
          ? `${requestingPattern} has lower priority than ${loop.pattern} — skip or escalate to human inbox`
          : `${loop.pattern} is acting on ${loop.actingOn} — wait or coordinate via STATE.md human inbox`,
      });
    }
  }

  const sorted = [...registry.loops].sort((a, b) => a.priority - b.priority);
  const nextAllowed = sorted.find(
    (l) => l.status === "idle" || (l.pattern === requestingPattern && conflicts.length === 0),
  );

  return {
    safe: conflicts.length === 0,
    conflicts,
    nextAllowed,
  };
}