import { describe, expect, it } from "vitest";
import { createMemoryIntakeStore } from "./store";
import { processInboundMessage } from "./service";

describe("intake security controls", () => {
  it("treats replayed webhook provider IDs as idempotent duplicates", () => {
    const store = createMemoryIntakeStore();
    const inbound = { provider: "mock" as const, providerMessageId: "replay-id", from: "+440000000000", body: "photo", timestamp: "2026-07-18T09:00:00.000Z", media: [{ providerMediaId: "media-1", mimeType: "image/jpeg", sizeBytes: 1000 }], rawPayloadRetention: "discarded" as const };
    expect(processInboundMessage(inbound, { store }).outcome).toBe("accepted");
    expect(processInboundMessage(inbound, { store }).outcome).toBe("duplicate");
    expect(store.all()).toHaveLength(1);
  });
});
