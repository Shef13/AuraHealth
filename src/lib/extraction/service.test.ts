import { describe, expect, it } from "vitest";
import { arthurWeightReadings } from "@/lib/demo/arthur";
import type { MediaAsset } from "@/lib/domain/types";
import { mockMessagingProvider, mockVisionProvider } from "@/lib/providers/mock";
import { applyExtractionRules, confirmWeightReading, runWeightExtractionWorkflow } from "./service";
import { createMemoryConfirmationStore } from "./store";
import { poundsToKg } from "./units";

const mediaAsset: MediaAsset = { id: "media-test-scale", patientId: "patient-arthur-pendleton", providerMediaId: "mock-media", storageReference: "mock-storage/media-test-scale", mimeType: "image/jpeg", sizeBytes: 1234, sha256: "pending", status: "retained", createdAt: "2026-07-18T11:00:00.000Z" };

describe("scale image extraction workflow", () => {
  it("produces the deterministic 79.8 kg mock extraction without confirming it", async () => {
    const result = await runWeightExtractionWorkflow({ patientId: mediaAsset.patientId, mediaAsset, mediaFile: { bytes: new Uint8Array([1, 2, 3]), mimeType: "image/jpeg", sha256: "pending" }, visionProvider: mockVisionProvider, messagingProvider: mockMessagingProvider, to: "+440000000000", now: () => "2026-07-18T11:01:00.000Z" });
    expect(result.structured.value).toBe(79.8);
    expect(result.structured.confidence).toBe(0.96);
    expect(result.events.map((event) => event.type)).toContain("weight.extraction_completed");
    expect(result.events.map((event) => event.type)).toContain("weight.confirmation_requested");
  });

  it("does not create a reading for low confidence extraction", () => {
    const extraction = applyExtractionRules({ status: "success", value: 79.8, unit: "kg", confidence: 0.4, visibleCandidates: [{ value: 79.8, unit: "kg" }], qualityIssues: ["blur"], requiresConfirmation: true });
    expect(extraction.status).toBe("uncertain");
    expect(extraction.qualityIssues).toContain("low confidence");
  });

  it("creates a linked reading only after confirmation", async () => {
    const workflow = await runWeightExtractionWorkflow({ patientId: mediaAsset.patientId, mediaAsset, mediaFile: { bytes: new Uint8Array([1]), mimeType: "image/jpeg", sha256: "pending" }, visionProvider: mockVisionProvider, messagingProvider: mockMessagingProvider, to: "+440000000000" });
    const result = confirmWeightReading({ action: "confirm_reading", extraction: workflow.extraction, mediaAsset, previousConfirmedReadings: arthurWeightReadings, confirmationId: "confirm-1", now: () => "2026-07-18T11:02:00.000Z" }, createMemoryConfirmationStore());
    expect(result.reading?.source).toBe("scale_image");
    expect(result.reading?.valueKg).toBe(79.8);
    expect(result.events[0]?.payload.extractionId).toBe(workflow.extraction.id);
    expect(result.dryWeightChangeKg).toBe(1.8);
  });

  it("supports retake and manual entry paths", async () => {
    const workflow = await runWeightExtractionWorkflow({ patientId: mediaAsset.patientId, mediaAsset, mediaFile: { bytes: new Uint8Array([1]), mimeType: "image/jpeg", sha256: "pending" }, visionProvider: mockVisionProvider, messagingProvider: mockMessagingProvider, to: "+440000000000" });
    const store = createMemoryConfirmationStore();
    const retake = confirmWeightReading({ action: "retake_photo", extraction: workflow.extraction, mediaAsset, previousConfirmedReadings: [], confirmationId: "retake-1" }, store);
    const manual = confirmWeightReading({ action: "enter_weight_manually", extraction: workflow.extraction, mediaAsset, previousConfirmedReadings: [], manualValueKg: 80.1, confirmationId: "manual-1" }, store);
    expect(retake.reading).toBe(undefined);
    expect(manual.reading?.source).toBe("manual_entry");
  });

  it("is idempotent for duplicate confirmations", async () => {
    const workflow = await runWeightExtractionWorkflow({ patientId: mediaAsset.patientId, mediaAsset, mediaFile: { bytes: new Uint8Array([1]), mimeType: "image/jpeg", sha256: "pending" }, visionProvider: mockVisionProvider, messagingProvider: mockMessagingProvider, to: "+440000000000" });
    const store = createMemoryConfirmationStore();
    confirmWeightReading({ action: "confirm_reading", extraction: workflow.extraction, mediaAsset, previousConfirmedReadings: [], confirmationId: "same" }, store);
    const duplicate = confirmWeightReading({ action: "confirm_reading", extraction: workflow.extraction, mediaAsset, previousConfirmedReadings: [], confirmationId: "same" }, store);
    expect(duplicate.idempotent).toBe(true);
    expect(duplicate.events).toHaveLength(0);
  });

  it("displays pound conversion without silently changing the original unit", () => {
    expect(poundsToKg(176)).toBe(79.8);
    const extraction = applyExtractionRules({ status: "success", value: 176, unit: "lb", confidence: 0.96, visibleCandidates: [{ value: 176, unit: "lb" }], qualityIssues: [], requiresConfirmation: true });
    expect(extraction.unit).toBe("lb");
  });

  it("rejects malformed provider output", async () => {
    const badVision = { async extractWeight() { return { value: "79.8" }; } };
    await expect(runWeightExtractionWorkflow({ patientId: mediaAsset.patientId, mediaAsset, mediaFile: { bytes: new Uint8Array([1]), mimeType: "image/jpeg", sha256: "pending" }, visionProvider: badVision as never, messagingProvider: mockMessagingProvider, to: "+440000000000" })).rejects.toThrow();
  });
});
