"use client";

import { useEffect, useMemo, useReducer } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";
import { LiveAnalysisPanel } from "@/components/dashboard/LiveAnalysisPanel";
import type { AuraCareEvent } from "@/lib/domain/types";
import { appendDemoStep, demoControls, reduceArthurEvents, resetDemoEvents, type DemoStep, type StatusTone } from "@/lib/demo/journey";

type Action = { type: "append"; step: DemoStep } | { type: "reset" } | { type: "hydrate"; events: AuraCareEvent[] };
const storageKey = "auracare-arthur-demo-events-v1";

function reducer(events: AuraCareEvent[], action: Action): AuraCareEvent[] {
  switch (action.type) {
    case "append": return appendDemoStep(events, action.step);
    case "reset": return resetDemoEvents();
    case "hydrate": return action.events;
  }
}

const toneClasses: Record<StatusTone, string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-900",
  amber: "border-amber-200 bg-amber-50 text-amber-950",
  red: "border-rose-200 bg-rose-50 text-rose-950",
  blue: "border-blue-200 bg-blue-50 text-blue-950"
};

export function ArthurDashboard({ controlsEnabled }: { controlsEnabled: boolean }) {
  const [events, dispatch] = useReducer(reducer, []);
  const state = useMemo(() => reduceArthurEvents(events), [events]);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) dispatch({ type: "hydrate", events: JSON.parse(raw) as AuraCareEvent[] });
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(events));
  }, [events]);

  const chartData = state.weights.map((reading) => ({ date: new Date(reading.recordedAt).toLocaleDateString("en-GB", { weekday: "short" }), weight: reading.valueKg }));

  return <div className="space-y-6 text-lg">
    <LiveAnalysisPanel controlsEnabled={controlsEnabled} />
    <section className="rounded-[2rem] bg-white p-8 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-base font-semibold uppercase tracking-[0.18em] text-aura">Fictional patient data</p>
          <h1 className="mt-2 text-6xl font-semibold tracking-tight">{state.patient.name}</h1>
          <p className="mt-3 text-2xl text-slate-600">{state.patient.age} years · {state.patient.location} · {state.patient.diagnosis} · Dry weight {state.patient.dryWeightKg.toFixed(1)} kg</p>
        </div>
        <StatusBadge title="Current monitoring status" {...state.monitoringStatus} />
      </div>
    </section>

    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <section className="rounded-[2rem] bg-white p-8 shadow-soft">
        <h2 className="text-3xl font-semibold">Seven-day weight trend</h2>
        <p className="mt-2 text-slate-600">Seeded historical readings around Arthur’s fictional dry weight.</p>
        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: 8, right: 20, top: 20, bottom: 0 }}>
              <defs><linearGradient id="weightFill" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0.03} /></linearGradient></defs>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
              <XAxis dataKey="date" tick={{ fontSize: 16 }} />
              <YAxis domain={[77, 81]} tick={{ fontSize: 16 }} unit=" kg" />
              <Tooltip formatter={(value: unknown) => [`${Number(value).toFixed(1)} kg`, "Weight"]} />
              <Area type="monotone" dataKey="weight" stroke="#2563eb" strokeWidth={4} fill="url(#weightFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="space-y-4">
        <StatusBadge title="Call status" {...state.callStatus} />
        <StatusBadge title="Demo risk status" {...state.riskStatus} />
      </section>
    </div>

    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-[2rem] bg-white p-8 shadow-soft">
        <h2 className="text-3xl font-semibold">WhatsApp-style preview</h2>
        <div className="mt-6 space-y-4">
          {state.conversation.map((message) => <div key={message.id} className={`max-w-[82%] rounded-3xl px-5 py-4 ${message.direction === "outbound" ? "mr-auto bg-slate-100" : "ml-auto bg-blue-600 text-white"}`}>
            <p>{message.body}</p><p className="mt-1 text-sm opacity-75">{new Date(message.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p>
          </div>)}
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-soft">
        <h2 className="text-3xl font-semibold">Evidence panel</h2>
        <div className="mt-6 space-y-4">
          {state.evidence.map((item) => <article key={item.id} className="rounded-3xl border border-slate-100 p-5">
            <p className="text-base font-medium text-slate-500">{item.label}</p><p className="mt-1 text-2xl font-semibold">{item.value}</p><p className="mt-2 text-slate-600">{item.detail}</p>
          </article>)}
        </div>
      </section>
    </div>

    <section className="rounded-[2rem] bg-white p-8 shadow-soft">
      <h2 className="text-3xl font-semibold">Chronological event timeline</h2>
      <ol className="mt-6 grid gap-3 md:grid-cols-2">
        {state.events.map((event) => <li key={event.id} className="rounded-3xl border border-slate-100 p-5 transition-all">
          <p className="text-xl font-semibold">{event.type}</p><p className="text-base text-slate-500">{event.occurredAt}</p>
        </li>)}
      </ol>
    </section>

    {controlsEnabled ? <section className="rounded-[2rem] border-2 border-dashed border-blue-200 bg-blue-50 p-8">
      <div className="flex items-center justify-between gap-4"><div><p className="text-base font-semibold uppercase tracking-[0.18em] text-aura">Development only</p><h2 className="mt-1 text-3xl font-semibold">Demo control panel</h2></div><button className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-ink shadow-soft" onClick={() => dispatch({ type: "reset" })}><RotateCcw size={20} />Reset demo</button></div>
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {demoControls.map((control) => <button key={control.step} className="rounded-2xl bg-white px-5 py-4 text-left font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft focus:outline-none focus:ring-4 focus:ring-blue-200" onClick={() => dispatch({ type: "append", step: control.step })}>{control.label}</button>)}
      </div>
    </section> : null}
  </div>;
}

function StatusBadge({ title, label, detail, tone }: { title: string; label: string; detail: string; tone: StatusTone }) {
  const Icon = tone === "green" ? CheckCircle2 : AlertTriangle;
  return <aside className={`rounded-[2rem] border p-6 ${toneClasses[tone]}`}><div className="flex items-start gap-4"><Icon className="mt-1 shrink-0" size={28} /><div><p className="text-base font-semibold uppercase tracking-[0.16em] opacity-80">{title}</p><p className="mt-2 text-3xl font-semibold">{label}</p><p className="mt-2 text-lg">{detail}</p></div></div></aside>;
}
