import { readFileSync } from "node:fs";

const requiredFiles = ["src/app/layout.tsx", "src/app/patients/arthur-pendleton/page.tsx", "src/app/developer/page.tsx", "src/components/dashboard/ArthurDashboard.tsx", "src/app/api/webhooks/messaging/route.ts", "src/components/developer/WebhookSimulator.tsx"];
for (const file of requiredFiles) readFileSync(file, "utf8");
console.log("Fallback build smoke check passed; run next build when dependencies are installed.");
