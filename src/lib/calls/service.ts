import type { AuraCareEvent, Patient } from "@/lib/domain/types";
import type { MessagingProvider, VoiceProvider } from "@/lib/providers/interfaces";
import { defaultArthurAnomalyRule, type CallPermissionAction, type CallState, type CallStatus, type CallStore, type CallTriggerInput, type CallWorkflowResult, type DemoAnomalyRule, type VoiceCallbackInput } from "./types";
import { callStore } from "./store";
import { getEmergencyGuidance } from "@/lib/governance/emergency";

export const callPermissionPrompt = "Your confirmed weight is higher than your usual baseline. I’d like to call you for a short check-in. Would you like me to call now?";
export const emergencyGuidance = getEmergencyGuidance();

export function evaluateDemoAnomaly(input: CallTriggerInput, rule: DemoAnomalyRule = defaultArthurAnomalyRule) {
  const changeKg = Math.round((input.confirmedReading.valueKg - rule.dryWeightKg) * 10) / 10;
  return { triggered: changeKg >= rule.thresholdKg, changeKg, periodHours: rule.periodHours, signal: "Possible deterioration signal", recommendation: "Safety check-in recommended" };
}

export async function requestCallPermission(input: CallTriggerInput & { messagingProvider: MessagingProvider; store?: CallStore }): Promise<CallWorkflowResult> {
  const assessment = evaluateDemoAnomaly(input);
  if (!assessment.triggered) return { events: [], patientMessage: "No demo call check-in is recommended for this reading.", bypassRoutineAssessment: false };
  const now = input.now?.() ?? new Date().toISOString();
  await input.messagingProvider.sendInteractiveMessage({ to: input.patient.preferredPhoneNumber, body: callPermissionPrompt, actions: [{ id: "call_now", label: "Call me now" }, { id: "call_in_30_minutes", label: "Call in 30 minutes" }, { id: "contact_care_team", label: "Contact my care team" }, { id: "severe_symptoms", label: "I have severe symptoms" }] });
  return { events: [{ id: `event-call-permission-${input.confirmedReading.id}`, type: "call.permission_requested", patientId: input.patient.id, occurredAt: now, payload: assessment }], patientMessage: callPermissionPrompt, bypassRoutineAssessment: false };
}

export async function handleCallPermissionAction(input: { patient: Patient; action: CallPermissionAction; voiceProvider: VoiceProvider; messagingProvider: MessagingProvider; store?: CallStore; now?: () => string }): Promise<CallWorkflowResult> {
  const store = input.store ?? callStore;
  const now = input.now?.() ?? new Date().toISOString();
  if (input.action === "severe_symptoms") {
    await input.messagingProvider.sendText({ to: input.patient.preferredPhoneNumber, body: emergencyGuidance });
    return { events: [{ id: `event-emergency-${input.patient.id}-${now}`, type: "emergency.escalated", patientId: input.patient.id, occurredAt: now, payload: { guidance: emergencyGuidance, clinicianQueueNotified: true, routineAssessmentBypassed: true } }, { id: `event-alert-emergency-${input.patient.id}-${now}`, type: "alert.created", patientId: input.patient.id, occurredAt: now, payload: { title: "Severe symptoms escalation", status: "new", requiresClinicianReview: true } }], patientMessage: emergencyGuidance, bypassRoutineAssessment: true };
  }
  if (input.action === "contact_care_team") return { events: [{ id: `event-care-team-${input.patient.id}-${now}`, type: "alert.created", patientId: input.patient.id, occurredAt: now, payload: { title: "Patient requested care team contact", status: "new" } }], patientMessage: "Thanks, Arthur. I’ll add this to the clinician queue for the demo team.", bypassRoutineAssessment: true };
  const existing = store.get(`call-${input.patient.id}`);
  if (existing) return { events: [], state: existing, patientMessage: "A call is already scheduled for this demo.", bypassRoutineAssessment: false };
  const session = await input.voiceProvider.startCall({ patientId: input.patient.id, phoneNumber: input.patient.preferredPhoneNumber, questions: [] });
  const status: CallStatus = input.action === "call_in_30_minutes" ? "scheduled" : "ringing";
  const state: CallState = { callId: `call-${input.patient.id}`, patientId: input.patient.id, providerCallId: session.id, status, createdAt: now, updatedAt: now, events: [] };
  const events: AuraCareEvent[] = [{ id: `event-call-granted-${input.patient.id}-${now}`, type: "call.permission_granted", patientId: input.patient.id, occurredAt: now, payload: { action: input.action } }, callEvent(state, status, now)];
  state.events = events;
  store.save(state);
  return { events, state, patientMessage: status === "scheduled" ? "Thanks, Arthur. I’ll call in 30 minutes for this demo check-in." : "Thanks, Arthur. I’m starting the demo check-in call now.", bypassRoutineAssessment: false };
}

export async function handleVoiceCallback(input: VoiceCallbackInput, store: CallStore = callStore, messagingProvider?: MessagingProvider): Promise<CallWorkflowResult> {
  if (!input.authenticated) return { events: [], patientMessage: "Unauthenticated callback rejected.", bypassRoutineAssessment: false };
  if (store.hasCallback(input.callbackId)) return { events: [], patientMessage: "Duplicate callback ignored.", bypassRoutineAssessment: false };
  store.saveCallback(input.callbackId);
  const state = store.getByProviderCallId(input.providerCallId);
  if (!state) return { events: [], patientMessage: "Unknown call callback ignored.", bypassRoutineAssessment: false };
  state.status = input.status; state.updatedAt = input.timestamp;
  const event = callEvent(state, input.status, input.timestamp);
  state.events = [...state.events, event]; store.save(state);
  if (input.status === "no answer" && messagingProvider) await messagingProvider.sendText({ to: "mock-redacted", body: "I couldn’t reach you for the demo check-in. Please reply when you are available or contact your care team if concerned." });
  if (input.status === "failed" && messagingProvider) await messagingProvider.sendText({ to: "mock-redacted", body: "The demo call did not connect. You can retry or ask for clinician contact." });
  return { events: [event], state, patientMessage: `Call status: ${input.status}`, bypassRoutineAssessment: false };
}

function callEvent(state: CallState, status: CallStatus, occurredAt: string): AuraCareEvent {
  return { id: `event-${state.callId}-${status}-${occurredAt}`, type: "call.status_changed", patientId: state.patientId, occurredAt, payload: { callId: state.callId, providerCallId: state.providerCallId, status } };
}
