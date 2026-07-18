import type { AuraCareEvent } from "@/lib/domain/types";
import { appendDemoStep, demoControls, resetDemoEvents, type DemoStep } from "@/lib/demo/journey";

export type OperatorAction = "reset" | "advance_one_step" | "retry_failed_step" | "skip_call" | "replay_analysis" | "reconnect_dashboard" | "restore_arthur_seed" | "switch_to_backup_simulation" | "copy_diagnostic_summary";
export const stageDemoSteps = demoControls.map((control) => control.step);

export function advanceOneStep(events: AuraCareEvent[]): AuraCareEvent[] {
  const next = stageDemoSteps.find((step) => !events.some((event) => event.id.includes(stepEventType(step))));
  return next ? appendDemoStep(events, next) : events;
}
export function resetStageDemo(): AuraCareEvent[] { return resetDemoEvents(); }
export function skipCall(events: AuraCareEvent[]): AuraCareEvent[] { return events.some((event) => event.type === "call.started") ? events : appendDemoStep(appendDemoStep(events, "grant_call_permission"), "start_call"); }
export function switchToBackupSimulation(): { mode: "backup_simulation"; warning: string } { return { mode: "backup_simulation", warning: "Backup simulation active because a provider is unavailable; this is labelled and is not a false success." }; }

export function copyDiagnosticSummary(input: { mode: string; lastEventId?: string; providerStatus: string }): string {
  return `AuraCare demo diagnostics | mode=${input.mode} | lastEvent=${input.lastEventId ?? "none"} | providers=${input.providerStatus}`;
}

function stepEventType(step: DemoStep): string {
  const map: Record<DemoStep, string> = { receive_scale_image: "scale_image.received", complete_weight_extraction: "weight.extraction_completed", confirm_weight: "weight.confirmed", grant_call_permission: "call.permission_granted", start_call: "call.started", record_breathlessness_answer: "call.response_received", record_swelling_answer: "call.response_received", record_dizziness_answer: "call.response_received", complete_risk_analysis: "analysis.completed", create_clinician_alert: "alert.created", approve_simulated_intervention: "intervention.recorded" };
  return map[step];
}
