import { describe, expect, it } from "vitest";
import { answerAssessmentQuestion, advanceScriptedAssessment, startAssessment } from "./service";
import { createMemoryAssessmentStore } from "./store";

function scriptedSession() {
  const store = createMemoryAssessmentStore();
  const started = startAssessment({ patientId: "patient-arthur-pendleton", callId: "call-test", store, now: () => "2026-07-18T12:00:00.000Z" });
  return { store, sessionId: started.session.id };
}

describe("Aura voice assessment", () => {
  it("completes the full deterministic scripted assessment", () => {
    const { store, sessionId } = scriptedSession();
    let result = advanceScriptedAssessment({ sessionId, store });
    for (let index = 0; index < 5; index += 1) result = advanceScriptedAssessment({ sessionId, store });
    expect(result.session.status).toBe("completed");
    expect(result.session.responses).toHaveLength(6);
    expect(result.session.responses[3]?.normalisedAnswer).toBe("mild");
    expect(result.session.responses[4]?.normalisedAnswer).toBe("moderate");
  });

  it("asks for clarification for unclear answers", () => {
    const { store, sessionId } = scriptedSession();
    const result = answerAssessmentQuestion({ sessionId, rawTranscript: "maybe repeat", store });
    expect(result.session.status).toBe("needs_clarification");
    expect(result.response?.requiresClarification).toBe(true);
  });

  it("stops ordinary flow on emergency symptoms", () => {
    const { store, sessionId } = scriptedSession();
    const result = answerAssessmentQuestion({ sessionId, rawTranscript: "I have chest pain and severe difficulty breathing", store });
    expect(result.session.status).toBe("emergency_escalated");
    expect(result.events.map((event) => event.type)).toContain("emergency.escalated");
  });

  it("ends safely when the patient asks to stop", () => {
    const { store, sessionId } = scriptedSession();
    const result = answerAssessmentQuestion({ sessionId, rawTranscript: "please stop", store });
    expect(result.session.status).toBe("stopped");
    expect(result.spokenText).toContain("stop the demo check-in");
  });
});
