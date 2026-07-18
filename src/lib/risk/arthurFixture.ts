import type { AuraCareEvent } from "@/lib/domain/types";

export const arthurRiskFixtureEvents: AuraCareEvent[] = [
  { id: "risk-fixture-extraction", type: "weight.extraction_completed", patientId: "patient-arthur-pendleton", occurredAt: "2026-07-18T12:02:00.000Z", payload: { status: "success", value: 79.8, unit: "kg", confidence: 0.96 } },
  { id: "risk-fixture-weight", type: "weight.confirmed", patientId: "patient-arthur-pendleton", occurredAt: "2026-07-18T12:03:00.000Z", payload: { valueKg: 79.8, confirmedWeightKg: 79.8, dryWeightChangeKg: 1.8, priorReadingChangeKg: 1.6 } },
  { id: "risk-fixture-medication", type: "call.response_received", patientId: "patient-arthur-pendleton", occurredAt: "2026-07-18T12:07:00.000Z", payload: { questionId: "medication_taken", rawTranscript: "yes", normalisedAnswer: "yes", confidence: 0.92, emergencySignal: false } },
  { id: "risk-fixture-diet", type: "call.response_received", patientId: "patient-arthur-pendleton", occurredAt: "2026-07-18T12:08:00.000Z", payload: { questionId: "salty_meal", rawTranscript: "no", normalisedAnswer: "no", confidence: 0.92, emergencySignal: false } },
  { id: "risk-fixture-breathlessness", type: "call.response_received", patientId: "patient-arthur-pendleton", occurredAt: "2026-07-18T12:09:00.000Z", payload: { questionId: "breathlessness", rawTranscript: "a little more than usual", normalisedAnswer: "mild", confidence: 0.92, emergencySignal: false } },
  { id: "risk-fixture-orthopnoea", type: "call.response_received", patientId: "patient-arthur-pendleton", occurredAt: "2026-07-18T12:10:00.000Z", payload: { questionId: "extra_pillows", rawTranscript: "two", normalisedAnswer: "moderate", confidence: 0.92, emergencySignal: false } },
  { id: "risk-fixture-emergency-no", type: "call.response_received", patientId: "patient-arthur-pendleton", occurredAt: "2026-07-18T12:11:00.000Z", payload: { questionId: "emergency_symptoms", rawTranscript: "no", normalisedAnswer: "no", confidence: 0.92, emergencySignal: false } }
];
