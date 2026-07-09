import React, { useEffect, useState } from "react";
import { Box, Text, render } from "ink";
import { getDashboardSnapshot, type DashboardSnapshot } from "./snapshot.js";

function riskColor(score: number): string {
  if (score >= 7) return "red";
  if (score >= 4) return "yellow";
  return "green";
}

function DashboardView({ data }: { data: DashboardSnapshot }) {
  return (
    <Box flexDirection="column" padding={1} borderStyle="round" borderColor="cyan">
      <Text bold color="cyan">
        outerloop Governance Dashboard
      </Text>
      <Text dimColor>{data.generatedAt}</Text>
      <Text> </Text>

      <Text bold>Audit</Text>
      <Text>
        Score:{" "}
        <Text
          color={
            data.audit.grade === "A" || data.audit.grade === "B"
              ? "green"
              : data.audit.grade === "C"
                ? "yellow"
                : "red"
          }
        >
          {data.audit.score}/{data.audit.maxScore} ({data.audit.grade})
        </Text>
      </Text>
      <Text> </Text>

      <Text bold>Queue</Text>
      <Text>Evidence: {data.evidenceCount} | Ledger: {data.ledgerCount}</Text>
      <Text color="yellow">Pending verdicts: {data.attention.total}</Text>
      <Text> </Text>

      <Text bold>Cognitive Debt</Text>
      <Text color={data.cognitive.level === "low" ? "green" : data.cognitive.level === "moderate" ? "yellow" : "red"}>
        {data.cognitive.score}/10 ({data.cognitive.level}) — {data.cognitive.unverdictedEvidence} unverdicted
      </Text>
      <Text> </Text>

      <Text bold>Harness</Text>
      <Text>
        {data.harness
          ? `${data.harness.name} v${data.harness.version}`
          : "No active harness"}
      </Text>
      <Text> </Text>

      {data.attention.pending.length > 0 && (
        <>
          <Text bold>Attention (top 3)</Text>
          {data.attention.pending.slice(0, 3).map((item) => (
            <Box key={item.evidenceId} flexDirection="column" marginBottom={1}>
              <Text>
                <Text color={riskColor(item.riskScore)}>{item.riskScore}/10</Text>{" "}
                {item.evidenceId.slice(0, 8)}… {item.loopId} p={Math.round(item.priority)}
              </Text>
              {item.executive && <Text dimColor>{item.executive.slice(0, 60)}</Text>}
            </Box>
          ))}
          <Text dimColor>{data.attention.batchRecommendation}</Text>
        </>
      )}

      <Text> </Text>
      <Text dimColor>Ctrl+C to exit · refreshes every 3s</Text>
    </Box>
  );
}

function RefreshingApp({ cwd }: { cwd: string }) {
  const [data, setData] = useState<DashboardSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const snap = await getDashboardSnapshot(cwd);
        if (active) {
          setData(snap);
          setError(null);
        }
      } catch (e) {
        if (active) setError((e as Error).message);
      }
    };
    load();
    const id = setInterval(load, 3000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [cwd]);

  if (error) return <Text color="red">Error: {error}</Text>;
  if (!data) return <Text>Loading governance snapshot…</Text>;
  return <DashboardView data={data} />;
}

export async function runInkDashboard(cwd: string): Promise<void> {
  const { waitUntilExit } = render(<RefreshingApp cwd={cwd} />);
  await waitUntilExit();
}