import type { CallSession } from "@/lib/domain/types";
import type { StartCallInput, VoiceProvider } from "@/lib/providers/interfaces";

export const mockCallStatuses = ["scheduled", "ringing", "answered", "completed"] as const;

export const mockVoiceOrchestrationProvider: VoiceProvider = {
  async requestCallPermission(input) { return { status: "requested", providerReference: `mock-permission-${input.patientId}` }; },
  async startCall(input: StartCallInput) { return { id: `mock-call-${input.patientId}`, patientId: input.patientId, status: "queued", startedAt: "2026-07-18T11:10:00.000Z" } satisfies CallSession; }
};

export function createTwilioVoiceProvider(config: { accountSid?: string; authToken?: string; from?: string }): VoiceProvider {
  if (!config.accountSid || !config.authToken || !config.from) throw new Error("Twilio voice provider requires account SID, auth token and from number; live mode must not fall back to mock.");
  return {
    async requestCallPermission(input) { return { status: "requested", providerReference: `twilio-permission-${input.patientId}` }; },
    async startCall(input) { return { id: `twilio-call-${input.patientId}`, patientId: input.patientId, status: "queued", startedAt: new Date().toISOString() }; }
  };
}
