import { randomUUID } from "node:crypto";
import {
  EvidencePackage,
  EvidencePackageSchema,
  EvidenceSource,
  HarnessSpecRef,
} from "./schemas.js";

export interface EvidenceBuilderInput {
  runId: string;
  loopId: string;
  source: EvidenceSource;
  goal: string;
  steps?: string[];
  assumptions?: string[];
  harnessBoundary?: Partial<HarnessSpecRef>;
}

export class EvidencePackageBuilder {
  private readonly data: Partial<EvidencePackage>;

  constructor(input: EvidenceBuilderInput) {
    this.data = {
      id: randomUUID(),
      runId: input.runId,
      loopId: input.loopId,
      timestamp: new Date().toISOString(),
      source: input.source,
      plan: {
        goal: input.goal,
        steps: input.steps ?? [],
        assumptions: input.assumptions ?? [],
      },
      implementation: {
        diffs: [],
        filesChanged: [],
      },
      verification: {
        tests: [],
      },
      observability: {
        logs: [],
        traces: [],
      },
      riskAssessment: {
        score: 0,
        factors: [],
        mitigations: [],
      },
      summaries: {
        executive: "",
        technical: "",
        decisionRelevant: "",
      },
      rawArtifacts: {},
      harnessBoundary: {
        name: input.harnessBoundary?.name ?? "default",
        version: input.harnessBoundary?.version ?? "0.1.0",
        path: input.harnessBoundary?.path,
      },
    };
  }

  withDiffs(
    diffs: EvidencePackage["implementation"]["diffs"],
    filesChanged?: string[],
  ): this {
    this.data.implementation = {
      diffs,
      filesChanged: filesChanged ?? diffs.map((d) => d.path),
    };
    return this;
  }

  withVerification(
    verification: Partial<EvidencePackage["verification"]>,
  ): this {
    this.data.verification = {
      ...this.data.verification!,
      ...verification,
    };
    return this;
  }

  withRiskAssessment(
    riskAssessment: Partial<EvidencePackage["riskAssessment"]>,
  ): this {
    this.data.riskAssessment = {
      ...this.data.riskAssessment!,
      ...riskAssessment,
    };
    return this;
  }

  withSummaries(summaries: Partial<EvidencePackage["summaries"]>): this {
    this.data.summaries = {
      ...this.data.summaries!,
      ...summaries,
    };
    return this;
  }

  withRawArtifacts(artifacts: Record<string, unknown>): this {
    this.data.rawArtifacts = {
      ...this.data.rawArtifacts,
      ...artifacts,
    };
    return this;
  }

  withObservability(
    observability: Partial<EvidencePackage["observability"]>,
  ): this {
    this.data.observability = {
      ...this.data.observability!,
      ...observability,
    };
    return this;
  }

  build(): EvidencePackage {
    return EvidencePackageSchema.parse(this.data);
  }
}

export function createEvidencePackage(
  input: EvidenceBuilderInput,
): EvidencePackage {
  return new EvidencePackageBuilder(input).build();
}