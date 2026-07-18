import { getStageMode, stageEnvSchema, type ProviderReadiness } from "./modes";

export interface ProviderDiagnostic { provider: "messaging" | "voice" | "analysis" | "database"; status: ProviderReadiness; detail: string; }
export interface ReadinessReport { ok: boolean; mode: string; diagnostics: ProviderDiagnostic[]; safety: "Demonstration only. Not for diagnosis, prescribing or emergency use."; errors: string[]; }

export function providerDiagnostics(env: Record<string, string | undefined> = process.env): ProviderDiagnostic[] {
  const mode = safeStageMode(env);
  return [
    { provider: "messaging", status: mode === "fully_simulated" || env.TWILIO_ACCOUNT_SID ? "ready" : "not_configured", detail: mode === "fully_simulated" ? "Mock WhatsApp intake is deterministic." : "Twilio WhatsApp credentials are required for hybrid/live modes." },
    { provider: "voice", status: mode === "live_integration" && !env.TWILIO_AUTH_TOKEN ? "not_configured" : "ready", detail: mode === "live_integration" ? "Live voice provider must be configured." : "Voice is simulated for this mode." },
    { provider: "analysis", status: "ready", detail: "Demo risk engine is deterministic and local." },
    { provider: "database", status: "ready", detail: "Memory provider is ready for the fictional Arthur scenario." }
  ];
}

export function readinessReport(env: Record<string, string | undefined> = process.env): ReadinessReport {
  const diagnostics = providerDiagnostics(env);
  const errors = validateStageEnvironment(env);
  return { ok: errors.length === 0 && diagnostics.every((item) => item.status === "ready"), mode: safeStageMode(env), diagnostics, safety: "Demonstration only. Not for diagnosis, prescribing or emergency use.", errors };
}

export function validateStageEnvironment(env: Record<string, string | undefined> = process.env): string[] {
  try { stageEnvSchema.parse(env); return []; } catch (error) { return [error instanceof Error ? error.message : "Invalid stage environment configuration"]; }
}

function safeStageMode(env: Record<string, string | undefined>): string {
  try { return getStageMode(env); } catch { return env.AURACARE_DEMO_MODE ?? "invalid"; }
}
