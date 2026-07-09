import YAML from "yaml";
import {
  BackpressurePolicy,
  BackpressurePolicySchema,
} from "@cobusgreyling/outerloop-core";

export function parsePolicyYaml(content: string): BackpressurePolicy {
  const raw = YAML.parse(content) as Record<string, unknown>;
  const backpressure = (raw.backpressure ?? raw) as Record<string, unknown>;
  return BackpressurePolicySchema.parse(backpressure);
}

export function parsePolicyFile(content: string): BackpressurePolicy {
  return parsePolicyYaml(content);
}