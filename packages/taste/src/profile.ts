import { z } from "zod";
import { TasteRuleSchema } from "@cobusgreyling/outerloop-core";

export const TasteProfileSchema = z.object({
  name: z.string(),
  version: z.number().int().positive(),
  description: z.string().optional(),
  rules: z.array(TasteRuleSchema),
  updatedAt: z.string().datetime(),
});

export type TasteProfile = z.infer<typeof TasteProfileSchema>;