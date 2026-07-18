import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("provider diagnostics route", () => {
  it("protects operator diagnostics", async () => {
    const response = GET(new Request("http://localhost/api/diagnostics/provider"));
    expect(response.status).toBe(401);
  });

  it("returns safe diagnostics to authorised operators", async () => {
    const response = GET(new Request("http://localhost/api/diagnostics/provider", { headers: { "x-auracare-demo-authorized": "true" } }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.storageUrlsExposed).toBe(false);
  });
});
