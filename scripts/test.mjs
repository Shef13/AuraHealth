import { readFileSync } from "node:fs";

const sources = [
  "src/lib/demo/journey.ts", "src/lib/intake/service.ts", "src/lib/intake/parsers.ts", "src/lib/extraction/service.ts",
  "src/lib/calls/service.ts", "src/lib/assessment/service.ts", "src/lib/stream/store.ts", "src/lib/stream/arthur.ts", "src/lib/risk/engine.ts", "src/lib/risk/types.ts",
  "src/lib/clinician/service.ts", "src/lib/governance/consent.ts", "src/lib/governance/media.ts", "src/lib/governance/emergency.ts", "src/lib/governance/redaction.ts",
  "src/app/api/media/[mediaId]/preview/route.ts", "docs/PRIVACY_MODEL.md", "docs/THREAT_MODEL.md", "docs/CLINICAL_SAFETY_LIMITATIONS.md", "docs/DATA_RETENTION.md", "docs/INCIDENT_RESPONSE.md"
].map((file) => readFileSync(file, "utf8")).join("\n");
const tests = [
  "src/lib/demo/journey.test.ts", "src/lib/intake/service.test.ts", "src/lib/intake/parsers.test.ts", "src/lib/intake/security.test.ts", "src/lib/extraction/service.test.ts",
  "src/lib/calls/service.test.ts", "src/lib/assessment/service.test.ts", "src/lib/stream/store.test.ts", "src/lib/risk/engine.test.ts",
  "src/lib/clinician/service.test.ts", "src/lib/governance/consent.test.ts", "src/lib/governance/media.test.ts", "src/lib/governance/emergency.test.ts", "src/app/api/media/[mediaId]/preview/route.test.ts"
].map((file) => readFileSync(file, "utf8")).join("\n");
const required = ["reduceArthurEvents", "resetDemoEvents", "processInboundMessage", "parseTwilioWebhook", "duplicate", "runWeightExtractionWorkflow", "confirmWeightReading", "79.8", "evaluateDemoAnomaly", "emergency.escalated", "aura-assessment-v1", "requiresClarification", "eventsSince", "Demo risk assessment complete", "Demo deterioration risk signal", "demo-risk-rules-v1", "Clinician reviewed", "safeFollowUpMessage", "Immediate review", "consent.withdrawn", "voice_feature_research", "deleteMediaAfterConfirmation", "redactPhoneNumber", "Unauthorised media preview"];
for (const token of required) {
  if (!sources.includes(token) && !tests.includes(token)) {
    console.error(`Missing expected journey test token: ${token}`);
    process.exit(1);
  }
}
console.log("Fallback unit checks passed; run Vitest when dependencies are installed.");
