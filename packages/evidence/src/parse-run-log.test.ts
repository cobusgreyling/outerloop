import { describe, expect, it } from "vitest";
import { parseRunLog, resolveRunEntry } from "./parse-run-log.js";

const SAMPLE = `
## Recent Runs

{"run_id":"2026-07-07T10:41:34Z","pattern":"daily-triage","outcome":"report-only","escalations":0}
{"run_id":"2026-07-08T10:01:59Z","pattern":"daily-triage","outcome":"escalated","escalations":1}
`;

describe("parseRunLog", () => {
  it("parses JSONL entries", () => {
    const entries = parseRunLog(SAMPLE);
    expect(entries).toHaveLength(2);
    expect(entries[1]?.outcome).toBe("escalated");
  });

  it("resolves latest and specific run ids", () => {
    const entries = parseRunLog(SAMPLE);
    expect(resolveRunEntry(entries, "latest")?.run_id).toBe(
      "2026-07-08T10:01:59Z",
    );
    expect(resolveRunEntry(entries, "2026-07-07")?.outcome).toBe("report-only");
  });
});