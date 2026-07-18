import type { AuraCareEvent, CallSession, Patient, WeightReading } from "@/lib/domain/types";

export type CallStatus = "permission requested" | "permission granted" | "scheduled" | "ringing" | "answered" | "completed" | "failed" | "no answer" | "cancelled";
export type CallPermissionAction = "call_now" | "call_in_30_minutes" | "contact_care_team" | "severe_symptoms";

export interface DemoAnomalyRule { dryWeightKg: number; thresholdKg: number; periodHours: number; }
export interface CallState { callId: string; patientId: string; providerCallId?: string; status: CallStatus; createdAt: string; updatedAt: string; events: AuraCareEvent[]; }
export interface CallStore { get(callId: string): CallState | undefined; getByProviderCallId(providerCallId: string): CallState | undefined; save(state: CallState): void; hasCallback(callbackId: string): boolean; saveCallback(callbackId: string): void; reset(): void; }
export interface CallWorkflowResult { events: AuraCareEvent[]; state?: CallState; patientMessage: string; bypassRoutineAssessment: boolean; }
export interface CallTriggerInput { patient: Patient; confirmedReading: WeightReading; priorReadings: WeightReading[]; now?: () => string; }
export interface VoiceCallbackInput { provider: "mock" | "twilio"; providerCallId: string; callbackId: string; status: CallStatus; timestamp: string; authenticated: boolean; }

export const defaultArthurAnomalyRule: DemoAnomalyRule = { dryWeightKg: 78.0, thresholdKg: 1.5, periodHours: 48 };
