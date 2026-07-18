import { describe, expect, it } from "vitest";
import { appendDemoStep, getSeededArthurState, reduceArthurEvents, resetDemoEvents } from "./journey";

describe("Arthur demo journey", () => {
  it("starts from the stable seeded baseline", () => {
    const state = getSeededArthurState();
    expect(state.patient.id).toBe("patient-arthur-pendleton");
    expect(state.weights).toHaveLength(7);
    expect(state.monitoringStatus.label).toBe("Stable demo baseline");
    expect(state.riskStatus.label).toBe("No active alert");
  });

  it("derives screen state from append-only events", () => {
    const events = ["receive_scale_image", "complete_weight_extraction", "confirm_weight", "grant_call_permission", "start_call", "record_breathlessness_answer", "record_swelling_answer", "record_dizziness_answer", "complete_risk_analysis", "create_clinician_alert"] as const;
    const appended = events.reduce((current, step) => appendDemoStep(current, step), resetDemoEvents());
    const state = reduceArthurEvents(appended);

    expect(appended).toHaveLength(events.length);
    expect(state.weights.at(-1)?.source).toBe("patient_confirmed");
    expect(state.callStatus.label).toBe("Assessment complete");
    expect(state.riskStatus.label).toContain("Possible deterioration signal");
    expect(state.monitoringStatus.label).toBe("Requires clinician review");
  });

  it("resets to the exact seeded state", () => {
    const advanced = appendDemoStep(appendDemoStep(resetDemoEvents(), "receive_scale_image"), "complete_weight_extraction");
    expect(reduceArthurEvents(advanced).conversation).toHaveLength(3);

    const reset = resetDemoEvents();
    expect(reduceArthurEvents(reset)).toEqual(getSeededArthurState());
  });
});
