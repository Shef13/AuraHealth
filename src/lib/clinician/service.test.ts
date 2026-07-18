import { describe, expect, it } from "vitest";
import { arthurPendleton } from "@/lib/demo/arthur";
import { createMemoryClinicianStore } from "./store";
import { demoClinician, getArthurQueueRow, recordClinicianAction, safeFollowUpMessage } from "./service";

describe("clinician workflow", () => {
  it("places Arthur in immediate review", () => {
    const row = getArthurQueueRow(createMemoryClinicianStore());
    expect(row.group).toBe("Immediate review");
    expect(row.riskCategory).toBe("high");
  });

  it("acknowledges an alert with attributed audit", () => {
    const store = createMemoryClinicianStore();
    const result = recordClinicianAction({ patientId: arthurPendleton.id, action: "acknowledge_alert", user: demoClinician, store, now: () => "2026-07-18T13:00:00.000Z" });
    expect(result.state.acknowledged).toBe(true);
    expect(result.auditEvent.actor).toBe("clinician");
    expect(result.action.user.id).toBe(demoClinician.id);
  });

  it("records simulated intervention without prescribing", () => {
    const result = recordClinicianAction({ patientId: arthurPendleton.id, action: "record_simulated_intervention", user: demoClinician, store: createMemoryClinicianStore() });
    expect(result.action.note).toContain("recorded externally");
  });

  it("schedules safe follow-up", () => {
    const result = recordClinicianAction({ patientId: arthurPendleton.id, action: "schedule_follow_up", user: demoClinician, store: createMemoryClinicianStore() });
    expect(result.followUp?.message).toBe(safeFollowUpMessage);
    expect(result.patientMessage).toBe(safeFollowUpMessage);
  });

  it("moves resolved cases out of immediate review", () => {
    const store = createMemoryClinicianStore();
    recordClinicianAction({ patientId: arthurPendleton.id, action: "mark_resolved", user: demoClinician, store });
    expect(getArthurQueueRow(store).group).toBe("Resolved");
  });
});
