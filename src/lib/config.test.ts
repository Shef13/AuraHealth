import { describe, expect, it } from "vitest";
import { envSchema } from "./config";

describe("envSchema", () => {
  it("defaults to mock mode", () => { expect(envSchema.parse({}).AURACARE_MODE).toBe("mock"); });
  it("rejects silent fallback in live mode", () => { expect(() => envSchema.parse({ AURACARE_MODE: "live" })).toThrow(/Live mode/); });
});
