export interface ConfirmationStore {
  has(confirmationId: string): boolean;
  save(confirmationId: string): void;
  reset(): void;
}

export function createMemoryConfirmationStore(): ConfirmationStore {
  const confirmations = new Set<string>();
  return { has: (id) => confirmations.has(id), save: (id) => confirmations.add(id), reset: () => confirmations.clear() };
}

const globalForConfirmation = globalThis as typeof globalThis & { __auracareConfirmationStore?: ConfirmationStore };
export const confirmationStore = globalForConfirmation.__auracareConfirmationStore ?? createMemoryConfirmationStore();
globalForConfirmation.__auracareConfirmationStore = confirmationStore;
