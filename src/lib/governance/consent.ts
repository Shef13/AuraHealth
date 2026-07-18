import { arthurPendleton } from "@/lib/demo/arthur";
import { appendAuditEvent } from "./audit";
import type { CommunicationDecision, ConsentKind, ConsentRecord, ConsentStatus, MessagePurpose } from "./types";

const consentVersion = "auracare-demo-consent-v1";
const requiredKinds: ConsentKind[] = ["whatsapp_communication", "call_contact", "scale_photo_processing", "health_response_processing", "care_team_sharing"];
const optionalKinds: ConsentKind[] = ["voice_feature_research"];
let consentRecords: ConsentRecord[] = seedArthurConsent();

function seedArthurConsent(): ConsentRecord[] {
  const now = "2026-07-18T09:00:00.000Z";
  return [...requiredKinds.map((kind) => ({ id: `consent-${arthurPendleton.id}-${kind}`, patientId: arthurPendleton.id, kind, status: "granted" as const, required: true, source: "patient" as const, version: consentVersion, updatedAt: now })), ...optionalKinds.map((kind) => ({ id: `consent-${arthurPendleton.id}-${kind}`, patientId: arthurPendleton.id, kind, status: "not_requested" as const, required: false, source: "system" as const, version: consentVersion, updatedAt: now }))];
}

export function resetConsentState(): ConsentRecord[] { consentRecords = seedArthurConsent(); return getConsentState(arthurPendleton.id); }
export function getConsentState(patientId: string): ConsentRecord[] { return consentRecords.filter((record) => record.patientId === patientId); }
export function hasConsent(patientId: string, kind: ConsentKind): boolean { return getConsentState(patientId).some((record) => record.kind === kind && record.status === "granted"); }

export function recordConsent(input: { patientId: string; kind: ConsentKind; status: ConsentStatus; actor: "patient" | "clinician" | "system"; source: string; requestOrCorrelationId: string; now?: () => string }): ConsentRecord {
  const previous = consentRecords.find((record) => record.patientId === input.patientId && record.kind === input.kind) ?? null;
  const updatedAt = input.now?.() ?? new Date().toISOString();
  const next: ConsentRecord = { id: previous?.id ?? `consent-${input.patientId}-${input.kind}`, patientId: input.patientId, kind: input.kind, status: input.status, required: previous?.required ?? requiredKinds.includes(input.kind), source: input.actor, version: consentVersion, updatedAt };
  consentRecords = consentRecords.filter((record) => record.id !== next.id).concat(next);
  appendAuditEvent({ id: `audit-consent-${input.patientId}-${input.kind}-${updatedAt}`, actor: input.actor, action: `consent.${input.status}`, patientId: input.patientId, timestamp: updatedAt, source: input.source, previousState: previous ? { ...previous } : null, newState: { ...next }, relevantEventIds: [], requestOrCorrelationId: input.requestOrCorrelationId });
  return next;
}

export function canSendMessage(patientId: string, purpose: MessagePurpose): CommunicationDecision {
  const whatsappGranted = hasConsent(patientId, "whatsapp_communication");
  const essential = purpose === "essential_care" || purpose === "follow_up";
  if (!whatsappGranted) return { allowed: false, essential, reasons: [essential ? "WhatsApp communication consent withdrawn; use clinician review route." : "Non-essential messaging blocked because WhatsApp consent is not granted."] };
  if (purpose === "research" && !hasConsent(patientId, "voice_feature_research")) return { allowed: false, essential: false, reasons: ["Optional voice-feature research consent is separate and not granted."] };
  return { allowed: true, essential, reasons: ["Consent permits this demo communication."] };
}
