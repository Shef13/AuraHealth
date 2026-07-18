import { getConfig } from "@/lib/config";
import { handleVoiceCallback } from "@/lib/calls/service";
import { callStore } from "@/lib/calls/store";
import type { CallStatus } from "@/lib/calls/types";
import { validateTwilioSignature } from "@/lib/intake/parsers";
import { mockMessagingProvider } from "@/lib/providers/mock";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const config = getConfig();
  const body = await request.text();
  const params = new URLSearchParams(body);
  const provider = request.headers.get("x-auracare-provider") ?? config.VOICE_PROVIDER;
  const authenticated = provider === "twilio" && config.AURACARE_MODE === "live"
    ? validateTwilioSignature(request.url, body, request.headers.get("x-twilio-signature") ?? undefined, process.env.TWILIO_AUTH_TOKEN ?? "")
    : true;
  const result = await handleVoiceCallback({ provider: provider === "twilio" ? "twilio" : "mock", providerCallId: params.get("CallSid") ?? params.get("providerCallId") ?? "", callbackId: params.get("CallbackSid") ?? params.get("SequenceNumber") ?? `${params.get("CallSid")}-${params.get("CallStatus")}`, status: normaliseStatus(params.get("CallStatus") ?? "failed"), timestamp: new Date().toISOString(), authenticated }, callStore, mockMessagingProvider);
  return new Response(result.patientMessage, { status: authenticated ? 200 : 401, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
}

function normaliseStatus(status: string): CallStatus {
  if (status === "in-progress") return "answered";
  if (status === "no-answer") return "no answer";
  if (["scheduled", "ringing", "answered", "completed", "failed", "no answer", "cancelled"].includes(status)) return status as CallStatus;
  return "failed";
}
