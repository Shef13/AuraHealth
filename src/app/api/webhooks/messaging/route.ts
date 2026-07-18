import { getConfig } from "@/lib/config";
import { intakeStore } from "@/lib/intake/store";
import { parseMockWebhook, parseTwilioWebhook } from "@/lib/intake/parsers";
import { processInboundMessage } from "@/lib/intake/service";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const config = getConfig();
  const url = request.url;
  const contentType = request.headers.get("content-type") ?? "";
  const provider = request.headers.get("x-auracare-provider") ?? config.MESSAGING_PROVIDER;
  const debugRawPayloads = process.env.STORE_RAW_PROVIDER_PAYLOADS === "true";
  const headers = Object.fromEntries(request.headers.entries());

  const parsed = provider === "twilio"
    ? parseTwilioWebhook({ url, headers, body: await request.text(), debugRawPayloads }, process.env.TWILIO_AUTH_TOKEN, config.AURACARE_MODE === "live")
    : parseMockWebhook(contentType.includes("application/json") ? await request.json() : Object.fromEntries(new URLSearchParams(await request.text())), undefined, debugRawPayloads);

  if (!parsed.ok) return providerResponse(parsed.safeResponse, parsed.status);
  const result = processInboundMessage(parsed.message, { store: intakeStore });
  return providerResponse(result.safeResponse, result.outcome === "accepted" || result.outcome === "duplicate" ? 200 : 202);
}

function providerResponse(message: string, status: number): Response {
  return new Response(message, { status, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
}
