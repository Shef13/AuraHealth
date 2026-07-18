import type { ISODateTime, StableId } from "@/lib/domain/types";

export type ConsentKind = "whatsapp_communication" | "call_contact" | "scale_photo_processing" | "health_response_processing" | "care_team_sharing" | "voice_feature_research";
export type ConsentStatus = "granted" | "withdrawn" | "not_requested";
export type MessagePurpose = "essential_care" | "follow_up" | "research" | "marketing";

export interface ConsentRecord { id: StableId; patientId: StableId; kind: ConsentKind; status: ConsentStatus; required: boolean; source: "patient" | "clinician" | "system"; version: string; updatedAt: ISODateTime; }
export interface CommunicationDecision { allowed: boolean; reasons: string[]; essential: boolean; }
export interface GovernanceAuditEvent { id: StableId; actor: "patient" | "clinician" | "system"; action: string; patientId: StableId; timestamp: ISODateTime; source: string; previousState: Record<string, unknown> | null; newState: Record<string, unknown>; relevantEventIds: StableId[]; requestOrCorrelationId: string; }
export interface MediaRetentionRecord { mediaAssetId: StableId; patientId: StableId; storageReference: string; status: "retained" | "scheduled_for_deletion" | "deleted"; deleteAfter: ISODateTime; deletedAt?: ISODateTime; protectedPreviewPath: string; }
