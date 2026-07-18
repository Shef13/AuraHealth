import type { MediaAsset, WeightExtraction, WeightReading } from "@/lib/domain/types";
import { confirmWeightReading } from "@/lib/extraction/service";
import type { ConfirmationAction } from "@/lib/extraction/types";

export async function POST(request: Request): Promise<Response> {
  const body = await request.json() as Partial<{ action: ConfirmationAction; extraction: WeightExtraction; mediaAsset: MediaAsset; previousConfirmedReadings: WeightReading[]; manualValueKg: number; confirmationId: string }>;
  if (!body.action || !body.extraction || !body.mediaAsset || !body.confirmationId) return json({ error: "action, extraction, mediaAsset and confirmationId are required" }, 400);
  const result = confirmWeightReading({ action: body.action, extraction: body.extraction, mediaAsset: body.mediaAsset, previousConfirmedReadings: body.previousConfirmedReadings ?? [], manualValueKg: body.manualValueKg, confirmationId: body.confirmationId });
  return json(result, result.idempotent ? 200 : 202);
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}
