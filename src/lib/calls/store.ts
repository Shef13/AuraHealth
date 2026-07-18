import type { CallState, CallStore } from "./types";

export function createMemoryCallStore(): CallStore {
  const calls = new Map<string, CallState>();
  const callbacks = new Set<string>();
  return { get: (id) => calls.get(id), getByProviderCallId: (providerCallId) => [...calls.values()].find((call) => call.providerCallId === providerCallId), save: (state) => calls.set(state.callId, state), hasCallback: (id) => callbacks.has(id), saveCallback: (id) => callbacks.add(id), reset: () => { calls.clear(); callbacks.clear(); } };
}
const globalForCalls = globalThis as typeof globalThis & { __auracareCallStore?: CallStore };
export const callStore = globalForCalls.__auracareCallStore ?? createMemoryCallStore();
globalForCalls.__auracareCallStore = callStore;
