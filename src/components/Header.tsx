import Link from "next/link";
import { Activity } from "lucide-react";

const links = [["/patients/arthur-pendleton", "Patient overview"], ["/conversation", "Conversation"], ["/queue", "Clinician queue"], ["/developer", "Developer controls"]] as const;
export function Header() { return <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6"><Link href="/" className="flex items-center gap-3 font-semibold"><span className="rounded-2xl bg-white p-2 shadow-soft"><Activity className="text-aura" /></span>AuraCare</Link><nav className="flex gap-2 text-sm">{links.map(([href,label]) => <Link key={href} className="rounded-full px-3 py-2 text-slate-600 hover:bg-white hover:text-ink" href={href}>{label}</Link>)}</nav></header>; }
