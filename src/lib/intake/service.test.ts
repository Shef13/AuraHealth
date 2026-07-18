import { describe, expect, it } from "vitest";
import { createMemoryIntakeStore } from "./store";
import { acceptedImageResponse, processInboundMessage } from "./service";
import type { NormalisedInboundMessage } from "./types";

const base: NormalisedInboundMessage = { provider: "mock", providerMessageId: "mock-image-1", from: "+440000000000", body: "scale", timestamp: "2026-07-18T11:00:00.000Z", media: [{ providerMediaId: "media-1", mimeType: "image/jpeg", sizeBytes: 1000 }], rawPayloadRetention: "discarded" };

describe("messaging intake service", () => {
  it("creates message and scale image events for Arthur", () => {
    const result = processInboundMessage(base, { store: createMemoryIntakeStore() });
    expect(result.outcome).toBe("accepted");
    expect(result.safeResponse).toBe(acceptedImageResponse);
    expect(result.events.map((event) => event.type)).toContain("message.received");
    expect(result.events.map((event) => event.type)).toContain("scale_image.received");
    expect(result.events.map((event) => event.type)).toContain("weight.extraction_started");
  });

  it("is idempotent by provider message id", () => {
    const store = createMemoryIntakeStore();
    processInboundMessage(base, { store });
    const duplicate = processInboundMessage(base, { store });
    expect(duplicate.outcome).toBe("duplicate");
    expect(store.all()).toHaveLength(1);
  });

  it("rejects unsupported media safely", () => {
    const result = processInboundMessage({ ...base, providerMessageId: "mock-pdf", media: [{ providerMediaId: "media-pdf", mimeType: "application/pdf", sizeBytes: 1000 }] }, { store: createMemoryIntakeStore() });
    expect(result.outcome).toBe("unsupported_media");
    expect(result.safeResponse).toContain("JPEG, PNG or WebP");
  });

  it("routes unknown senders to support", () => {
    const result = processInboundMessage({ ...base, providerMessageId: "mock-unknown", from: "+449999999999" }, { store: createMemoryIntakeStore() });
    expect(result.outcome).toBe("unknown_sender");
    expect(result.safeResponse).toContain("enrolment or support");
  });
});
