import { arthurAnalysisReplayEvents } from "./arthur";
import type { AnalysisStreamEvent, ReplayState } from "./types";

export function createReplayState(speedMs = 750): ReplayState { return { status: "idle", speedMs, cursor: 0, events: [] }; }
export function appendReplayEvent(state: ReplayState, event: AnalysisStreamEvent): ReplayState { return state.events.some((existing) => existing.id === event.id) ? state : { ...state, cursor: event.sequence, events: [...state.events, event].sort((a, b) => a.sequence - b.sequence) }; }
export function eventsSince(events: AnalysisStreamEvent[], lastEventId?: string | null): AnalysisStreamEvent[] { if (!lastEventId) return events; const index = events.findIndex((event) => event.id === lastEventId); return index < 0 ? events : events.slice(index + 1); }
export function nextReplayEvent(state: ReplayState): AnalysisStreamEvent | undefined { return arthurAnalysisReplayEvents.find((event) => event.sequence === state.cursor + 1); }

const globalForReplay = globalThis as typeof globalThis & { __auracareReplayState?: ReplayState };
export const replayState = globalForReplay.__auracareReplayState ?? createReplayState();
globalForReplay.__auracareReplayState = replayState;
export function resetReplayState() { replayState.status = "idle"; replayState.cursor = 0; replayState.events = []; }
export function setReplayStatus(status: ReplayState["status"], speedMs?: number) { replayState.status = status; if (speedMs) replayState.speedMs = speedMs; }
export function publishNextReplayEvent() { const next = nextReplayEvent(replayState); if (!next) { replayState.status = "complete"; return undefined; } const updated = appendReplayEvent(replayState, next); replayState.cursor = updated.cursor; replayState.events = updated.events; if (replayState.cursor >= arthurAnalysisReplayEvents.length) replayState.status = "complete"; return next; }
