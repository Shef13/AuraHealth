import { AssessmentControlPanel } from "@/components/developer/AssessmentControlPanel";
import { CallRecoveryPanel } from "@/components/developer/CallRecoveryPanel";
import { WebhookSimulator } from "@/components/developer/WebhookSimulator";
import { ArthurDashboard } from "@/components/dashboard/ArthurDashboard";

export default function DeveloperPage() {
  return <div className="space-y-6"><WebhookSimulator /><CallRecoveryPanel /><AssessmentControlPanel /><ArthurDashboard controlsEnabled /></div>;
}
