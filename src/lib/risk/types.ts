import type { AuraCareEvent } from "@/lib/domain/types";

export type RiskCategory = "low" | "medium" | "high" | "emergency_review";
export type ContributorDirection = "increase" | "decrease" | "neutral";
export type RiskContributor = { code: string; label: string; direction: ContributorDirection; contribution: number; evidenceEventIds: string[] };
export interface DemoRiskRuleConfig { version: "demo-risk-rules-v1"; baseScore: number; highThreshold: number; mediumThreshold: number; completenessCap: number; extractionConfidenceMinimum: number; weights: Record<string, number>; }
export interface DemoRiskSignal { name: "Demo deterioration risk signal"; ruleSetVersion: DemoRiskRuleConfig["version"]; category: RiskCategory; riskScore: number; dataCompleteness: number; ruleConfidence: number; requiresClinicianReview: boolean; emergencyReview: boolean; contributors: RiskContributor[]; excludedReasons: string[]; sourceEventIds: string[]; safetyStatement: "Demonstration only. Not for diagnosis, prescribing or emergency use."; }
export interface RiskEngineInput { patientId: string; dryWeightKg: number; events: AuraCareEvent[]; config?: DemoRiskRuleConfig; }
