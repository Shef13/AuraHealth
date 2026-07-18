import { describe, expect, it } from "vitest";
import { arthurPendleton } from "@/lib/demo/arthur";
import { canSendMessage, getConsentState, hasConsent, recordConsent, resetConsentState } from "./consent";
import { getAuditEvents, resetAuditEvents } from "./audit";

describe("consent governance", () => {
  it("keeps optional voice research separate from required service consent", () => {
    resetConsentState();
    expect(hasConsent(arthurPendleton.id, "whatsapp_communication")).toBe(true);
    expect(hasConsent(arthurPendleton.id, "voice_feature_research")).toBe(false);
    expect(getConsentState(arthurPendleton.id).find((record) => record.kind === "voice_feature_research")?.required).toBe(false);
  });

  it("opt-out prevents non-essential and follow-up messaging", () => {
    resetConsentState(); resetAuditEvents();
    recordConsent({ patientId: arthurPendleton.id, kind: "whatsapp_communication", status: "withdrawn", actor: "patient", source: "whatsapp", requestOrCorrelationId: "req-opt-out", now: () => "2026-07-18T10:00:00.000Z" });
    expect(canSendMessage(arthurPendleton.id, "research").allowed).toBe(false);
    expect(canSendMessage(arthurPendleton.id, "follow_up").allowed).toBe(false);
    const audit = getAuditEvents(arthurPendleton.id).at(-1);
    expect(audit?.action).toBe("consent.withdrawn");
    expect(audit?.requestOrCorrelationId).toBe("req-opt-out");
  });
});
