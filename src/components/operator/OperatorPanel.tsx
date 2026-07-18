"use client";

import { useMemo, useState } from "react";
import type { AuraCareEvent } from "@/lib/domain/types";
import { advanceOneStep, copyDiagnosticSummary, resetStageDemo, skipCall, switchToBackupSimulation, type OperatorAction } from "@/lib/stage/flow";
import { operatorModeLabel, type DemoMode } from "@/lib/stage/modes";

const actions: Array<{ id: OperatorAction; label: string; detail: string }> = [
  { id: "reset", label: "Reset", detail: "Clear staged events." },
  { id: "advance_one_step", label: "Advance one step", detail: "Move through Arthur’s scripted flow." },
  { id: "retry_failed_step", label: "Retry failed step", detail: "Keep state and show retry intent." },
  { id: "skip_call", label: "Skip call", detail: "Use when voice provider is unavailable." },
  { id: "replay_analysis", label: "Replay analysis", detail: "Refresh dashboard event stream." },
  { id: "reconnect_dashboard", label: "Reconnect dashboard", detail: "Prompt SSE reconnection." },
  { id: "restore_arthur_seed", label: "Restore Arthur seed", detail: "Return to baseline." },
  { id: "switch_to_backup_simulation", label: "Switch to backup simulation", detail: "Clearly label backup mode." },
  { id: "copy_diagnostic_summary", label: "Copy diagnostic summary", detail: "Copy safe stage diagnostics." }
];

export function OperatorPanel({ initialMode }: { initialMode: DemoMode }) {
  const [mode, setMode] = useState<DemoMode>(initialMode);
  const [events, setEvents] = useState<AuraCareEvent[]>([]);
  const [message, setMessage] = useState("Operator controls ready. Mode is visible here only.");
  const summary = useMemo(() => copyDiagnosticSummary({ mode, lastEventId: events.at(-1)?.id, providerStatus: "local diagnostics ready" }), [mode, events]);

  function run(action: OperatorAction) {
    if (action === "reset" || action === "restore_arthur_seed") { setEvents(resetStageDemo()); setMessage("Arthur seed restored; fully simulated flow is ready."); return; }
    if (action === "advance_one_step") { setEvents((current) => advanceOneStep(current)); setMessage("Advanced one deterministic step."); return; }
    if (action === "skip_call") { setEvents((current) => skipCall(current)); setMessage("Call skipped with labelled operator recovery; no false success shown."); return; }
    if (action === "switch_to_backup_simulation") { const backup = switchToBackupSimulation(); setMode(backup.mode); setMessage(backup.warning); return; }
    if (action === "copy_diagnostic_summary") { void navigator.clipboard?.writeText(summary); setMessage(summary); return; }
    setMessage(`${action.replaceAll("_", " ")} requested; visible to operator only.`);
  }

  return <section className="rounded-[2rem] border-2 border-dashed border-slate-300 bg-white p-8 shadow-soft" aria-label="Protected operator panel">
    <p className="text-base font-semibold uppercase tracking-[0.18em] text-aura">Protected operator panel</p>
    <div className="mt-2 flex flex-wrap items-center justify-between gap-4"><h2 className="text-3xl font-semibold">Stage recovery controls</h2><span className="rounded-full bg-slate-100 px-4 py-2 font-semibold">{operatorModeLabel(mode)}</span></div>
    <p className="mt-3 text-slate-700">Use only off the pitch screen. Backup simulation is explicitly labelled if a provider is unavailable.</p>
    <div className="mt-6 grid gap-3 md:grid-cols-3">{actions.map((action) => <button key={action.id} className="rounded-2xl border border-slate-200 p-4 text-left font-semibold focus:outline-none focus:ring-4 focus:ring-blue-200" onClick={() => run(action.id)}>{action.label}<span className="mt-1 block text-sm font-normal text-slate-600">{action.detail}</span></button>)}</div>
    <output className="mt-5 block rounded-2xl bg-slate-50 p-4" aria-live="polite">{message}</output>
  </section>;
}
