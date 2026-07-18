import { z } from "zod";
import type { StructuredWeightExtractionResult } from "./types";

const units = ["kg", "lb"] as const;
export const weightExtractionResultSchema = z.object({
  status: z.enum(["success", "uncertain", "failed"]),
  value: z.number().nullable(),
  unit: z.enum(units).nullable(),
  confidence: z.number().min(0).max(1),
  visibleCandidates: z.array(z.object({ value: z.number(), unit: z.enum(units).nullable() })),
  qualityIssues: z.array(z.string()),
  requiresConfirmation: z.literal(true)
});

export function validateWeightExtractionResult(input: unknown): StructuredWeightExtractionResult {
  return weightExtractionResultSchema.parse(input) as StructuredWeightExtractionResult;
}
