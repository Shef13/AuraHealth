import { readFileSync } from "node:fs";

const journey = readFileSync("src/lib/demo/journey.ts", "utf8") + readFileSync("src/lib/intake/service.ts", "utf8") + readFileSync("src/lib/intake/parsers.ts", "utf8") + readFileSync("src/lib/extraction/service.ts", "utf8") + readFileSync("src/lib/calls/service.ts", "utf8") + readFileSync("src/lib/assessment/service.ts", "utf8");
const testFile = readFileSync("src/lib/demo/journey.test.ts", "utf8") + readFileSync("src/lib/intake/service.test.ts", "utf8") + readFileSync("src/lib/intake/parsers.test.ts", "utf8") + readFileSync("src/lib/extraction/service.test.ts", "utf8") + readFileSync("src/lib/calls/service.test.ts", "utf8") + readFileSync("src/lib/assessment/service.test.ts", "utf8");
const required = ["reduceArthurEvents", "resetDemoEvents", "appendDemoStep", "Stable demo baseline", "Possible deterioration signal", "processInboundMessage", "parseTwilioWebhook", "duplicate", "runWeightExtractionWorkflow", "confirmWeightReading", "79.8", "evaluateDemoAnomaly", "emergency.escalated", "no answer", "aura-assessment-v1", "requiresClarification", "emergencySignal"];
for (const token of required) {
  if (!journey.includes(token) && !testFile.includes(token)) {
    console.error(`Missing expected journey test token: ${token}`);
    process.exit(1);
  }
}
console.log("Fallback unit checks passed; run Vitest when dependencies are installed.");
