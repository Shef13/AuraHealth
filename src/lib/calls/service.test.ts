import { describe, expect, it } from "vitest";
import { arthurPendleton, arthurWeightReadings } from "@/lib/demo/arthur";
import { mockMessagingProvider } from "@/lib/providers/mock";
import { mockVoiceOrchestrationProvider } from "./providers";
import { evaluateDemoAnomaly, handleCallPermissionAction, handleVoiceCallback, requestCallPermission } from "./service";
import { createMemoryCallStore } from "./store";

const confirmedReading = { id: "weight-confirmed", patientId: arthurPendleton.id, valueKg: 79.8, source: "scale_image" as const, recordedAt: "2026-07-18T11:02:00.000Z" };

describe("call orchestration", () => {
  it("flags Arthur's deterministic anomalous weight", () => {
    const result = evaluateDemoAnomaly({ patient: arthurPendleton, confirmedReading, priorReadings: arthurWeightReadings });
    expect(result.triggered).toBe(true);
    expect(result.changeKg).toBe(1.8);
    expect(result.signal).toBe("Possible deterioration signal");
  });

  it("requests call permission after the trigger", async () => {
    const result = await requestCallPermission({ patient: arthurPendleton, confirmedReading, priorReadings: arthurWeightReadings, messagingProvider: mockMessagingProvider, store: createMemoryCallStore(), now: () => "2026-07-18T11:05:00.000Z" });
    expect(result.events[0]?.type).toBe("call.permission_requested");
    expect(result.patientMessage).toContain("Would you like me to call now?");
  });

  it("starts a mock call idempotently", async () => {
    const store = createMemoryCallStore();
    const first = await handleCallPermissionAction({ patient: arthurPendleton, action: "call_now", voiceProvider: mockVoiceOrchestrationProvider, messagingProvider: mockMessagingProvider, store, now: () => "2026-07-18T11:06:00.000Z" });
    const second = await handleCallPermissionAction({ patient: arthurPendleton, action: "call_now", voiceProvider: mockVoiceOrchestrationProvider, messagingProvider: mockMessagingProvider, store });
    expect(first.state?.status).toBe("ringing");
    expect(second.events).toHaveLength(0);
  });

  it("bypasses routine assessment for severe symptoms", async () => {
    const result = await handleCallPermissionAction({ patient: arthurPendleton, action: "severe_symptoms", voiceProvider: mockVoiceOrchestrationProvider, messagingProvider: mockMessagingProvider, store: createMemoryCallStore() });
    expect(result.bypassRoutineAssessment).toBe(true);
    expect(result.events.map((event) => event.type)).toContain("emergency.escalated");
  });

  it("handles callbacks idempotently including no answer", async () => {
    const store = createMemoryCallStore();
    const started = await handleCallPermissionAction({ patient: arthurPendleton, action: "call_now", voiceProvider: mockVoiceOrchestrationProvider, messagingProvider: mockMessagingProvider, store });
    const providerCallId = started.state?.providerCallId ?? "";
    const first = await handleVoiceCallback({ provider: "mock", providerCallId, callbackId: "cb-1", status: "no answer", timestamp: "2026-07-18T11:08:00.000Z", authenticated: true }, store, mockMessagingProvider);
    const duplicate = await handleVoiceCallback({ provider: "mock", providerCallId, callbackId: "cb-1", status: "no answer", timestamp: "2026-07-18T11:08:00.000Z", authenticated: true }, store, mockMessagingProvider);
    expect(first.state?.status).toBe("no answer");
    expect(duplicate.events).toHaveLength(0);
  });

  it("rejects unauthenticated callbacks", async () => {
    const result = await handleVoiceCallback({ provider: "twilio", providerCallId: "CA123", callbackId: "cb-bad", status: "completed", timestamp: "2026-07-18T11:09:00.000Z", authenticated: false }, createMemoryCallStore());
    expect(result.events).toHaveLength(0);
  });
});
