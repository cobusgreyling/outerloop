import type { TestResult } from "@cobusgreyling/outerloop-core";

export function parseTestOutput(content: string): TestResult[] {
  const results: TestResult[] = [];

  // Vitest / Jest style: ✓ test name (5ms) or ✗ test name
  const vitestPattern = /^[\s✓✔✗×❯]*\s*(.+?)\s*(?:\((\d+)\s*ms\))?$/;

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^(PASS|FAIL|SKIP)\s/.test(trimmed)) {
      const [, status, name] = trimmed.match(/^(PASS|FAIL|SKIP)\s+(.+)$/) ?? [];
      if (name) {
        results.push({
          name,
          status: status === "PASS" ? "pass" : status === "FAIL" ? "fail" : "skip",
        });
      }
      continue;
    }

    if (/^[✓✔]/.test(trimmed)) {
      const match = trimmed.match(vitestPattern);
      if (match?.[1]) {
        results.push({
          name: match[1].trim(),
          status: "pass",
          durationMs: match[2] ? Number.parseInt(match[2], 10) : undefined,
        });
      }
      continue;
    }

    if (/^[✗×]/.test(trimmed)) {
      const match = trimmed.match(vitestPattern);
      if (match?.[1]) {
        results.push({
          name: match[1].trim(),
          status: "fail",
          durationMs: match[2] ? Number.parseInt(match[2], 10) : undefined,
        });
      }
    }
  }

  return results;
}