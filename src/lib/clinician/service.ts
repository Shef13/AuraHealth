import { arthurPendleton } from "@/lib/demo/arthur";
import type { AuditEvent, FollowUp } from "@/lib/domain/types";
import { arthurRiskFixtureEvents } from "@/lib/risk/arthurFixture";
import { calculateDemoRiskSignal } from "@/lib/risk/engine";
import { clinicianStore, type ClinicianStore } from "./store";
import type { ClinicianActionType, ClinicianUser, EvidenceReview, QueueGroup, QueueRow } from "./types";
import { appendAuditEvent } from "@/lib/governance/audit";
import { canSendMessage } from "@/lib/governance/consent";
import { safetyBranchMessage } from "@/lib/governance/emergency";

export const demoClinician: ClinicianUser = { id: "clinician-demo-user", name: "Dr Demo Clinician", role: "demo_clinician" };
export const safeFollowUpMessage = "Your care team has reviewed your check-in. Please follow the instructions they have given you. Aura will check in again tomorrow morning.";

export function getArthurQueueRow(store: ClinicianStore = clinicianStore): QueueRow {
  const state = store.get(arthurPendleton.id);
  const risk = calculateDemoRiskSignal({ patientId: arthurPendleton.id, dryWeightKg: arthurPendleton.dryWeightKg, events: arthurRiskFixtureEvents });
  const group: QueueGroup = state.resolved ? "Resolved" : risk.category === "high" || risk.emergencyReview ? "Immediate review" : risk.category === "medium" ? "Review today" : "Monitoring";
  return { patientId: arthurPendleton.id, patientName: arthurPendleton.name, group, riskCategory: risk.category, latestWeightChange: "+1.8 kg", keyReportedSymptom: "A little more breathless; two pillows", alertAge: "12 min", workflowState: state.resolved ? "Resolved" : state.acknowledged ? "Review in progress" : "Clinician review required" };
}

export function getQueueGroups(store: ClinicianStore = clinicianStore): Record<QueueGroup, QueueRow[]> {
  const row = getArthurQueueRow(store);
  return { "Immediate review": row.group === "Immediate review" ? [row] : [], "Review today": row.group === "Review today" ? [row] : [], Monitoring: row.group === "Monitoring" ? [row] : [], Resolved: row.group === "Resolved" ? [row] : [] };
}

export function getArthurEvidenceReview(store: ClinicianStore = clinicianStore): EvidenceReview {
  const state = store.get(arthurPendleton.id);
  const risk = calculateDemoRiskSignal({ patientId: arthurPendleton.id, dryWeightKg: arthurPendleton.dryWeightKg, events: arthurRiskFixtureEvents });
  return { row: getArthurQueueRow(store), risk, conversation: ["Scale image received", "I read your scale as 79.8 kg. Is that correct?", "Yes, that is correct."], transcript: ["Aura: Have you taken your water tablet today?", "Arthur: yes", "Aura: Have you felt more breathless than usual today?", "Arthur: a little more than usual", "Aura: Did you need extra pillows to sleep comfortably last night?", "Arthur: two"], symptomAnswers: arthurRiskFixtureEvents.filter((event) => event.type === "call.response_received").map((event) => ({ question: String(event.payload.questionId), answer: String(event.payload.normalisedAnswer), evidenceEventId: event.id })), missingOrUncertain: risk.excludedReasons, auditEvents: state.auditEvents, followUps: state.followUps, protectedImagePreview: "Protected preview available through /api/media/media-test-scale/preview for authorised demo users only; storage URLs are not exposed." };
}

export function recordClinicianAction(input: { patientId: string; action: ClinicianActionType; user: ClinicianUser; note?: string; now?: () => string; store?: ClinicianStore }) {
  const store = input.store ?? clinicianStore;
  const state = store.get(input.patientId);
  const now = input.now?.() ?? new Date().toISOString();
  const note = input.note ?? defaultNote(input.action);
  const actionRecord = { id: `action-${input.action}-${state.actions.length + 1}`, type: input.action, user: input.user, note, createdAt: now };
  const previousState = { acknowledged: state.acknowledged, resolved: state.resolved, actionCount: state.actions.length, followUpCount: state.followUps.length };
  const auditEvent: AuditEvent = { id: `audit-${actionRecord.id}`, actor: "clinician", action: input.action, targetId: input.patientId, createdAt: now, patientId: input.patientId, timestamp: now, source: "clinician-dashboard", previousState, newState: { requestedAction: input.action, note }, relevantEventIds: [], requestOrCorrelationId: `request-${actionRecord.id}` };
  state.actions = [...state.actions, actionRecord]; state.auditEvents = [...state.auditEvents, auditEvent];
  appendAuditEvent({ id: auditEvent.id, actor: auditEvent.actor, action: auditEvent.action, patientId: input.patientId, timestamp: now, source: auditEvent.source ?? "clinician-dashboard", previousState, newState: auditEvent.newState ?? {}, relevantEventIds: auditEvent.relevantEventIds ?? [], requestOrCorrelationId: auditEvent.requestOrCorrelationId ?? auditEvent.id });
  if (input.action === "acknowledge_alert") state.acknowledged = true;
  if (input.action === "record_simulated_intervention") state.acknowledged = true;
  if (input.action === "schedule_follow_up") {
    const decision = canSendMessage(input.patientId, "follow_up");
    if (decision.allowed) state.followUps = [...state.followUps, createFollowUp(input.patientId, now)];
  }
  if (input.action === "mark_resolved") state.resolved = true;
  store.save(state);
  return { state, action: actionRecord, auditEvent, followUp: state.followUps.at(-1), patientMessage: input.action === "schedule_follow_up" ? (canSendMessage(input.patientId, "follow_up").allowed ? safeFollowUpMessage : safetyBranchMessage("consent_withdrawn")) : undefined };
}

function createFollowUp(patientId: string, now: string): FollowUp { return { id: `follow-up-${patientId}-${now}`, patientId, message: safeFollowUpMessage, scheduledFor: "2026-07-19T08:00:00.000Z", status: "scheduled" }; }
function defaultNote(action: ClinicianActionType): string { if (action === "record_simulated_intervention") return "Clinician reviewed — temporary medication-plan adjustment recorded externally."; if (action === "escalate_urgent_review") return "Escalated for urgent clinical review in demo queue."; return `Recorded ${action.replaceAll("_", " ")}.`; }
