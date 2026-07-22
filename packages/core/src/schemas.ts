import { z } from "zod";

export const EvidenceSourceSchema = z.enum([
  "loop-engineering",
  "custom-harness",
  "cursor",
  "claude-code",
  "manual",
]);

export const DiffSchema = z.object({
  path: z.string(),
  hunks: z.string(),
  additions: z.number().int().nonnegative(),
  deletions: z.number().int().nonnegative(),
});

export const TestResultSchema = z.object({
  name: z.string(),
  status: z.enum(["pass", "fail", "skip", "error"]),
  durationMs: z.number().nonnegative().optional(),
  output: z.string().optional(),
});

export const TraceSchema = z.object({
  id: z.string(),
  label: z.string(),
  timestamp: z.string().datetime(),
  detail: z.string().optional(),
});

export const TokenUsageSchema = z.object({
  input: z.number().int().nonnegative(),
  output: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  estimatedCostUsd: z.number().nonnegative().optional(),
});

export const HarnessSpecRefSchema = z.object({
  name: z.string(),
  version: z.string(),
  path: z.string().optional(),
});

export const EvidencePackageSchema = z.object({
  id: z.string(),
  runId: z.string(),
  loopId: z.string(),
  timestamp: z.string().datetime(),
  source: EvidenceSourceSchema,
  plan: z.object({
    goal: z.string(),
    steps: z.array(z.string()),
    assumptions: z.array(z.string()),
  }),
  implementation: z.object({
    diffs: z.array(DiffSchema),
    filesChanged: z.array(z.string()),
  }),
  verification: z.object({
    tests: z.array(TestResultSchema),
    staticAnalysis: z.record(z.string(), z.unknown()).optional(),
    manualChecks: z.array(z.string()).optional(),
  }),
  observability: z.object({
    logs: z.array(z.string()),
    traces: z.array(TraceSchema),
    cost: TokenUsageSchema.optional(),
  }),
  riskAssessment: z.object({
    score: z.number().min(0).max(10),
    factors: z.array(z.string()),
    mitigations: z.array(z.string()),
  }),
  summaries: z.object({
    executive: z.string(),
    technical: z.string(),
    decisionRelevant: z.string(),
  }),
  rawArtifacts: z.record(z.string(), z.unknown()).default({}),
  harnessBoundary: HarnessSpecRefSchema,
});

export const VerdictDecisionSchema = z.enum([
  "ship",
  "block",
  "redirect",
  "narrow",
  "guardrail",
  "reject",
]);

export const VerdictSchema = z.object({
  id: z.string(),
  evidenceId: z.string(),
  decision: VerdictDecisionSchema,
  rationale: z.string().min(1, "Rationale is mandatory"),
  owner: z.string(),
  timestamp: z.string().datetime(),
  linkedCommits: z.array(z.string()).default([]),
  linkedPRs: z.array(z.string()).default([]),
  postVerdictStatus: z.string(),
  tasteRulesApplied: z.array(z.string()).default([]),
  backpressureApplied: z.array(z.string()).default([]),
});

export const LedgerChainStepSchema = z.object({
  step: z.string(),
  evidence: z.string(),
  decision: z.string(),
});

export const LedgerEntrySchema = z.object({
  id: z.string(),
  verdictId: z.string(),
  evidenceId: z.string(),
  commitSha: z.string().optional(),
  fullChain: z.array(LedgerChainStepSchema),
  answerabilitySummary: z.string(),
  signatures: z.array(z.string()).optional(),
});

export const HarnessSpecSchema = z.object({
  name: z.string(),
  version: z.string(),
  inside: z.object({
    capabilities: z.array(z.string()),
    toolsWhitelist: z.array(z.string()),
    memoryScopes: z.array(z.string()),
  }),
  outside: z.object({
    humanAgency: z.array(z.string()),
    vetoConditions: z.array(z.string()),
    escalationPaths: z.array(z.string()),
  }),
  observabilityHooks: z.array(z.string()),
  recoveryStrategies: z.array(z.string()),
  backpressureDefaults: z.object({
    policyId: z.string(),
    path: z.string().optional(),
  }),
});

export const TasteRuleActionSchema = z.enum([
  "escalate",
  "requireExtraEvidence",
  "block",
  "suggestAlternative",
]);

export const TasteRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  rationale: z.string(),
  when: z.string(),
  action: TasteRuleActionSchema,
  examples: z.object({
    good: z.array(z.string()),
    bad: z.array(z.string()),
  }),
  version: z.number().int().positive(),
  provenance: z.object({
    capturedFrom: z.string(),
    date: z.string().datetime(),
  }),
});

export const BackpressurePolicySchema = z.object({
  maxAutonomyHours: z.number().positive().optional(),
  sampling: z
    .object({
      highRisk: z.string(),
      mediumRisk: z.string(),
      lowRisk: z.string(),
    })
    .optional(),
  escalation: z
    .array(
      z.object({
        if: z.string(),
        then: z.string(),
      }),
    )
    .optional(),
  timebox: z
    .object({
      defaultLoop: z.string(),
    })
    .optional(),
});

export type EvidenceSource = z.infer<typeof EvidenceSourceSchema>;
export type Diff = z.infer<typeof DiffSchema>;
export type TestResult = z.infer<typeof TestResultSchema>;
export type Trace = z.infer<typeof TraceSchema>;
export type TokenUsage = z.infer<typeof TokenUsageSchema>;
export type HarnessSpecRef = z.infer<typeof HarnessSpecRefSchema>;
export type EvidencePackage = z.infer<typeof EvidencePackageSchema>;
export type VerdictDecision = z.infer<typeof VerdictDecisionSchema>;
export type Verdict = z.infer<typeof VerdictSchema>;
export type LedgerChainStep = z.infer<typeof LedgerChainStepSchema>;
export type LedgerEntry = z.infer<typeof LedgerEntrySchema>;
export type HarnessSpec = z.infer<typeof HarnessSpecSchema>;
export type TasteRuleAction = z.infer<typeof TasteRuleActionSchema>;
export type TasteRule = z.infer<typeof TasteRuleSchema>;
export type BackpressurePolicy = z.infer<typeof BackpressurePolicySchema>;