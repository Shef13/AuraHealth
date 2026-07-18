import type { CallSession, RiskAssessment } from "@/lib/domain/types";
import type { AssessmentInput, ClinicalAnalysisProvider, MessagingProvider, SendInteractiveMessageInput, SendTextInput, VoiceProvider, VisionProvider } from "./interfaces";

const now = () => "2026-07-18T09:00:00.000Z";

export const mockMessagingProvider: MessagingProvider = {
  async sendText(input: SendTextInput) { return { providerMessageId: `mock-message-${input.to}`, acceptedAt: now(), mode: "mock" }; },
  async sendInteractiveMessage(input: SendInteractiveMessageInput) { return { providerMessageId: `mock-interactive-${input.actions[0]?.id ?? "none"}`, acceptedAt: now(), mode: "mock" }; },
  async downloadMedia() { return { bytes: new Uint8Array([1, 2, 3]), mimeType: "image/jpeg", sha256: "mock-scale-image-hash" }; }
};

export const mockVisionProvider: VisionProvider = { async extractWeight() { return { detectedWeightKg: 80.2, confidence: 0.91, rawProviderPayload: { provider: "mock", reading: "80.2 kg" } }; } };
export const mockVoiceProvider: VoiceProvider = {
  async requestCallPermission() { return { status: "granted", providerReference: "mock-call-permission" }; },
  async startCall(input) { return { id: `call-${input.patientId}`, patientId: input.patientId, status: "completed", startedAt: now(), endedAt: now() } satisfies CallSession; }
};
export const mockClinicalAnalysisProvider: ClinicalAnalysisProvider = {
  async analyseAssessment(input: AssessmentInput) { return { id: `risk-${input.patientId}`, patientId: input.patientId, label: "possible_deterioration_signal", score: 0.68, explanation: "Demo risk assessment based on simulated weight gain and breathlessness responses. Requires clinician review.", requiresClinicianReview: true, createdAt: now() } satisfies RiskAssessment; }
};
