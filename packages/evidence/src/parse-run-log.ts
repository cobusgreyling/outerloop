export interface LoopRunEntry {
  run_id: string;
  pattern: string;
  duration_s?: number;
  items_found?: number;
  actions_taken?: number;
  escalations?: number;
  tokens_estimate?: number;
  readiness_score?: number;
  outcome?: string;
  workflow_run?: string;
}

export function parseRunLog(content: string): LoopRunEntry[] {
  const entries: LoopRunEntry[] = [];

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("{")) continue;

    try {
      entries.push(JSON.parse(trimmed) as LoopRunEntry);
    } catch {
      // skip malformed lines
    }
  }

  return entries;
}

export function resolveRunEntry(
  entries: LoopRunEntry[],
  runId: string,
): LoopRunEntry | undefined {
  if (runId === "latest") {
    return entries.at(-1);
  }

  return entries.find((e) => e.run_id === runId || e.run_id.startsWith(runId));
}