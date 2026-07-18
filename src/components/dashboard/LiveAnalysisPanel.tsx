"use client";

import { useEffect, useMemo, useState } from "react";
import type { AnalysisStreamEvent } from "@/lib/stream/types";

export function LiveAnalysisPanel({ controlsEnabled }: { controlsEnabled: boolean }) {
  const [events, setEvents] = useState<AnalysisStreamEvent[]>([]);
  const [connection, setConnection] = useState<"connecting" | "live" | "reconnecting" | "closed">("connecting");
  const [lastEventId, setLastEventId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const url = lastEventId ? `/api/events/arthur?lastEventId=${encodeURIComponent(lastEventId)}` : "/api/events/arthur";
    const source = new EventSource(url);
    source.onopen = () => setConnection("live");
    source.onerror = () => setConnection("reconnecting");
    source.addEventListener("analysis", (message) => {
      const event = JSON.parse((message as MessageEvent).data) as AnalysisStreamEvent;
      setLastEventId(event.id);
      setEvents((current) => current.some((item) => item.id === event.id) ? current : [...current, event].sort((a, b) => a.sequence - b.sequence));
    });
    return () => { source.close(); setConnection("closed"); };
  }, [lastEventId]);

  const active = events.at(-1);
  const completed = events.filter((event) => event.completed);
  const progress = Math.round((events.length / 15) * 100);

  async function control(action: "start" | "pause" | "resume" | "reset" | "step") {
    if (action === "reset") { setEvents([]); setLastEventId(undefined); }
    await fetch("/api/demo/replay", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, speedMs: 650 }) });
  }

  return <section className="rounded-[2rem] bg-white p-8 shadow-soft">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-base font-semibold uppercase tracking-[0.18em] text-aura">Live analysis stream</p><h2 className="mt-1 text-4xl font-semibold">Demonstration risk assessment</h2><p className="mt-2 text-slate-600">Normalised clinician-safe events only. No raw provider payloads or fake technical traces are shown.</p></div>
      <span className="rounded-full bg-blue-50 px-4 py-2 text-base font-semibold text-blue-900">Connection: {connection}</span>
    </div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      <div className="rounded-3xl bg-mist p-6"><p className="text-slate-500">Current workflow stage</p><p className="mt-2 text-3xl font-semibold">{active?.stage ?? "waiting"}</p><p className="mt-4 text-slate-500">Active analysis step</p><p className="mt-2 text-2xl font-semibold">{active?.title ?? "Replay not started"}</p><div className="mt-6 h-3 rounded-full bg-white"><div className="h-3 rounded-full bg-aura transition-all" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-sm text-slate-600">{progress}% complete</p></div>
      <div><h3 className="text-2xl font-semibold">Completed signals</h3><div className="mt-3 flex flex-wrap gap-2">{completed.map((event) => <span key={event.id} className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">{event.title}</span>)}</div></div>
    </div>
    <ol className="mt-6 grid gap-3 md:grid-cols-2">{events.map((event) => <li key={event.id} className="rounded-3xl border border-slate-100 p-4"><p className="font-semibold">{event.sequence}. {event.title}</p><p className="text-slate-600">{event.detail}</p></li>)}</ol>
    {controlsEnabled ? <div className="mt-6 flex flex-wrap gap-3">{(["start", "pause", "resume", "step", "reset"] as const).map((action) => <button key={action} className="rounded-full bg-ink px-5 py-3 font-semibold text-white" onClick={() => control(action)}>{action}</button>)}</div> : null}
  </section>;
}
