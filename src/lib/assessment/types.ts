import type { AuraCareEvent } from "@/lib/domain/types";

export type NormalisedAssessmentAnswer = "yes" | "no" | "unknown" | "mild" | "moderate" | "severe" | "not_applicable";
export interface StructuredAssessmentResponse { questionId: string; rawTranscript: string; normalisedAnswer: NormalisedAssessmentAnswer; confidence: number; requiresClarification: boolean; emergencySignal: boolean; }
export interface AssessmentQuestionScript { id: string; prompt: string; confirmsHighImpact?: boolean; }
export interface AssessmentSession { id: string; patientId: string; callId: string; activeQuestionId?: string; questionIndex: number; status: "not_started" | "in_progress" | "needs_clarification" | "completed" | "stopped" | "emergency_escalated" | "human_requested"; responses: StructuredAssessmentResponse[]; events: AuraCareEvent[]; instructionsVersion: "aura-assessment-v1"; }
export interface AssessmentTurnResult { session: AssessmentSession; question?: AssessmentQuestionScript; response?: StructuredAssessmentResponse; events: AuraCareEvent[]; spokenText: string; completed: boolean; }
