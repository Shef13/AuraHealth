import type { GovernanceAuditEvent } from "./types";

const auditEvents: GovernanceAuditEvent[] = [];

export function appendAuditEvent(event: GovernanceAuditEvent): GovernanceAuditEvent {
  auditEvents.push(event);
  return event;
}

export function getAuditEvents(patientId?: string): GovernanceAuditEvent[] {
  return patientId ? auditEvents.filter((event) => event.patientId === patientId) : [...auditEvents];
}

export function resetAuditEvents(): void { auditEvents.length = 0; }
