"use client";

import { useState } from "react";
import { getArthurEvidenceReview, safeFollowUpMessage } from "@/lib/clinician/service";
import type { ClinicianActionType } from "@/lib/clinician/types";

const actions: Array<{ id: ClinicianActionType; label: string }> = [
  { id: "acknowledge_alert", label: "Acknowledge alert" }, { id: "request_repeat_weight", label: "Request repeat weight" }, { id: "arrange_clinician_call", label: "Arrange clinician call" }, { id: "record_simulated_intervention", label: "Record simulated intervention" }, { id: "schedule_follow_up", label: "Schedule follow-up" }, { id: "escalate_urgent_review", label: "Escalate urgent review" }, { id: "mark_resolved", label: "Mark resolved" }
];

export function EvidenceReview() {
  const review = getArthurEvidenceReview();
  const [result, setResult] = useState("No clinician action recorded yet.");
  async function send(action: ClinicianActionType) {
    const response = await fetch("/api/clinician/actions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ patientId: review.row.patientId, action }) });
    setResult(`${response.status}: ${await response.text()}`);
  }
  return <div className="space-y-6"><section className="rounded-[2rem] bg-white p-8 shadow-soft"><p className="text-base font-semibold uppercase tracking-[0.18em] text-aura">Focused evidence review</p><h1 className="mt-2 text-5xl font-semibold">{review.row.patientName}</h1><p className="mt-3 text-slate-600">{review.row.riskCategory} · {review.row.latestWeightChange} · {review.row.workflowState}</p></section><section className="grid gap-6 lg:grid-cols-2"><Panel title="Patient summary"><p>Arthur Pendleton, fictional HFrEF demo patient. Dry weight 78.0 kg.</p><p className="mt-2">Original confirmed reading: 79.8 kg.</p><p className="mt-2">{review.protectedImagePreview}</p></Panel><Panel title="Explainable contributors"><ul className="space-y-2">{review.risk.contributors.map((item) => <li key={item.code}>{item.label} — evidence {item.evidenceEventIds.join(", ")}</li>)}</ul><p className="mt-4">Data completeness: {review.risk.dataCompleteness}%</p></Panel><Panel title="Conversation timeline"><ul>{review.conversation.map((line) => <li key={line}>{line}</li>)}</ul></Panel><Panel title="Call transcript"><ul>{review.transcript.map((line) => <li key={line}>{line}</li>)}</ul></Panel><Panel title="Structured symptom answers"><ul>{review.symptomAnswers.map((answer) => <li key={answer.evidenceEventId}>{answer.question}: {answer.answer} ({answer.evidenceEventId})</li>)}</ul></Panel><Panel title="Missing or uncertain information">{review.missingOrUncertain.length ? <ul>{review.missingOrUncertain.map((item) => <li key={item}>{item}</li>)}</ul> : <p>No critical missing information in the deterministic fixture.</p>}</Panel></section><section className="rounded-[2rem] bg-white p-8 shadow-soft"><h2 className="text-3xl font-semibold">Clinician actions</h2><p className="mt-2 text-slate-600">Safe follow-up wording: {safeFollowUpMessage}</p><div className="mt-5 flex flex-wrap gap-3">{actions.map((action) => <button key={action.id} className="rounded-full bg-ink px-5 py-3 font-semibold text-white" onClick={() => send(action.id)}>{action.label}</button>)}</div><output className="mt-5 block rounded-2xl bg-mist p-4" aria-live="polite">{result}</output></section><Panel title="Audit history">{review.auditEvents.length ? <ul>{review.auditEvents.map((event) => <li key={event.id}>{event.action} at {event.createdAt}</li>)}</ul> : <p>No actions recorded in this browser session yet.</p>}</Panel></div>;
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-[2rem] bg-white p-6 shadow-soft"><h2 className="text-2xl font-semibold">{title}</h2><div className="mt-3 text-slate-700">{children}</div></section>; }
