import { z } from "zod";
import type { StructuredAssessmentResponse } from "./types";

export const assessmentResponseSchema = z.object({
  questionId: z.string(),
  rawTranscript: z.string(),
  normalisedAnswer: z.enum(["yes", "no", "unknown", "mild", "moderate", "severe", "not_applicable"]),
  confidence: z.number().min(0).max(1),
  requiresClarification: z.boolean(),
  emergencySignal: z.boolean()
});

export function validateAssessmentResponse(input: unknown): StructuredAssessmentResponse {
  return assessmentResponseSchema.parse(input) as StructuredAssessmentResponse;
}
