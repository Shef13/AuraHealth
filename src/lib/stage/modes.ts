import { z } from "zod";

export type DemoMode = "fully_simulated" | "hybrid" | "live_integration" | "backup_simulation";
export type ProviderReadiness = "ready" | "not_configured" | "unavailable";

export const stageEnvSchema = z.object({
  AURACARE_DEMO_MODE: z.enum(["fully_simulated", "hybrid", "live_integration", "backup_simulation"]).default("fully_simulated"),
  MESSAGING_PROVIDER: z.enum(["mock", "twilio"]).default("mock"),
  VOICE_PROVIDER: z.enum(["mock", "twilio"]).default("mock"),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  AURACARE_OPERATOR_TOKEN: z.string().optional()
}).superRefine((env, ctx) => {
  if ((env.AURACARE_DEMO_MODE === "hybrid" || env.AURACARE_DEMO_MODE === "live_integration") && env.MESSAGING_PROVIDER !== "twilio") ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Hybrid and live integration stage modes require Twilio WhatsApp configuration." });
  if (env.AURACARE_DEMO_MODE === "live_integration" && env.VOICE_PROVIDER !== "twilio") ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Live integration stage mode requires a configured live voice provider." });
});

export function getStageMode(env: Record<string, string | undefined> = process.env): DemoMode { return stageEnvSchema.parse(env).AURACARE_DEMO_MODE as DemoMode; }
export function isOperatorRequest(headers: Headers): boolean { const expected = process.env.AURACARE_OPERATOR_TOKEN; return expected ? headers.get("x-auracare-operator-token") === expected : headers.get("x-auracare-demo-authorized") === "true"; }
export function operatorModeLabel(mode: DemoMode): string { return mode === "fully_simulated" ? "Fully simulated" : mode === "hybrid" ? "Hybrid: live WhatsApp, simulated voice/analysis" : mode === "live_integration" ? "Live integration: configured WhatsApp and voice" : "Backup simulation active"; }
