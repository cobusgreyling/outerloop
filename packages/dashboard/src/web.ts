import http from "node:http";
import type { DashboardSnapshot } from "./snapshot.js";
import { getDashboardSnapshot } from "./snapshot.js";

function htmlPage(snapshot: DashboardSnapshot): string {
  const pending = snapshot.attention.pending
    .slice(0, 8)
    .map(
      (p) =>
        `<tr><td>${p.riskScore}/10</td><td><code>${p.evidenceId.slice(0, 8)}</code></td><td>${p.loopId}</td><td>${Math.round(p.priority)}</td><td>${escapeHtml(p.executive ?? "")}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>outerloop Dashboard</title>
  <style>
    :root { --bg: #0d1117; --fg: #e6edf3; --accent: #58a6ff; --muted: #8b949e; --border: #30363d; }
    * { box-sizing: border-box; }
    body { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: var(--bg); color: var(--fg); margin: 0; padding: 2rem; }
    h1 { color: var(--accent); font-size: 1.25rem; margin: 0 0 0.5rem; }
    .meta { color: var(--muted); font-size: 0.85rem; margin-bottom: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .card { border: 1px solid var(--border); border-radius: 8px; padding: 1rem; }
    .card h2 { font-size: 0.75rem; text-transform: uppercase; color: var(--muted); margin: 0 0 0.5rem; }
    .card .value { font-size: 1.5rem; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    th, td { text-align: left; padding: 0.5rem; border-bottom: 1px solid var(--border); }
    th { color: var(--muted); }
    .grade-A, .grade-B { color: #3fb950; }
    .grade-C { color: #d29922; }
    .grade-D, .grade-F { color: #f85149; }
  </style>
</head>
<body>
  <h1>outerloop Governance Dashboard</h1>
  <p class="meta">${snapshot.projectRoot} · ${snapshot.generatedAt}</p>
  <div class="grid">
    <div class="card"><h2>Audit</h2><div class="value grade-${snapshot.audit.grade}">${snapshot.audit.score}/${snapshot.audit.maxScore} (${snapshot.audit.grade})</div></div>
    <div class="card"><h2>Pending Verdicts</h2><div class="value">${snapshot.attention.total}</div></div>
    <div class="card"><h2>Cognitive Debt</h2><div class="value">${snapshot.cognitive.score}/10</div></div>
    <div class="card"><h2>Evidence</h2><div class="value">${snapshot.evidenceCount}</div></div>
  </div>
  <h2 style="font-size:0.9rem;color:var(--muted)">Attention Priority</h2>
  <table>
    <thead><tr><th>Risk</th><th>ID</th><th>Loop</th><th>Priority</th><th>Summary</th></tr></thead>
    <tbody>${pending || "<tr><td colspan=5>No pending verdicts</td></tr>"}</tbody>
  </table>
  <p class="meta" style="margin-top:2rem">Auto-refresh: <span id="countdown">10</span>s · <a href="/api/snapshot" style="color:var(--accent)">JSON API</a></p>
  <script>
    let n = 10;
    setInterval(() => { n--; if (n<=0) location.reload(); document.getElementById('countdown').textContent=n; }, 1000);
  </script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export interface WebServerOptions {
  cwd: string;
  port?: number;
  host?: string;
}

export function startWebDashboard(options: WebServerOptions): http.Server {
  const { cwd, port = 4040, host = "127.0.0.1" } = options;

  const server = http.createServer(async (req, res) => {
    try {
      const snapshot = await getDashboardSnapshot(cwd);

      if (req.url === "/api/snapshot") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(snapshot, null, 2));
        return;
      }

      if (req.url === "/" || req.url === "/index.html") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(htmlPage(snapshot));
        return;
      }

      res.writeHead(404);
      res.end("Not found");
    } catch (e) {
      res.writeHead(500);
      res.end((e as Error).message);
    }
  });

  server.listen(port, host);
  return server;
}