import { createHmac, timingSafeEqual } from "node:crypto";
import type { NormalisedInboundMessage } from "./types";

export interface ProviderRequestContext {
  url: string;
  headers: Record<string, string | undefined>;
  body: string;
  now?: () => string;
  debugRawPayloads?: boolean;
}

export type ParsedProviderRequest = { ok: true; message: NormalisedInboundMessage } | { ok: false; status: number; reason: string; safeResponse: string };

export function parseMockWebhook(input: unknown, now = () => new Date().toISOString(), debugRawPayloads = false): ParsedProviderRequest {
  const payload = input as Partial<{ providerMessageId: string; from: string; to: string; body: string; timestamp: string; media: Array<{ providerMediaId: string; mimeType: string; sizeBytes: number; sha256?: string }> }>;
  if (!payload.providerMessageId || !payload.from) return { ok: false, status: 400, reason: "missing_required_fields", safeResponse: "Missing required mock webhook fields." };
  return { ok: true, message: { provider: "mock", providerMessageId: payload.providerMessageId, from: payload.from, to: payload.to, body: payload.body ?? "", timestamp: payload.timestamp ?? now(), media: payload.media ?? [], rawPayloadRetention: debugRawPayloads ? "debug_retained" : "discarded" } };
}

export function parseTwilioWebhook(context: ProviderRequestContext, authToken?: string, liveMode = false): ParsedProviderRequest {
  if (liveMode && !authToken) return { ok: false, status: 500, reason: "missing_twilio_auth_token", safeResponse: "Webhook is not configured." };
  if (liveMode && !validateTwilioSignature(context.url, context.body, context.headers["x-twilio-signature"], authToken ?? "")) {
    return { ok: false, status: 401, reason: "invalid_signature", safeResponse: "Invalid signature." };
  }

  const params = new URLSearchParams(context.body);
  const providerMessageId = params.get("MessageSid") ?? params.get("SmsMessageSid") ?? "";
  const from = params.get("From") ?? "";
  if (!providerMessageId || !from) return { ok: false, status: 400, reason: "missing_required_fields", safeResponse: "Missing required Twilio webhook fields." };

  const mediaCount = Number(params.get("NumMedia") ?? "0");
  const media = Array.from({ length: Number.isFinite(mediaCount) ? mediaCount : 0 }, (_, index) => ({
    providerMediaId: params.get(`MediaUrl${index}`) ?? `twilio-media-${providerMessageId}-${index}`,
    mimeType: params.get(`MediaContentType${index}`) ?? "application/octet-stream",
    sizeBytes: Number(params.get(`MediaSize${index}`) ?? "0")
  }));

  return { ok: true, message: { provider: "twilio", providerMessageId, from, to: params.get("To") ?? undefined, body: params.get("Body") ?? "", timestamp: params.get("Timestamp") ?? context.now?.() ?? new Date().toISOString(), media, rawPayloadRetention: context.debugRawPayloads ? "debug_retained" : "discarded" } };
}

export function validateTwilioSignature(url: string, body: string, signature: string | undefined, authToken: string): boolean {
  if (!signature) return false;
  const params = [...new URLSearchParams(body).entries()].sort(([a], [b]) => a.localeCompare(b));
  const signed = `${url}${params.map(([key, value]) => `${key}${value}`).join("")}`;
  const expected = createHmac("sha1", authToken).update(signed).digest("base64");
  return constantTimeEqual(expected, signature);
}

export function constantTimeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
