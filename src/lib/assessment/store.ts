import type { AssessmentSession } from "./types";

export interface AssessmentStore { get(id: string): AssessmentSession | undefined; save(session: AssessmentSession): void; reset(): void; }
export function createMemoryAssessmentStore(): AssessmentStore { const sessions = new Map<string, AssessmentSession>(); return { get: (id) => sessions.get(id), save: (session) => sessions.set(session.id, session), reset: () => sessions.clear() }; }
const globalForAssessment = globalThis as typeof globalThis & { __auracareAssessmentStore?: AssessmentStore };
export const assessmentStore = globalForAssessment.__auracareAssessmentStore ?? createMemoryAssessmentStore();
globalForAssessment.__auracareAssessmentStore = assessmentStore;
