import { describe, expect, it } from "vitest";
import { operatorModeLabel } from "./modes";
import { readinessReport } from "./diagnostics";

describe("stage diagnostics", () => {
  it("keeps fully simulated mode offline-ready", () => {
    const report = readinessReport({ AURACARE_DEMO_MODE: "fully_simulated", MESSAGING_PROVIDER: "mock", VOICE_PROVIDER: "mock" });
    expect(report.ok).toBe(true);
    expect(report.safety).toContain("Demonstration only");
  });

  it("labels backup simulation for the operator", () => {
    expect(operatorModeLabel("backup_simulation")).toContain("Backup simulation active");
  });
});
