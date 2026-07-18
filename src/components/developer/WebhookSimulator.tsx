"use client";

import { useState } from "react";

type Scenario = "valid_image" | "duplicate" | "missing_media" | "unsupported_file" | "unknown_phone";
const scenarios: Array<{ id: Scenario; label: string; description: string }> = [
  { id: "valid_image", label: "Receive Arthur scale image", description: "Creates message.received, scale_image.received and queues extraction." },
  { id: "duplicate", label: "Duplicate delivery", description: "Replays the same provider message ID to test idempotency." },
  { id: "missing_media", label: "Missing media", description: "Uses Arthur’s phone number without an attachment." },
  { id: "unsupported_file", label: "Unsupported file type", description: "Sends a PDF-like attachment and expects a safe response." },
  { id: "unknown_phone", label: "Unknown phone number", description: "Routes to enrolment-or-support copy." }
];

export function WebhookSimulator() {
  const [selected, setSelected] = useState<Scenario>("valid_image");
  const [fileName, setFileName] = useState("sample-scale.jpg");
  const [result, setResult] = useState("No webhook sent yet.");

  async function send() {
    const payload = buildPayload(selected, fileName);
    const response = await fetch("/api/webhooks/messaging", { method: "POST", headers: { "content-type": "application/json", "x-auracare-provider": "mock" }, body: JSON.stringify(payload) });
    setResult(`${response.status}: ${await response.text()}`);
  }

  return <section className="rounded-[2rem] border-2 border-dashed border-amber-200 bg-amber-50 p-8">
    <p className="text-base font-semibold uppercase tracking-[0.18em] text-amber-900">Local webhook simulator</p>
    <h2 className="mt-1 text-3xl font-semibold">Messaging intake adapter</h2>
    <p className="mt-2 max-w-3xl text-slate-700">Uses the same application intake service as the live webhook after provider parsing. No external network calls are made in mock mode.</p>
    <div className="mt-6 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
      <label className="block text-lg font-semibold">Scenario<select className="mt-2 w-full rounded-2xl border border-amber-200 bg-white p-4" value={selected} onChange={(event: { target: { value: string } }) => setSelected(event.target.value as Scenario)}>{scenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.label}</option>)}</select></label>
      <label className="block text-lg font-semibold">Sample scale image<input className="mt-2 w-full rounded-2xl border border-amber-200 bg-white p-4" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event: { target: { files?: Array<{ name: string }> } }) => setFileName(event.target.files?.[0]?.name ?? "sample-scale.jpg")} /></label>
    </div>
    <p className="mt-3 text-slate-700">{scenarios.find((scenario) => scenario.id === selected)?.description}</p>
    <button className="mt-5 rounded-full bg-ink px-6 py-3 font-semibold text-white" onClick={send}>Send simulated webhook</button>
    <output className="mt-5 block rounded-2xl bg-white p-4 text-lg" aria-live="polite">{result}</output>
  </section>;
}

function buildPayload(scenario: Scenario, fileName: string) {
  const base = { providerMessageId: scenario === "duplicate" ? "mock-duplicate-scale-1" : `mock-${scenario}-${Date.now()}`, from: "+440000000000", to: "whatsapp:+14155238886", body: `Scale photo: ${fileName}`, timestamp: "2026-07-18T11:00:00.000Z" };
  if (scenario === "unknown_phone") return { ...base, from: "+449999999999", media: [{ providerMediaId: "mock-unknown-media", mimeType: "image/jpeg", sizeBytes: 245000 }] };
  if (scenario === "missing_media") return { ...base, media: [] };
  if (scenario === "unsupported_file") return { ...base, media: [{ providerMediaId: "mock-pdf-media", mimeType: "application/pdf", sizeBytes: 125000 }] };
  return { ...base, providerMessageId: scenario === "duplicate" ? "mock-duplicate-scale-1" : base.providerMessageId, media: [{ providerMediaId: "mock-scale-media", mimeType: "image/jpeg", sizeBytes: 245000, sha256: "mock-upload-sha256" }] };
}
