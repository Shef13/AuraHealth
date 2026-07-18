export type SafetyBranch = "severe_breathing_difficulty" | "chest_pain" | "fainting" | "patient_emergency" | "human_requested" | "consent_withdrawn" | "unknown_patient" | "uncertain_image" | "failed_call" | "missing_clinician_review";

const guidanceByRegion = {
  UK: "If this feels urgent, use your local emergency route now, such as calling 999 in the UK. AuraCare has not contacted emergency services in this demo.",
  US: "If this feels urgent, use your local emergency route now, such as calling 911 in the US. AuraCare has not contacted emergency services in this demo.",
  default: "If this feels urgent, use your local emergency route now. AuraCare has not contacted emergency services in this demo."
};

export function getEmergencyGuidance(region = process.env.AURACARE_REGION ?? "UK"): string { return guidanceByRegion[region as keyof typeof guidanceByRegion] ?? guidanceByRegion.default; }

export function safetyBranchMessage(branch: SafetyBranch, region?: string): string {
  if (branch === "severe_breathing_difficulty" || branch === "chest_pain" || branch === "fainting" || branch === "patient_emergency") return getEmergencyGuidance(region);
  const messages: Record<Exclude<SafetyBranch, "severe_breathing_difficulty" | "chest_pain" | "fainting" | "patient_emergency">, string> = {
    human_requested: "I’ll stop the routine demo assessment and flag that a human care-team review is requested.",
    consent_withdrawn: "I’ve recorded the opt-out for the demo. Non-essential messages will stop and the care team review route is shown.",
    unknown_patient: "I could not match this number to a registered demo patient. Please contact the demo support team.",
    uncertain_image: "I could not read the scale confidently. Please send another photo or enter the weight manually.",
    failed_call: "The demo call did not connect. You can retry or ask for clinician contact.",
    missing_clinician_review: "Clinician decision required before any simulated recommendation or follow-up is treated as reviewed."
  };
  return messages[branch];
}
