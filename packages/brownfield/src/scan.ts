import fs from "node:fs/promises";
import path from "node:path";
import { getBrownfieldDir } from "@cobusgreyling/outerloop-core";

export interface BrownfieldSignal {
  type: "todo" | "fixme" | "hack" | "legacy" | "large-file" | "implicit-knowledge";
  file: string;
  detail: string;
}

export interface BrownfieldReport {
  scannedAt: string;
  projectRoot: string;
  signals: BrownfieldSignal[];
  score: number;
  level: "healthy" | "scarred" | "fragile";
  recommendations: string[];
  summary: string;
}

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  ".outerloop",
  ".turbo",
  "coverage",
]);

const MARKERS = [
  { type: "fixme" as const, pattern: /FIXME/i },
  { type: "todo" as const, pattern: /\bTODO\b/i },
  { type: "hack" as const, pattern: /HACK|XXX/i },
  { type: "legacy" as const, pattern: /legacy|deprecated|brownfield/i },
  { type: "implicit-knowledge" as const, pattern: /tribal|implicit|undocumented/i },
];

async function walkFiles(dir: string, root: string, max = 500): Promise<string[]> {
  const results: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (results.length >= max) break;
    if (SKIP_DIRS.has(entry.name)) continue;

    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walkFiles(full, root, max - results.length)));
    } else if (/\.(ts|js|md|py|go|rs|yaml|yml|json)$/.test(entry.name)) {
      results.push(path.relative(root, full));
    }
  }

  return results;
}

export async function scanBrownfield(projectRoot: string): Promise<BrownfieldReport> {
  const signals: BrownfieldSignal[] = [];
  const files = await walkFiles(projectRoot, projectRoot);

  for (const file of files) {
    const full = path.join(projectRoot, file);
    let content: string;
    try {
      const stat = await fs.stat(full);
      if (stat.size > 50_000) {
        signals.push({
          type: "large-file",
          file,
          detail: `${Math.round(stat.size / 1024)}KB — high comprehension cost`,
        });
      }
      content = await fs.readFile(full, "utf8");
    } catch {
      continue;
    }

    for (const line of content.split("\n")) {
      for (const marker of MARKERS) {
        if (marker.pattern.test(line)) {
          signals.push({
            type: marker.type,
            file,
            detail: line.trim().slice(0, 120),
          });
          break;
        }
      }
    }
  }

  const score = Math.min(
    10,
    Math.floor(signals.length / 5) +
      signals.filter((s) => s.type === "fixme" || s.type === "legacy").length,
  );

  const level = score >= 7 ? "fragile" : score >= 4 ? "scarred" : "healthy";

  const recommendations: string[] = [];
  if (signals.some((s) => s.type === "legacy")) {
    recommendations.push("Document legacy boundaries in harness spec outside.vetoConditions");
  }
  if (signals.filter((s) => s.type === "fixme").length > 5) {
    recommendations.push("Triage FIXMEs into evidence-backed verdicts or explicit debt stories");
  }
  if (signals.some((s) => s.type === "large-file")) {
    recommendations.push("Run cognitive check before modifying large files");
  }
  if (recommendations.length === 0) {
    recommendations.push("Brownfield signals low — maintain answerability on new changes");
  }

  return {
    scannedAt: new Date().toISOString(),
    projectRoot,
    signals: signals.slice(0, 50),
    score,
    level,
    recommendations,
    summary: `Brownfield score ${score}/10 (${level}): ${signals.length} signal(s) across ${files.length} files scanned.`,
  };
}

export async function saveBrownfieldReport(
  report: BrownfieldReport,
  cwd = process.cwd(),
): Promise<string> {
  await fs.mkdir(getBrownfieldDir(cwd), { recursive: true });
  const filePath = path.join(getBrownfieldDir(cwd), "latest-report.json");
  await fs.writeFile(filePath, JSON.stringify(report, null, 2), "utf8");
  return filePath;
}