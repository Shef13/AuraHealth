import { describe, expect, it } from "vitest";
import { redactPhoneNumber, redactTranscript, safeLogFields } from "./redaction";

describe("redaction helpers", () => {
  it("redacts phone numbers and transcript bodies for ordinary logs", () => {
    expect(redactPhoneNumber("+44 7700 900123")).toBe("[phone-redacted-ends-23]");
    expect(redactTranscript("Arthur reports a little more breathless than usual")).toContain("transcript-redacted");
    const fields = safeLogFields({ patientPhoneNumber: "+440000000000", status: "received" });
    expect(fields.patientPhoneNumber).toBe("[phone-redacted-ends-00]");
    expect(fields.status).toBe("received");
  });
});
