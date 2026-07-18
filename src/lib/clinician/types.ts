import type { AuditEvent, FollowUp } from "@/lib/domain/types";
import type { DemoRiskSignal } from "@/lib/risk/types";

export type QueueGroup = "Immediate review" | "Review today" | "Monitoring" | "Resolved";
export type ClinicianActionType = "acknowledge_alert" | "request_repeat_weight" | "arrange_clinician_call" | "record_simulated_intervention" | "schedule_follow_up" | "escalate_urgent_review" | "mark_resolved";
export interface ClinicianUser { id: string; name: string; role: "demo_clinician"; }
export interface QueueRow { patientId: string; patientName: string; group: QueueGroup; riskCategory: string; latestWeightChange: string; keyReportedSymptom: string; alertAge: string; workflowState: string; }
export interface ClinicianCaseState { patientId: string; acknowledged: boolean; resolved: boolean; actions: Array<{ id: string; type: ClinicianActionType; user: ClinicianUser; note: string; createdAt: string }>; auditEvents: AuditEvent[]; followUps: FollowUp[]; }
export interface EvidenceReview { row: QueueRow; risk: DemoRiskSignal; conversation: string[]; transcript: string[]; symptomAnswers: Array<{ question: string; answer: string; evidenceEventId: string }>; missingOrUncertain: string[]; auditEvents: AuditEvent[]; followUps: FollowUp[]; protectedImagePreview: string; }
