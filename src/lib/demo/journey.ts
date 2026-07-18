import type { AuraCareEvent, AuraCareEventType, Patient, WeightReading } from "@/lib/domain/types";
import { arthurPendleton, arthurTimeline, arthurWeightReadings } from "./arthur";

export type DemoStep =
  | "receive_scale_image"
  | "complete_weight_extraction"
  | "confirm_weight"
  | "grant_call_permission"
  | "start_call"
  | "record_breathlessness_answer"
  | "record_swelling_answer"
  | "record_dizziness_answer"
  | "complete_risk_analysis"
  | "create_clinician_alert"
  | "approve_simulated_intervention";

export type StatusTone = "green" | "amber" | "red" | "blue";

export interface ConversationPreviewMessage {
  id: string;
  direction: "inbound" | "outbound";
  body: string;
  at: string;
}

export interface EvidenceItem {
  id: string;
  label: string;
  value: string;
  detail: string;
}

export interface ArthurDemoState {
  patient: Patient;
  weights: WeightReading[];
  events: AuraCareEvent[];
  monitoringStatus: { label: string; tone: StatusTone; detail: string };
  callStatus: { label: string; tone: StatusTone; detail: string };
  riskStatus: { label: string; tone: StatusTone; detail: string };
  conversation: ConversationPreviewMessage[];
  evidence: EvidenceItem[];
  nextRecommendedStep?: DemoStep;
}

const scriptedEvents: Record<DemoStep, Omit<AuraCareEvent, "id" | "patientId" | "occurredAt"> & { label: string }> = {
  receive_scale_image: { type: "scale_image.received", label: "Receive scale image", payload: { mediaAssetId: "media-arthur-scale-2026-07-18", providerMediaId: "mock-whatsapp-media-scale", mimeType: "image/jpeg" } },
  complete_weight_extraction: { type: "weight.extraction_completed", label: "Complete weight extraction", payload: { status: "success", value: 79.8, unit: "kg", confidence: 0.96, summary: "Mock vision detected 79.8 kg; confirmation required." } },
  confirm_weight: { type: "weight.confirmed", label: "Confirm weight", payload: { confirmedWeightKg: 79.8 } },
  grant_call_permission: { type: "call.permission_granted", label: "Grant call permission", payload: { permission: "granted" } },
  start_call: { type: "call.started", label: "Start call", payload: { callSessionId: "call-arthur-scripted" } },
  record_breathlessness_answer: { type: "call.response_received", label: "Record breathlessness answer", payload: { question: "Breathlessness", transcript: "More short of breath walking to the kitchen this morning." } },
  record_swelling_answer: { type: "call.response_received", label: "Record swelling answer", payload: { question: "Swelling", transcript: "Ankles look puffier than usual." } },
  record_dizziness_answer: { type: "call.response_received", label: "Record dizziness answer", payload: { question: "Dizziness", transcript: "No dizziness or chest pain reported in the scripted answer." } },
  complete_risk_analysis: { type: "analysis.completed", label: "Complete risk analysis", payload: { label: "possible_deterioration_signal", score: 0.68, summary: "Demo risk assessment. Requires clinician review." } },
  create_clinician_alert: { type: "alert.created", label: "Create clinician alert", payload: { title: "Possible deterioration signal", status: "new" } },
  approve_simulated_intervention: { type: "intervention.recorded", label: "Approve simulated intervention", payload: { note: "Simulated recommendation approved for demo follow-up. Clinician decision required." } }
};

const stepOrder = Object.keys(scriptedEvents) as DemoStep[];

export function createDemoEvent(step: DemoStep, index: number): AuraCareEvent {
  const event = scriptedEvents[step];
  return {
    id: `demo-${String(index + 1).padStart(2, "0")}-${event.type}`,
    type: event.type,
    patientId: arthurPendleton.id,
    occurredAt: `2026-07-18T10:${String(index).padStart(2, "0")}:00.000Z`,
    payload: event.payload
  };
}

export function getSeededArthurState(): ArthurDemoState {
  return reduceArthurEvents([]);
}

