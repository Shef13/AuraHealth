import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("health endpoint", () => {
  it("reports demo-only service health", async () => {
    const response = GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.safety).toContain("Demonstration only");
  });
});
