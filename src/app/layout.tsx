import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Disclaimer } from "@/components/Disclaimer";

export const metadata: Metadata = { title: "AuraCare", description: "WhatsApp-first virtual-ward demonstration" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><div className="flex min-h-screen flex-col"><Header /><main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-10">{children}</main><Disclaimer /></div></body></html>; }
