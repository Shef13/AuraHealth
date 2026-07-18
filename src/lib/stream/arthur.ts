import type { AnalysisStreamEvent } from "./types";

const titles = [
  ["intake", "Scale image received", "Arthur’s WhatsApp scale photo was normalised."],
  ["extraction", "Weight extraction started", "Image metadata queued; raw provider payloads are not streamed."],
  ["extraction", "Candidate weight detected", "79.8 kg candidate; confirmation required."],
  ["confirmation", "Weight confirmed", "Arthur confirmed 79.8 kg."],
  ["confirmation", "Weight trend calculated", "+1.8 kg against fictional dry weight over 48 hours."],
  ["call", "Call permission granted", "Arthur selected call now."],
  ["call", "Call answered", "Mock call status changed to answered."],
  ["assessment", "Medication adherence confirmed", "Arthur reported taking his water tablet today."],
  ["assessment", "Dietary trigger not identified", "Arthur reported no particularly salty meal yesterday."],
  ["assessment", "Breathlessness reported", "Arthur reported a little more breathlessness than usual."],
  ["assessment", "Orthopnoea reported", "Arthur reported two pillows last night."],
  ["assessment", "Emergency symptoms not reported", "Arthur did not report emergency symptoms in the script."],
  ["analysis", "Evidence being combined", "Weight trend and guided assessment responses are being summarised."],
  ["analysis", "Demo risk assessment complete", "Possible deterioration signal. Requires clinician review."],
  ["review", "Clinician review required", "Case is ready for the demo clinician queue."]
] as const;

export const arthurAnalysisReplayEvents: AnalysisStreamEvent[] = titles.map(([stage, title, detail], index) => ({ id: `arthur-stream-${String(index + 1).padStart(2, "0")}`, sequence: index + 1, patientId: "patient-arthur-pendleton", stage, title, detail, completed: index < titles.length - 1, clinicianSafe: true, demoRiskAssessment: true, occurredAt: `2026-07-18T12:${String(index).padStart(2, "0")}:00.000Z` }));
