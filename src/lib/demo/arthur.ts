import type { AuraCareEvent, AuraCareEventType, Patient, WeightReading } from "@/lib/domain/types";

export const arthurPendleton: Patient = { id: "patient-arthur-pendleton", name: "Arthur Pendleton", age: 82, location: "Leeds", diagnosis: "HFrEF", dryWeightKg: 78.0, currentMedication: "Furosemide 40 mg", preferredPhoneNumber: "+440000000000", preferredChannel: "whatsapp", fictional: true };
export const arthurWeightReadings: WeightReading[] = [77.8, 78.1, 78.0, 78.2, 78.4, 79.1, 80.2].map((valueKg, index) => ({ id: `weight-arthur-${index + 1}`, patientId: arthurPendleton.id, valueKg, source: "seed", recordedAt: `2026-07-${String(11 + index).padStart(2, "0")}T08:00:00.000Z` }));
const arthurEventTypes: AuraCareEventType[] = [
  "message.received", "scale_image.received", "weight.extraction_completed", "weight.confirmed", "call.permission_granted", "call.started", "analysis.completed", "alert.created"
];
export const arthurTimeline: AuraCareEvent[] = arthurEventTypes.map((type, index) => ({ id: `event-arthur-${index + 1}`, type, patientId: arthurPendleton.id, occurredAt: `2026-07-18T09:0${index}:00.000Z`, payload: { fictional: true } }));
