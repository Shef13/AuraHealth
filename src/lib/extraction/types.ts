import type { AuraCareEvent, MediaAsset, WeightExtraction, WeightReading } from "@/lib/domain/types";

export type WeightUnit = "kg" | "lb";
export type ExtractionStatus = "success" | "uncertain" | "failed";

export interface StructuredWeightExtractionResult {
  status: ExtractionStatus;
  value: number | null;
  unit: WeightUnit | null;
  confidence: number;
  visibleCandidates: Array<{ value: number; unit: WeightUnit | null }>;
  qualityIssues: string[];
  requiresConfirmation: true;
}

export interface ExtractionLimits {
  minKg: number;
  maxKg: number;
  minLb: number;
  maxLb: number;
  lowConfidenceThreshold: number;
}

export interface WeightExtractionWorkflowResult {
  extraction: WeightExtraction;
  events: AuraCareEvent[];
  patientMessage: string;
  structured: StructuredWeightExtractionResult;
}

export type ConfirmationAction = "confirm_reading" | "retake_photo" | "enter_weight_manually";

export interface ConfirmationInput {
  action: ConfirmationAction;
  extraction: WeightExtraction;
  mediaAsset: MediaAsset;
  previousConfirmedReadings: WeightReading[];
  manualValueKg?: number;
  confirmationId: string;
  now?: () => string;
}

export interface ConfirmationResult {
  events: AuraCareEvent[];
  reading?: WeightReading;
  patientMessage: string;
  idempotent: boolean;
  dryWeightChangeKg?: number;
  priorReadingChangeKg?: number;
}
