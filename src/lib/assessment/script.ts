import type { AssessmentQuestionScript } from "./types";

export const auraAssessmentScript: AssessmentQuestionScript[] = [
  { id: "consent", prompt: "Good morning, Arthur. I noticed your weight has increased. Do you have a minute for a quick check-in?" },
  { id: "medication_taken", prompt: "Have you taken your water tablet today?" },
  { id: "salty_meal", prompt: "Did you have a particularly salty meal yesterday?" },
  { id: "breathlessness", prompt: "Have you felt more breathless than usual today?", confirmsHighImpact: true },
  { id: "extra_pillows", prompt: "Did you need extra pillows to sleep comfortably last night?", confirmsHighImpact: true },
  { id: "emergency_symptoms", prompt: "Do you have chest pain, severe difficulty breathing, feel faint, or feel that this is an emergency?", confirmsHighImpact: true }
];

export const deterministicArthurAnswers: Record<string, string> = {
  consent: "yes",
  medication_taken: "yes",
  salty_meal: "no",
  breathlessness: "a little more than usual",
  extra_pillows: "two",
  emergency_symptoms: "no"
};
