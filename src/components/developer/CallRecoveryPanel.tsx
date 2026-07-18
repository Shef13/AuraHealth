"use client";

import { useState } from "react";

type Action = "request_permission" | "call_now" | "call_in_30_minutes" | "contact_care_team" | "severe_symptoms";
const actions: Array<{ id: Action; label: string }> = [
  { id: "request_permission", label: "Ask call permission" },
  { id: "call_now", label: "Call me now" },
  { id: "call_in_30_minutes", label: "Call in 30 minutes" },
  { id: "contact_care_team", label: "Contact care team" },
  { id: "severe_symptoms", label: "Severe symptoms branch" }
];

export function CallRecoveryPanel() {
  const [result, setResult] = useState("No call action sent yet.");
  async function send(action: Action) {
    const response = await fetch("/api/workflows/call", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) });
    setResult(`${response.status}: ${await response.text()}`);
  }
  return <section className="rounded-[2rem] border-2 border-dashed border-rose-200 bg-rose-50 p-8">
    <p className="text-base font-semibold uppercase tracking-[0.18em] text-rose-900">Subtle recovery control</p>
    <h2 className="mt-1 text-3xl font-semibold">Call orchestration</h2>
    <p className="mt-2 text-slate-700">Stage-only controls for permission, deterministic mock calls, care-team routing, and severe-symptom bypass.</p>
    <div className="mt-5 grid gap-3 md:grid-cols-3">{actions.map((action) => <button key={action.id} className="rounded-2xl bg-white px-5 py-4 text-left font-semibold shadow-sm" onClick={() => send(action.id)}>{action.label}</button>)}</div>
    <output className="mt-5 block rounded-2xl bg-white p-4" aria-live="polite">{result}</output>
  </section>;
}
