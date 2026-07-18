import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { parseMockWebhook, parseTwilioWebhook, validateTwilioSignature } from "./parsers";

const url = "https://demo.test/api/webhooks/messaging";
const body = "From=whatsapp%3A%2B440000000000&To=whatsapp%3A%2B14155238886&MessageSid=SM123&Body=scale&NumMedia=1&MediaUrl0=https%3A%2F%2Fapi.twilio.test%2Fmedia&MediaContentType0=image%2Fjpeg&MediaSize0=245000";
const token = "test-token";
const signature = createHmac("sha1", token).update(`${url}${[...new URLSearchParams(body).entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}${value}`).join("")}`).digest("base64");

describe("messaging provider parsers", () => {
  it("normalises a mock inbound image", () => {
    const parsed = parseMockWebhook({ providerMessageId: "mock-1", from: "+440000000000", media: [{ providerMediaId: "media-1", mimeType: "image/jpeg", sizeBytes: 1000 }] });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.message.media[0]?.mimeType).toBe("image/jpeg");
  });

  it("normalises a valid Twilio payload", () => {
    const parsed = parseTwilioWebhook({ url, body, headers: { "x-twilio-signature": signature } }, token, true);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.message.providerMessageId).toBe("SM123");
  });

  it("rejects an invalid live Twilio signature", () => {
    expect(validateTwilioSignature(url, body, "bad", token)).toBe(false);
    const parsed = parseTwilioWebhook({ url, body, headers: { "x-twilio-signature": "bad" } }, token, true);
    expect(parsed.ok).toBe(false);
  });
});
