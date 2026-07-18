import { createHash } from "node:crypto";
import { arthurPendleton } from "@/lib/demo/arthur";
import type { AuraCareEvent, MediaAsset, WeightExtraction, WeightReading } from "@/lib/domain/types";
import type { MediaFile, MessagingProvider, VisionProvider } from "@/lib/providers/interfaces";
import { validateWeightExtractionResult } from "./schema";
import { confirmationStore, type ConfirmationStore } from "./store";
import { displayWeight, poundsToKg, roundToOneDecimal } from "./units";
import type { ConfirmationInput, ConfirmationResult, ExtractionLimits, StructuredWeightExtractionResult, WeightExtractionWorkflowResult } from "./types";

export const defaultExtractionLimits: ExtractionLimits = { minKg: 25, maxKg: 250, minLb: 55, maxLb: 550, lowConfidenceThreshold: 0.75 };
export const retakeOrManualMessage = "I couldn’t read the scale clearly. Please send another photograph or enter your weight manually.";

export async function runWeightExtractionWorkflow(input: { patientId: string; mediaAsset: MediaAsset; mediaFile: MediaFile; visionProvider: VisionProvider; messagingProvider: MessagingProvider; to: string; limits?: ExtractionLimits; now?: () => string }): Promise<WeightExtractionWorkflowResult> {
  const now = input.now ?? (() => new Date().toISOString());
  const imageHash = hashImage(input.mediaFile.bytes);
  const providerResult = validateWeightExtractionResult(await input.visionProvider.extractWeight({ media: { ...input.mediaFile, sha256: imageHash }, mediaAssetId: input.mediaAsset.id }));
  const structured = applyExtractionRules(providerResult, input.limits ?? defaultExtractionLimits);
  const extraction = toWeightExtraction(structured, input.mediaAsset.id, imageHash, now());
  const patientMessage = buildConfirmationMessage(structured);

  if (structured.status === "success" && structured.value !== null && structured.unit !== null) {
    await input.messagingProvider.sendInteractiveMessage({ to: input.to, body: patientMessage, actions: [{ id: "confirm_reading", label: "Confirm reading" }, { id: "retake_photo", label: "Retake photo" }, { id: "enter_weight_manually", label: "Enter weight manually" }] });
  } else {
    await input.messagingProvider.sendInteractiveMessage({ to: input.to, body: retakeOrManualMessage, actions: [{ id: "retake_photo", label: "Retake photo" }, { id: "enter_weight_manually", label: "Enter weight manually" }] });
  }

  const events: AuraCareEvent[] = [
    { id: `event-${extraction.id}-completed`, type: "weight.extraction_completed", patientId: input.patientId, occurredAt: extraction.createdAt, payload: { extractionId: extraction.id, mediaAssetId: input.mediaAsset.id, status: structured.status, value: structured.value, unit: structured.unit, confidence: structured.confidence, visibleCandidates: structured.visibleCandidates, qualityIssues: structured.qualityIssues, requiresConfirmation: true, imageDeletionStatus: extraction.imageDeletionStatus } }
  ];
  if (structured.status === "success" && structured.value !== null && structured.unit !== null) events.push({ id: `event-${extraction.id}-confirmation`, type: "weight.confirmation_requested", patientId: input.patientId, occurredAt: extraction.createdAt, payload: { extractionId: extraction.id, display: displayWeight(structured.value, structured.unit), actions: ["confirm_reading", "retake_photo", "enter_weight_manually"] } });
  return { extraction, events, patientMessage, structured };
}

export function applyExtractionRules(result: StructuredWeightExtractionResult, limits: ExtractionLimits = defaultExtractionLimits): StructuredWeightExtractionResult {
  const issues = new Set(result.qualityIssues);
  if (result.visibleCandidates.length > 1) issues.add("multiple visible numeric candidates");
  if (result.value !== null && result.unit === null) issues.add("missing unit");
  if (result.confidence < limits.lowConfidenceThreshold) issues.add("low confidence");
  if (result.value !== null && result.unit === "kg" && (result.value < limits.minKg || result.value > limits.maxKg)) issues.add("outside plausible kilogram limits");
  if (result.value !== null && result.unit === "lb" && (result.value < limits.minLb || result.value > limits.maxLb)) issues.add("outside plausible pound limits");
  const status = result.status === "success" && issues.size === 0 ? "success" : result.status === "failed" ? "failed" : "uncertain";
  return { ...result, status, qualityIssues: [...issues], requiresConfirmation: true };
}

export function confirmWeightReading(input: ConfirmationInput, store: ConfirmationStore = confirmationStore): ConfirmationResult {
  if (store.has(input.confirmationId)) return { events: [], patientMessage: "Thanks — I already have this confirmation.", idempotent: true };
  store.save(input.confirmationId);
  const now = input.now?.() ?? new Date().toISOString();

  if (input.action === "retake_photo") return { events: [{ id: `event-${input.confirmationId}-retake`, type: "weight.confirmation_requested", patientId: input.mediaAsset.patientId, occurredAt: now, payload: { action: "retake_photo", message: retakeOrManualMessage } }], patientMessage: retakeOrManualMessage, idempotent: false };

  const valueKg = input.action === "enter_weight_manually"
    ? input.manualValueKg
    : input.extraction.unit === "kg" ? input.extraction.value : input.extraction.unit === "lb" && input.extraction.value !== null ? poundsToKg(input.extraction.value) : undefined;

  if (valueKg === undefined || valueKg === null || input.extraction.status !== "success" && input.action !== "enter_weight_manually") return { events: [], patientMessage: retakeOrManualMessage, idempotent: false };

  const reading: WeightReading = { id: `weight-${input.confirmationId}`, patientId: input.mediaAsset.patientId, valueKg: roundToOneDecimal(valueKg), source: input.action === "enter_weight_manually" ? "manual_entry" : "scale_image", recordedAt: now };
  const prior = input.previousConfirmedReadings.at(-1);
  const dryWeightChangeKg = roundToOneDecimal(reading.valueKg - arthurPendleton.dryWeightKg);
  const priorReadingChangeKg = prior ? roundToOneDecimal(reading.valueKg - prior.valueKg) : undefined;
  const events: AuraCareEvent[] = [{ id: `event-${input.confirmationId}-confirmed`, type: "weight.confirmed", patientId: reading.patientId, occurredAt: now, payload: { readingId: reading.id, extractionId: input.extraction.id, mediaAssetId: input.mediaAsset.id, valueKg: reading.valueKg, source: reading.source, dryWeightChangeKg, priorReadingChangeKg, nextWorkflowDecision: "request_call_permission" } }];
  return { events, reading, patientMessage: "Thanks, Arthur. I’ve recorded that reading for clinician review in this demo.", idempotent: false, dryWeightChangeKg, priorReadingChangeKg };
}

function toWeightExtraction(result: StructuredWeightExtractionResult, mediaAssetId: string, imageHash: string, createdAt: string): WeightExtraction {
  return { id: `extraction-${mediaAssetId}`, mediaAssetId, value: result.value, unit: result.unit, confidence: result.confidence, status: result.status, visibleCandidates: result.visibleCandidates, qualityIssues: result.qualityIssues, requiresConfirmation: true, imageHash, imageDeletionStatus: "scheduled", deleteAfter: "2026-08-17T00:00:00.000Z", createdAt };
}

function buildConfirmationMessage(result: StructuredWeightExtractionResult): string {
  if (result.status !== "success" || result.value === null || result.unit === null) return retakeOrManualMessage;
  return `I read your scale as ${displayWeight(result.value, result.unit)}. Is that correct?`;
}

function hashImage(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}
