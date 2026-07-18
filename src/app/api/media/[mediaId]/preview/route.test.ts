import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("protected media preview", () => {
  it("rejects unauthorised media access", async () => {
    const response = await GET(new Request("http://localhost/api/media/media-test-scale/preview"), { params: { mediaId: "media-test-scale" } });
    expect(response.status).toBe(401);
  });

  it("returns only protected preview metadata for authorised demo users", async () => {
    const response = await GET(new Request("http://localhost/api/media/media-test-scale/preview", { headers: { "x-auracare-demo-authorized": "true" } }), { params: { mediaId: "media-test-scale" } });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.storageUrlExposed).toBe(false);
  });
});
