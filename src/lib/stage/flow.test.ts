import { describe, expect, it } from "vitest";
import { reduceArthurEvents } from "@/lib/demo/journey";
import { advanceOneStep, copyDiagnosticSummary, resetStageDemo, skipCall, switchToBackupSimulation } from "./flow";

describe("stage demo flow", () => {
  it("completes the simulated Arthur intercept journey deterministically", () => {
    let events = resetStageDemo();
    for (let index = 0; index < 11; index += 1) events = advanceOneStep(events);
    const state = reduceArthurEvents(events);
    expect(state.evidence.some((item) => item.label === "Intervention")).toBe(true);
    expect(state.riskStatus.label).toContain("Possible deterioration signal");
  });

  it("supports reset, skip-call recovery and backup simulation", () => {
    expect(resetStageDemo()).toHaveLength(0);
    expect(skipCall([]).some((event) => event.type === "call.started")).toBe(true);
    expect(switchToBackupSimulation().mode).toBe("backup_simulation");
    expect(copyDiagnosticSummary({ mode: "fully_simulated", providerStatus: "ready" })).toContain("mode=fully_simulated");
  });
});
