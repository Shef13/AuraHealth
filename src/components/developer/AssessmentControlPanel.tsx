"use client";

import { useState } from "react";

const defaultSessionId = "assessment-call-patient-arthur-pendleton";
export function AssessmentControlPanel() {
  const [sessionId, setSessionId] = useState(defaultSessionId);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState("No Aura assessment action sent yet.");
  async function send(body: Record<string, string>) {
    const response = await fetch("/api/workflows/assessment", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const text = await response.text();
    setResult(`${response.status}: ${text}`);
    if (body.action === "start") setSessionId(defaultSessionId);
  }
  return <section className="rounded-[2rem] border-2 border-dashed border-emerald-200 bg-emerald-50 p-8">
    <p className="text-base font-semibold uppercase tracking-[0.18em] text-emerald-900">Aura assessment controls</p>
    <h2 className="mt-1 text-3xl font-semibold">Guided voice assessment</h2>
    <p className="mt-2 text-slate-700">Runs one scripted question at a time without microphone access. Use custom transcript to rehearse unclear, emergency or stop paths.</p>
    <div className="mt-5 flex flex-wrap gap-3"><button className="rounded-2xl bg-white px-5 py-4 font-semibold" onClick={() => send({ action: "start", callId: "call-patient-arthur-pendleton" })}>Start Aura</button><button className="rounded-2xl bg-white px-5 py-4 font-semibold" onClick={() => send({ action: "scripted_next", sessionId })}>Scripted next answer</button></div>
    <label className="mt-5 block font-semibold">Custom transcript<input className="mt-2 w-full rounded-2xl border border-emerald-200 bg-white p-4" value={transcript} onChange={(event: { target: { value: string } }) => setTranscript(event.target.value)} placeholder="e.g. I have chest pain" /></label>
    <button className="mt-3 rounded-2xl bg-white px-5 py-4 font-semibold" onClick={() => send({ action: "answer", sessionId, transcript })}>Submit transcript</button>
    <output className="mt-5 block rounded-2xl bg-white p-4" aria-live="polite">{result}</output>
  </section>;
}
