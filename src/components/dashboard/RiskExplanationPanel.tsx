import { arthurPendleton } from "@/lib/demo/arthur";
import { arthurRiskFixtureEvents } from "@/lib/risk/arthurFixture";
import { calculateDemoRiskSignal } from "@/lib/risk/engine";

export function RiskExplanationPanel() {
  const signal = calculateDemoRiskSignal({ patientId: arthurPendleton.id, dryWeightKg: arthurPendleton.dryWeightKg, events: arthurRiskFixtureEvents });
  return <section className="rounded-[2rem] bg-white p-8 shadow-soft">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-base font-semibold uppercase tracking-[0.18em] text-aura">Explainable demo risk engine</p><h2 className="mt-1 text-4xl font-semibold">{signal.name}</h2><p className="mt-2 text-slate-600">Transparent deterministic rules. This is not a diagnosis or a validated clinical prediction.</p></div><div className="rounded-3xl bg-rose-50 px-6 py-4 text-rose-950"><p className="text-sm font-semibold uppercase">Risk category</p><p className="text-4xl font-semibold">{signal.category}</p></div></div>
    <div className="mt-6 grid gap-4 md:grid-cols-3"><Metric label="Risk score" value={`${signal.riskScore}/100`} /><Metric label="Data completeness" value={`${signal.dataCompleteness}%`} /><Metric label="Rule confidence" value={`${signal.ruleConfidence}%`} /></div>
    <h3 className="mt-6 text-2xl font-semibold">Plain-language contributors</h3>
    <ul className="mt-3 grid gap-3 md:grid-cols-2">{signal.contributors.map((item) => <li key={item.code} className="rounded-3xl border border-slate-100 p-4"><p className="font-semibold">{item.label}</p><p className="text-slate-600">Direction: {item.direction}; contribution: {item.contribution > 0 ? "+" : ""}{item.contribution}. Evidence: {item.evidenceEventIds.join(", ")}</p></li>)}</ul>
  </section>;
}
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-3xl bg-mist p-5"><p className="text-slate-500">{label}</p><p className="mt-1 text-3xl font-semibold">{value}</p></div>; }
