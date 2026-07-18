import { describe, expect, it } from "vitest";
import { getEmergencyGuidance, safetyBranchMessage, type SafetyBranch } from "./emergency";

describe("safety branches", () => {
  it("configures emergency wording by region without claiming services were contacted", () => {
    expect(getEmergencyGuidance("UK")).toContain("999");
    expect(getEmergencyGuidance("US")).toContain("911");
    expect(getEmergencyGuidance("UK")).toContain("has not contacted emergency services");
  });

  it("covers required safety branches", () => {
    const branches: SafetyBranch[] = ["severe_breathing_difficulty", "chest_pain", "fainting", "patient_emergency", "human_requested", "consent_withdrawn", "unknown_patient", "uncertain_image", "failed_call", "missing_clinician_review"];
    expect(branches.map((branch) => safetyBranchMessage(branch, "UK")).every((message) => message.length > 20)).toBe(true);
  });
});
