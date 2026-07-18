import { z } from "zod";

const provider = z.enum(["mock", "live"]);
export const envSchema = z.object({
  AURACARE_MODE: provider.default("mock"),
  DATABASE_PROVIDER: z.enum(["memory", "supabase"]).default("memory"),
  MESSAGING_PROVIDER: z.enum(["mock", "twilio"]).default("mock"),
  VISION_PROVIDER: z.enum(["mock", "openai"]).default("mock"),
  VOICE_PROVIDER: z.enum(["mock", "twilio"]).default("mock")
}).superRefine((env, ctx) => {
  if (env.AURACARE_MODE === "live" && [env.DATABASE_PROVIDER, env.MESSAGING_PROVIDER, env.VISION_PROVIDER, env.VOICE_PROVIDER].includes("mock")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Live mode requires explicit live providers; never silently fall back to mock mode." });
  }
});
export type AuraCareConfig = z.infer<typeof envSchema>;
export const getConfig = () => envSchema.parse(process.env);
