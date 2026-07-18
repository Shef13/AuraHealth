import { arthurPendleton, arthurWeightReadings } from "@/lib/demo/arthur";
import { handleCallPermissionAction, requestCallPermission } from "@/lib/calls/service";
import { callStore } from "@/lib/calls/store";
import type { CallPermissionAction } from "@/lib/calls/types";
import { mockMessagingProvider } from "@/lib/providers/mock";
import { mockVoiceOrchestrationProvider } from "@/lib/calls/providers";

export async function POST(request: Request): Promise<Response> {
  const body = await request.json() as Partial<{ action: "request_permission" | CallPermissionAction }>;
  const confirmedReading = { id: "weight-arthur-confirmed", patientId: arthurPendleton.id, valueKg: 79.8, source: "scale_image" as const, recordedAt: "2026-07-18T11:02:00.000Z" };
  const result = body.action === "request_permission"
    ? await requestCallPermission({ patient: arthurPendleton, confirmedReading, priorReadings: arthurWeightReadings, messagingProvider: mockMessagingProvider, store: callStore })
    : await handleCallPermissionAction({ patient: arthurPendleton, action: body.action ?? "call_now", voiceProvider: mockVoiceOrchestrationProvider, messagingProvider: mockMessagingProvider, store: callStore });
  return json(result, 202);
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}
