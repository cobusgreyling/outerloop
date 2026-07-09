export interface ParsedState {
  lastRun?: string;
  highPriority: string[];
  watchList: string[];
  recentNoise: string[];
  raw: string;
}

export function parseStateMd(content: string): ParsedState {
  const sections: Record<string, string[]> = {
    highPriority: [],
    watchList: [],
    recentNoise: [],
  };

  let current: keyof typeof sections | null = null;
  let lastRun: string | undefined;

  for (const line of content.split("\n")) {
    const lastRunMatch = line.match(/^Last run:\s*(.+)$/i);
    if (lastRunMatch) {
      lastRun = lastRunMatch[1]?.trim();
      continue;
    }

    if (/^##\s*High Priority/i.test(line)) {
      current = "highPriority";
      continue;
    }
    if (/^##\s*Watch List/i.test(line)) {
      current = "watchList";
      continue;
    }
    if (/^##\s*Recent Noise/i.test(line)) {
      current = "recentNoise";
      continue;
    }
    if (/^##\s/.test(line) || /^---/.test(line)) {
      current = null;
      continue;
    }

    if (current && line.trim() && !line.trim().startsWith("<!--")) {
      sections[current].push(line.trim());
    }
  }

  return {
    lastRun,
    highPriority: sections.highPriority,
    watchList: sections.watchList,
    recentNoise: sections.recentNoise,
    raw: content,
  };
}