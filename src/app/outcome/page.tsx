import Link from "next/link";

const journey = ["Scale photo received", "79.8 kg confirmed", "Call permission granted", "Scripted Aura assessment completed", "Demo deterioration risk signal reached high", "Arthur entered Immediate review", "Simulated clinician intervention recorded", "Follow-up scheduled"];

export default function OutcomePage() {
  return <main className="mx-auto max-w-6xl space-y-8 rounded-[2rem] bg-white p-10 shadow-soft">
    <p className="text-base font-semibold uppercase tracking-[0.18em] text-aura">Completed intercept journey</p>
    <h1 className="text-5xl font-semibold">Arthur demo outcome</h1>
    <p className="text-xl text-slate-700">Demonstration only. Not for diagnosis, prescribing or emergency use. Every clinical action shown here is simulated or clinician-recorded.</p>
    <ol className="grid gap-4 md:grid-cols-2">{journey.map((item, index) => <li key={item} className="rounded-3xl border border-blue-100 bg-blue-50 p-5 text-xl"><span className="font-semibold text-aura">{index + 1}.</span> {item}</li>)}</ol>
    <Link className="inline-flex rounded-full bg-ink px-6 py-3 font-semibold text-white focus:outline-none focus:ring-4 focus:ring-blue-200" href="/queue/arthur-pendleton">Review evidence</Link>
  </main>;
}
