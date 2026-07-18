import { describe, expect, it } from "vitest";
import { POST } from "./route";
import { intakeStore } from "@/lib/intake/store";

describe("messaging webhook route", () => {
  it("accepts a mock Arthur image webhook", async () => {
    intakeStore.reset();
    const response = await POST(new Request("https://demo.test/api/webhooks/messaging", { method: "POST", headers: { "content-type": "application/json", "x-auracare-provider": "mock" }, body: JSON.stringify({ providerMessageId: "route-mock-1", from: "+440000000000", body: "scale", media: [{ providerMediaId: "media-1", mimeType: "image/jpeg", sizeBytes: 1000 }] }) }));
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("Thanks, Arthur");
  });
});
