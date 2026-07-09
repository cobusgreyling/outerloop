import type { HarnessSpec } from "@cobusgreyling/outerloop-core";

export type BoundaryLevel = "strict" | "moderate" | "permissive";

const BASE: Omit<HarnessSpec, "name" | "version"> = {
  inside: {
    capabilities: ["investigate", "implement", "verify", "iterate"],
    toolsWhitelist: ["read", "write", "search", "test", "git"],
    memoryScopes: ["STATE.md", "worktree", "run-log"],
  },
  outside: {
    humanAgency: ["verdict", "taste", "policy", "ship-decision", "escalation"],
    vetoConditions: ["no-verdict", "high-risk-without-rationale", "taste-block"],
    escalationPaths: ["senior-owner", "security-review", "rollback-plan"],
  },
  observabilityHooks: ["evidence-package", "ledger-entry", "risk-score"],
  recoveryStrategies: ["revert-commit", "narrow-scope", "block-and-redirect"],
  backpressureDefaults: { policyId: "team-default", path: ".outerloop/policy/active.yaml" },
};

export function createHarnessSpec(
  name: string,
  level: BoundaryLevel = "strict",
): HarnessSpec {
  const spec: HarnessSpec = {
    name,
    version: "1.0.0",
    ...BASE,
  };

  if (level === "strict") {
    spec.inside.toolsWhitelist = ["read", "search", "test"];
    spec.outside.vetoConditions.push("agent-write-without-evidence");
    spec.outside.humanAgency.push("all-merges");
  } else if (level === "moderate") {
    spec.inside.toolsWhitelist = ["read", "write", "search", "test", "git"];
  } else {
    spec.inside.toolsWhitelist = ["read", "write", "search", "test", "git", "deploy-staging"];
    spec.outside.vetoConditions = ["no-verdict-on-production"];
  }

  return spec;
}