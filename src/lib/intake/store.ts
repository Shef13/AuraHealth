import type { IntakeRecord, IntakeStore } from "./types";

export function createMemoryIntakeStore(): IntakeStore {
  const records = new Map<string, IntakeRecord>();
  return {
    hasProviderMessage(providerMessageId) { return records.has(providerMessageId); },
    save(record) { records.set(record.providerMessageId, record); },
    reset() { records.clear(); },
    all() { return [...records.values()]; }
  };
}

const globalForIntake = globalThis as typeof globalThis & { __auracareIntakeStore?: IntakeStore };
export const intakeStore = globalForIntake.__auracareIntakeStore ?? createMemoryIntakeStore();
globalForIntake.__auracareIntakeStore = intakeStore;
