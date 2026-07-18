import { AssessmentControlPanel } from "@/components/developer/AssessmentControlPanel";
import { CallRecoveryPanel } from "@/components/developer/CallRecoveryPanel";
import { WebhookSimulator } from "@/components/developer/WebhookSimulator";
import { ArthurDashboard } from "@/components/dashboard/ArthurDashboard";
import { OperatorPanel } from "@/components/operator/OperatorPanel";
import { getStageMode } from "@/lib/stage/modes";

export default function DeveloperPage() {
  return <div className="space-y-6"><OperatorPanel initialMode={getStageMode()} /><WebhookSimulator /><CallRecoveryPanel /><AssessmentControlPanel /><ArthurDashboard controlsEnabled /></div>;
}
