import type { AuraCareEvent } from "@/lib/domain/types";
import { demoRiskRulesV1 } from "./config";
import type { DemoRiskSignal, RiskContributor, RiskEngineInput } from "./types";

const safetyStatement = "Demonstration only. Not for diagnosis, prescribing or emergency use." as const;
const criticalQuestions = ["medication_taken", "salty_meal", "breathlessness", "extra_pillows", "emergency_symptoms"];

export function calculateDemoRiskSignal(input: RiskEngineInput): DemoRiskSignal {
  const config = input.config ?? demoRiskRulesV1;
  const events = input.events.filter((event) => event.patientId === input.patientId);
  const contributors: RiskContributor[] = [];
  const excludedReasons: string[] = [];
  const emergency = responseFor(events, "emergency_symptoms");
  if (emergency?.payload.emergencySignal === true || emergency?.payload.normalisedAnswer === "severe") {
    return { name: "Demo deterioration risk signal", ruleSetVersion: config.version, category: "emergency_review", riskScore: 100, dataCompleteness: completeness(events, config), ruleConfidence: 100, requiresClinicianReview: true, emergencyReview: true, contributors: [{ code: "emergency_symptoms", label: "Emergency symptoms reported", direction: "increase", contribution: 100, evidenceEventIds: [emergency.id] }], excludedReasons, sourceEventIds: [emergency.id], safetyStatement };
  }

  const confirmedWeight = events.find((event) => event.type === "weight.confirmed");
  const extraction = events.find((event) => event.type === "weight.extraction_completed");
  const extractionConfidence = typeof extraction?.payload.confidence === "number" ? extraction.payload.confidence : 0;
  const confirmedKg = numeric(confirmedWeight?.payload.valueKg) ?? numeric(confirmedWeight?.payload.confirmedWeightKg);
  if (confirmedWeight && confirmedKg !== undefined && extractionConfidence >= config.extractionConfidenceMinimum) {
    const change = round(confirmedKg - input.dryWeightKg);
    if (change >= 1.5) contributors.push({ code: "confirmed_weight_gain_1_5kg", label: `Confirmed +${change.toFixed(1)} kg weight increase`, direction: "increase", contribution: config.weights.confirmed_weight_gain_1_5kg, evidenceEventIds: [confirmedWeight.id, extraction?.id].filter(Boolean) as string[] });
  } else if (confirmedWeight) excludedReasons.push("Weight confirmation present but extraction confidence was too low for weight contribution.");
  else if (extraction) excludedReasons.push("Candidate weight was not confirmed, so it was excluded from scoring.");

  addAnswerContributor(events, contributors, "breathlessness", "mild", { code: "breathlessness_mild", label: "Increased breathlessness", direction: "increase", contribution: config.weights.breathlessness_mild });
  addAnswerContributor(events, contributors, "extra_pillows", "moderate", { code: "orthopnoea_two_pillows", label: "Two extra pillows required", direction: "increase", contribution: config.weights.orthopnoea_two_pillows });
  addAnswerContributor(events, contributors, "medication_taken", "yes", { code: "medication_taken", label: "Medication reported as taken", direction: "decrease", contribution: config.weights.medication_taken });
  addAnswerContributor(events, contributors, "salty_meal", "no", { code: "no_salty_meal", label: "High-sodium meal not reported", direction: "decrease", contribution: config.weights.no_salty_meal });

  for (const questionId of criticalQuestions) if (!responseFor(events, questionId)) excludedReasons.push(`Missing structured answer: ${questionId}.`);
  const riskScore = clamp(config.baseScore + contributors.reduce((sum, item) => sum + item.contribution, 0));
  return { name: "Demo deterioration risk signal", ruleSetVersion: config.version, category: riskScore >= config.highThreshold ? "high" : riskScore >= config.mediumThreshold ? "medium" : "low", riskScore, dataCompleteness: completeness(events, config), ruleConfidence: completeness(events, config), requiresClinicianReview: riskScore >= config.mediumThreshold, emergencyReview: false, contributors, excludedReasons, sourceEventIds: contributors.flatMap((item) => item.evidenceEventIds), safetyStatement };
}

function addAnswerContributor(events: AuraCareEvent[], contributors: RiskContributor[], questionId: string, answer: string, item: Omit<RiskContributor, "evidenceEventIds">) {
  const event = responseFor(events, questionId);
  if (event?.payload.normalisedAnswer === answer) contributors.push({ ...item, evidenceEventIds: [event.id] });
}
function responseFor(events: AuraCareEvent[], questionId: string) { return events.find((event) => event.type === "call.response_received" && event.payload.questionId === questionId); }
function numeric(value: unknown): number | undefined { return typeof value === "number" ? value : undefined; }
function completeness(events: AuraCareEvent[], config = demoRiskRulesV1): number { const available = criticalQuestions.filter((question) => responseFor(events, question)).length + (events.some((event) => event.type === "weight.confirmed") ? 1 : 0); return Math.round((available / (criticalQuestions.length + 1)) * config.completenessCap); }
function clamp(value: number) { return Math.max(0, Math.min(100, Math.round(value))); }
function round(value: number) { return Math.round(value * 10) / 10; }
