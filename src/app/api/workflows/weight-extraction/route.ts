import type { MediaAsset } from "@/lib/domain/types";
import { runWeightExtractionWorkflow } from "@/lib/extraction/service";
import { mockMessagingProvider, mockVisionProvider } from "@/lib/providers/mock";

export async function POST(request: Request): Promise<Response> {
  const body = await request.json() as Partial<{ mediaAsset: MediaAsset; to: string }>;
  if (!body.mediaAsset || !body.to) return json({ error: "mediaAsset and to are required" }, 400);
  const result = await runWeightExtractionWorkflow({ patientId: body.mediaAsset.patientId, mediaAsset: body.mediaAsset, mediaFile: { bytes: new Uint8Array([1, 2, 3]), mimeType: body.mediaAsset.mimeType, sha256: body.mediaAsset.sha256 }, visionProvider: mockVisionProvider, messagingProvider: mockMessagingProvider, to: body.to });
  return json({ extraction: result.extraction, events: result.events, patientMessage: result.patientMessage }, 202);
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}
