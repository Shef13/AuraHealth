export type ISODateTime = string;
export type StableId = string;
export type Channel = "whatsapp" | "voice" | "dashboard";
export type ProviderMode = "mock" | "live";

export interface Patient { id: StableId; name: string; age: number; location: string; diagnosis: string; dryWeightKg: number; currentMedication: string; preferredPhoneNumber: string; preferredChannel: "whatsapp"; fictional: true; }
export interface PatientConsent { id: StableId; patientId: StableId; consentType: "call" | "message" | "data_processing"; status: "granted" | "withdrawn" | "pending"; createdAt: ISODateTime; }
export interface Conversation { id: StableId; patientId: StableId; channel: Channel; status: "open" | "closed"; createdAt: ISODateTime; }
export interface Message { id: StableId; conversationId: StableId; direction: "inbound" | "outbound"; body: string; providerPayloadRef?: StableId; createdAt: ISODateTime; }
export interface MediaAsset { id: StableId; patientId: StableId; providerMediaId: string; storageReference: string; mimeType: string; sizeBytes: number; sha256: string; status: "retained" | "marked_for_deletion" | "deleted"; createdAt: ISODateTime; }
export interface WeightReading { id: StableId; patientId: StableId; valueKg: number; source: "patient_confirmed" | "scale_image" | "manual_entry" | "seed"; recordedAt: ISODateTime; }
export interface WeightExtraction { id: StableId; mediaAssetId: StableId; value: number | null; unit: "kg" | "lb" | null; confidence: number; status: "success" | "uncertain" | "failed"; visibleCandidates: Array<{ value: number; unit: "kg" | "lb" | null }>; qualityIssues: string[]; requiresConfirmation: true; imageHash: string; imageDeletionStatus: "retained" | "scheduled" | "deleted"; deleteAfter?: ISODateTime; rawProviderPayloadRef?: StableId; createdAt: ISODateTime; }
export interface CallPermission { id: StableId; patientId: StableId; status: "requested" | "granted" | "declined"; createdAt: ISODateTime; }
export interface CallSession { id: StableId; patientId: StableId; status: "queued" | "in_progress" | "completed" | "failed"; startedAt?: ISODateTime; endedAt?: ISODateTime; }
export interface AssessmentQuestion { id: StableId; prompt: string; clinicalSignal: string; }
export interface AssessmentResponse { id: StableId; callSessionId: StableId; questionId: StableId; transcript: string; createdAt: ISODateTime; }
export interface AnalysisEvent { id: StableId; patientId: StableId; eventType: string; summary: string; createdAt: ISODateTime; }
export interface RiskAssessment { id: StableId; patientId: StableId; label: "low" | "watch" | "possible_deterioration_signal"; score: number; explanation: string; requiresClinicianReview: true; createdAt: ISODateTime; }
export interface ClinicalAlert { id: StableId; patientId: StableId; assessmentId: StableId; title: string; status: "new" | "reviewed" | "closed"; createdAt: ISODateTime; }
export interface Intervention { id: StableId; patientId: StableId; clinicianName: string; note: string; createdAt: ISODateTime; }
export interface FollowUp { id: StableId; patientId: StableId; message: string; scheduledFor: ISODateTime; status: "scheduled" | "sent"; }
export interface AuditEvent { id: StableId; actor: "patient" | "clinician" | "system"; action: string; targetId: StableId; createdAt: ISODateTime; }

export type AuraCareEventType =
  | "message.received" | "scale_image.received" | "weight.extraction_started" | "weight.extraction_completed"
  | "weight.confirmation_requested" | "weight.confirmed" | "call.permission_requested" | "call.permission_granted"
  | "call.started" | "call.question_asked" | "call.response_received" | "analysis.signal_detected"
  | "analysis.completed" | "alert.created" | "intervention.recorded" | "follow_up.scheduled";

export interface AuraCareEvent { id: StableId; type: AuraCareEventType; patientId: StableId; occurredAt: ISODateTime; payload: Record<string, unknown>; }
