import { describe, expect, it } from "vitest";
import { arthurPendleton } from "@/lib/demo/arthur";
import { arthurRiskFixtureEvents } from "./arthurFixture";
import { calculateDemoRiskSignal } from "./engine";

const baseInput = { patientId: arthurPendleton.id, dryWeightKg: arthurPendleton.dryWeightKg, events: arthurRiskFixtureEvents };

describe("demo deterioration risk engine", () => {
  it("produces the deterministic Arthur fixture output", () => {
    const signal = calculateDemoRiskSignal(baseInput);
    expect(signal.name).toBe("Demo deterioration risk signal");
    expect(signal.category).toBe("high");
    expect(signal.riskScore).toBe(82);
    expect(signal.dataCompleteness).toBe(94);
    expect(signal.ruleConfidence).toBe(94);
    expect(signal.requiresClinicianReview).toBe(true);
  });

  it("is reproducible for identical inputs", () => {
    expect(calculateDemoRiskSignal(baseInput)).toEqual(calculateDemoRiskSignal(baseInput));
  });

  it("lowers completeness when critical answers are missing", () => {
    const signal = calculateDemoRiskSignal({ ...baseInput, events: arthurRiskFixtureEvents.filter((event) => event.id !== "risk-fixture-diet") });
    expect(signal.dataCompleteness).toBe(78);
    expect(signal.excludedReasons).toContain("Missing structured answer: salty_meal.");
  });

  it("uses emergency symptoms as an override", () => {
    const events = arthurRiskFixtureEvents.map((event) => event.id === "risk-fixture-emergency-no" ? { ...event, payload: { ...event.payload, normalisedAnswer: "severe", emergencySignal: true } } : event);
    const signal = calculateDemoRiskSignal({ ...baseInput, events });
    expect(signal.category).toBe("emergency_review");
    expect(signal.emergencyReview).toBe(true);
  });

  it("excludes unconfirmed or low-confidence weights", () => {
    const unconfirmed = calculateDemoRiskSignal({ ...baseInput, events: arthurRiskFixtureEvents.filter((event) => event.type !== "weight.confirmed") });
    const lowConfidence = calculateDemoRiskSignal({ ...baseInput, events: arthurRiskFixtureEvents.map((event) => event.type === "weight.extraction_completed" ? { ...event, payload: { ...event.payload, confidence: 0.4 } } : event) });
    expect(unconfirmed.contributors.some((item) => item.code === "confirmed_weight_gain_1_5kg")).toBe(false);
    expect(lowConfidence.contributors.some((item) => item.code === "confirmed_weight_gain_1_5kg")).toBe(false);
  });

  it("links every contributor to evidence events", () => {
    const signal = calculateDemoRiskSignal(baseInput);
    expect(signal.contributors.every((item) => item.evidenceEventIds.length > 0)).toBe(true);
  });
});
