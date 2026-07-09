import { randomUUID } from "node:crypto";
import type { TasteRule, TasteRuleAction } from "@cobusgreyling/outerloop-core";
import type { TasteProfile } from "./profile.js";

const ACTION_KEYWORDS: Record<string, TasteRuleAction> = {
  escalate: "escalate",
  block: "block",
  "require extra evidence": "requireExtraEvidence",
  "extra evidence": "requireExtraEvidence",
  "suggest alternative": "suggestAlternative",
  alternative: "suggestAlternative",
};

function inferAction(text: string): TasteRuleAction {
  const lower = text.toLowerCase();
  for (const [keyword, action] of Object.entries(ACTION_KEYWORDS)) {
    if (lower.includes(keyword)) return action;
  }
  return "escalate";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export interface CaptureOptions {
  critiquePath: string;
  content: string;
  profileName?: string;
}

export function extractRulesFromCritique(
  content: string,
  sourcePath: string,
): TasteRule[] {
  const rules: TasteRule[] = [];
  const now = new Date().toISOString();
  let inRulesSection = false;

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("<!--")) continue;

    if (/^##\s*(taste rules|critique|constraints|rules)/i.test(line)) {
      inRulesSection = true;
      continue;
    }
    if (/^##\s/.test(line)) {
      inRulesSection = false;
    }

    const ruleMatch =
      line.match(/^RULE:\s*(.+)$/i) ??
      line.match(/^-\s*\[rule\]\s*(.+)$/i) ??
      (inRulesSection ? line.match(/^-\s+(.+)$/) : null);

    if (!ruleMatch?.[1]) continue;

    const body = ruleMatch[1].trim();
    const whenSep = body.split(/\s+→\s+|\s+->\s+|\s+—\s+/);
    const when = whenSep[0]?.trim() ?? body;
    const actionHint = whenSep[1]?.trim() ?? body;
    const name = when.length > 60 ? `${when.slice(0, 57)}…` : when;

    rules.push({
      id: randomUUID(),
      name,
      description: body,
      rationale: `Captured from critique: ${sourcePath}`,
      when,
      action: inferAction(actionHint),
      examples: { good: [], bad: [] },
      version: 1,
      provenance: { capturedFrom: sourcePath, date: now },
    });
  }

  return rules;
}

export function buildProfileFromCritique(options: CaptureOptions): TasteProfile {
  const rules = extractRulesFromCritique(options.content, options.critiquePath);
  const name = options.profileName ?? "team-default";

  return {
    name,
    version: 1,
    description: `Taste profile captured from ${options.critiquePath}`,
    rules,
    updatedAt: new Date().toISOString(),
  };
}