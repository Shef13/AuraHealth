import type { ClinicianCaseState } from "./types";

export function createClinicianCaseState(patientId: string): ClinicianCaseState { return { patientId, acknowledged: false, resolved: false, actions: [], auditEvents: [], followUps: [] }; }
export interface ClinicianStore { get(patientId: string): ClinicianCaseState; save(state: ClinicianCaseState): void; reset(patientId?: string): void; }
export function createMemoryClinicianStore(): ClinicianStore { const cases = new Map<string, ClinicianCaseState>(); return { get(patientId) { const existing = cases.get(patientId) ?? createClinicianCaseState(patientId); cases.set(patientId, existing); return existing; }, save(state) { cases.set(state.patientId, state); }, reset(patientId) { if (patientId) cases.delete(patientId); else cases.clear(); } }; }
const globalForClinician = globalThis as typeof globalThis & { __auracareClinicianStore?: ClinicianStore };
export const clinicianStore = globalForClinician.__auracareClinicianStore ?? createMemoryClinicianStore();
globalForClinician.__auracareClinicianStore = clinicianStore;
