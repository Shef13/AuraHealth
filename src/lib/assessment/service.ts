import type { AuraCareEvent } from "@/lib/domain/types";
import { emergencyGuidance } from "@/lib/calls/service";
import { assessmentStore, type AssessmentStore } from "./store";
import { auraAssessmentScript, deterministicArthurAnswers } from "./script";
import { validateAssessmentResponse } from "./schema";
import type { AssessmentSession, AssessmentTurnResult, StructuredAssessmentResponse } from "./types";

export function startAssessment(input: { patientId: string; callId: string; now?: () => string; store?: AssessmentStore }): AssessmentTurnResult {
  const now = input.now?.() ?? new Date().toISOString();
  const session: AssessmentSession = { id: `assessment-${input.callId}`, patientId: input.patientId, callId: input.callId, activeQuestionId: auraAssessmentScript[0]?.id, questionIndex: 0, status: "in_progress", responses: [], events: [], instructionsVersion: "aura-assessment-v1" };
  const question = auraAssessmentScript[0];
  const event = questionEvent(session, question.id, question.prompt, now);
  session.events = [event];
  (input.store ?? assessmentStore).save(session);
  return { session, question, events: [event], spokenText: question.prompt, completed: false };
}

export function advanceScriptedAssessment(input: { sessionId: string; now?: () => string; store?: AssessmentStore }): AssessmentTurnResult {
  const store = input.store ?? assessmentStore;
  const session = mustGetSession(input.sessionId, store);
  const question = auraAssessmentScript[session.questionIndex];
  return answerAssessmentQuestion({ sessionId: session.id, rawTranscript: deterministicArthurAnswers[question.id] ?? "I don't know", now: input.now, store });
}

export function answerAssessmentQuestion(input: { sessionId: string; rawTranscript: string; now?: () => string; store?: AssessmentStore }): AssessmentTurnResult {
  const store = input.store ?? assessmentStore;
  const session = mustGetSession(input.sessionId, store);
  const question = auraAssessmentScript[session.questionIndex];
  const now = input.now?.() ?? new Date().toISOString();
  if (!question || session.status === "completed" || session.status === "stopped" || session.status === "emergency_escalated" || session.status === "human_requested") return { session, events: [], spokenText: "The assessment has already ended.", completed: true };

  const response = validateAssessmentResponse(normaliseTranscript(question.id, input.rawTranscript));
  const responseEvent = responseToEvent(session, response, now);
  session.responses = [...session.responses, response];
  session.events = [...session.events, responseEvent];

  if (isStopRequest(input.rawTranscript)) return endSession(session, store, now, "stopped", "Of course. I’ll stop the demo check-in now. Please contact your care team if you are concerned.", [responseEvent]);
  if (isHumanRequest(input.rawTranscript)) return endSession(session, store, now, "human_requested", "Thanks, Arthur. I’ll add this to the clinician queue for the demo team.", [responseEvent, alertEvent(session, now, "Patient requested human care team")]);
  if (response.emergencySignal || response.normalisedAnswer === "severe") return endSession(session, store, now, "emergency_escalated", emergencyGuidance, [responseEvent, emergencyEvent(session, now)]);
  if (response.requiresClarification) { session.status = "needs_clarification"; store.save(session); return { session, response, events: [responseEvent], spokenText: `Sorry, I didn’t catch that. ${question.prompt}`, completed: false }; }

  const nextQuestion = auraAssessmentScript[session.questionIndex + 1];
  if (!nextQuestion) return endSession(session, store, now, "completed", "Thanks, Arthur. That’s the end of this demo check-in. A clinician review is still required.", [responseEvent]);
  session.questionIndex += 1;
  session.activeQuestionId = nextQuestion.id;
  session.status = "in_progress";
  const qEvent = questionEvent(session, nextQuestion.id, nextQuestion.prompt, now);
  session.events = [...session.events, qEvent];
  store.save(session);
  return { session, question: nextQuestion, response, events: [responseEvent, qEvent], spokenText: nextQuestion.prompt, completed: false };
}

function normaliseTranscript(questionId: string, rawTranscript: string): StructuredAssessmentResponse {
  const raw = rawTranscript.toLowerCase();
  const unclear = raw.trim().length === 0 || /maybe|unclear|pardon|repeat/.test(raw);
  const stop = isStopRequest(rawTranscript);
  const emergency = /chest pain|severe|emergency|faint|can't breathe|cannot breathe/.test(raw);
  let normalisedAnswer: StructuredAssessmentResponse["normalisedAnswer"] = "unknown";
  if (/\byes\b|taken|two|2/.test(raw)) normalisedAnswer = "yes";
  if (/\bno\b|none/.test(raw)) normalisedAnswer = "no";
  if (/little|slight|mild/.test(raw)) normalisedAnswer = "mild";
  if (/moderate/.test(raw)) normalisedAnswer = "moderate";
  if (emergency) normalisedAnswer = "severe";
  if (stop) normalisedAnswer = "not_applicable";
  if (questionId === "extra_pillows" && /two|2/.test(raw)) normalisedAnswer = "moderate";
  return { questionId, rawTranscript, normalisedAnswer, confidence: unclear ? 0.3 : 0.92, requiresClarification: unclear, emergencySignal: emergency };
}

function endSession(session: AssessmentSession, store: AssessmentStore, now: string, status: AssessmentSession["status"], spokenText: string, events: AuraCareEvent[]): AssessmentTurnResult {
  session.status = status; session.activeQuestionId = undefined;
  const finalEvent: AuraCareEvent = { id: `event-${session.id}-${status}-${now}`, type: "call.status_changed", patientId: session.patientId, occurredAt: now, payload: { callId: session.callId, status: status === "completed" ? "completed" : status } };
  session.events = [...session.events, ...events.filter((event) => !session.events.some((existing) => existing.id === event.id)), finalEvent];
  store.save(session);
  return { session, events: [...events, finalEvent], spokenText, completed: true };
}

function mustGetSession(id: string, store: AssessmentStore): AssessmentSession {
  const session = store.get(id);
  if (!session) throw new Error(`Assessment session not found: ${id}`);
  return session;
}
function isStopRequest(raw: string) { return /stop|hang up|end call/i.test(raw); }
function isHumanRequest(raw: string) { return /human|care team|clinician|nurse|doctor/i.test(raw); }
function questionEvent(session: AssessmentSession, questionId: string, prompt: string, now: string): AuraCareEvent { return { id: `event-${session.id}-${questionId}-asked`, type: "call.question_asked", patientId: session.patientId, occurredAt: now, payload: { callId: session.callId, assessmentId: session.id, questionId, prompt, instructionsVersion: session.instructionsVersion } }; }
function responseToEvent(session: AssessmentSession, response: StructuredAssessmentResponse, now: string): AuraCareEvent { return { id: `event-${session.id}-${response.questionId}-response-${session.responses.length + 1}`, type: "call.response_received", patientId: session.patientId, occurredAt: now, payload: { callId: session.callId, assessmentId: session.id, ...response } }; }
function emergencyEvent(session: AssessmentSession, now: string): AuraCareEvent { return { id: `event-${session.id}-emergency-${now}`, type: "emergency.escalated", patientId: session.patientId, occurredAt: now, payload: { guidance: emergencyGuidance, routineAssessmentBypassed: true, clinicianQueueNotified: true } }; }
function alertEvent(session: AssessmentSession, now: string, title: string): AuraCareEvent { return { id: `event-${session.id}-alert-${now}`, type: "alert.created", patientId: session.patientId, occurredAt: now, payload: { title, status: "new", requiresClinicianReview: true } }; }