export function reduceArthurEvents(events: AuraCareEvent[]): ArthurDemoState {
  const allEvents = [...arthurTimeline, ...events];
  const has = (type: AuraCareEventType) => allEvents.some((event) => event.type === type);
  const responses = allEvents.filter((event) => event.type === "call.response_received");
  const latestEvent = allEvents.at(-1);
  const confirmedWeight = allEvents.find((event) => event.type === "weight.confirmed")?.payload.confirmedWeightKg;

  const weights = typeof confirmedWeight === "number"
    ? [...arthurWeightReadings.slice(0, -1), { id: "weight-arthur-confirmed", patientId: arthurPendleton.id, valueKg: confirmedWeight, source: "patient_confirmed" as const, recordedAt: "2026-07-18T10:02:00.000Z" }]
    : arthurWeightReadings;

  const monitoringStatus = has("alert.created")
    ? { label: "Requires clinician review", tone: "amber" as const, detail: "Possible deterioration signal is queued for review." }
    : { label: "Stable demo baseline", tone: "green" as const, detail: "Arthur initially appears stable against seeded data." };

  const callStatus = has("call.started")
    ? { label: responses.length >= 3 ? "Assessment complete" : "Call in progress", tone: "blue" as const, detail: `${responses.length}/3 scripted answers recorded.` }
    : has("call.permission_granted")
      ? { label: "Permission granted", tone: "green" as const, detail: "Ready to start scripted voice assessment." }
      : { label: "Not requested", tone: "green" as const, detail: "No live call provider is connected in mock mode." };

  const riskStatus = has("analysis.completed")
    ? { label: "Demo risk assessment: Possible deterioration signal", tone: "red" as const, detail: "Requires clinician review. Not a validated clinical prediction." }
    : { label: "No active alert", tone: "green" as const, detail: "No demo risk assessment has been completed in this run." };

  const conversation = deriveConversation(allEvents);
  const evidence = deriveEvidence(allEvents, weights);
  const nextRecommendedStep = stepOrder.find((step) => !events.some((event) => event.id.includes(scriptedEvents[step].type)));

  return { patient: arthurPendleton, weights, events: allEvents, monitoringStatus, callStatus, riskStatus, conversation, evidence, nextRecommendedStep };
}

function deriveConversation(events: AuraCareEvent[]): ConversationPreviewMessage[] {
  const messages: ConversationPreviewMessage[] = [
    { id: "seed-message-1", direction: "outbound", body: "Good morning Arthur, please send today’s scale photo when ready.", at: "2026-07-18T08:58:00.000Z" }
  ];
  if (events.some((event) => event.type === "scale_image.received")) messages.push({ id: "message-image", direction: "inbound", body: "[Scale image received]", at: "2026-07-18T10:00:00.000Z" });
  if (events.some((event) => event.type === "weight.extraction_completed")) messages.push({ id: "message-confirm", direction: "outbound", body: "I read your scale as 79.8 kg. Is that correct?", at: "2026-07-18T10:01:00.000Z" });
  if (events.some((event) => event.type === "weight.confirmed")) messages.push({ id: "message-confirmed", direction: "inbound", body: "Yes, that is correct.", at: "2026-07-18T10:02:00.000Z" });
  if (events.some((event) => event.type === "intervention.recorded")) messages.push({ id: "message-follow-up", direction: "outbound", body: "A clinician has reviewed your demo case. Please continue with your usual care plan.", at: "2026-07-18T10:10:00.000Z" });
  return messages;
}

function deriveEvidence(events: AuraCareEvent[], weights: WeightReading[]): EvidenceItem[] {
  const latestWeight = weights.at(-1)?.valueKg.toFixed(1) ?? "—";
  const items: EvidenceItem[] = [{ id: "weight", label: "Latest weight", value: `${latestWeight} kg`, detail: "Compared with fictional dry weight of 78.0 kg." }];
  const extraction = events.find((event) => event.type === "weight.extraction_completed");
  if (extraction) items.push({ id: "extraction", label: "Weight extraction", value: `${extraction.payload.value ?? "—"} ${extraction.payload.unit ?? ""}`, detail: "Mock image reading; patient confirmation required." });
  const responseCount = events.filter((event) => event.type === "call.response_received").length;
  if (responseCount > 0) items.push({ id: "responses", label: "Voice responses", value: `${responseCount}/3`, detail: "Scripted assessment answers captured." });
  if (events.some((event) => event.type === "analysis.completed")) items.push({ id: "risk", label: "Analysis", value: "Possible deterioration signal", detail: "Demo risk assessment. Requires clinician review." });
  if (events.some((event) => event.type === "intervention.recorded")) items.push({ id: "intervention", label: "Intervention", value: "Simulated recommendation", detail: "Clinician decision required before follow-up." });
  return items;
}

export function appendDemoStep(events: AuraCareEvent[], step: DemoStep): AuraCareEvent[] {
  return [...events, createDemoEvent(step, events.length)];
}

export function resetDemoEvents(): AuraCareEvent[] {
  return [];
}

export const demoControls = stepOrder.map((step) => ({ step, label: scriptedEvents[step].label }));
