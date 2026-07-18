export type AnalysisStage = "intake" | "extraction" | "confirmation" | "call" | "assessment" | "analysis" | "review";
export interface AnalysisStreamEvent { id: string; sequence: number; patientId: string; stage: AnalysisStage; title: string; detail: string; completed: boolean; clinicianSafe: true; demoRiskAssessment: true; occurredAt: string; }
export interface ReplayState { status: "idle" | "running" | "paused" | "complete"; speedMs: number; cursor: number; events: AnalysisStreamEvent[]; }
