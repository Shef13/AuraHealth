import { describe, expect, it } from "vitest";
import { arthurAnalysisReplayEvents } from "./arthur";
import { appendReplayEvent, createReplayState, eventsSince, nextReplayEvent } from "./store";

describe("analysis event stream replay", () => {
  it("keeps deterministic events ordered", () => {
    const state = appendReplayEvent(appendReplayEvent(createReplayState(), arthurAnalysisReplayEvents[1]), arthurAnalysisReplayEvents[0]);
    expect(state.events[0]?.id).toBe("arthur-stream-01");
    expect(state.events[1]?.id).toBe("arthur-stream-02");
  });

  it("deduplicates duplicate event delivery", () => {
    const state = appendReplayEvent(appendReplayEvent(createReplayState(), arthurAnalysisReplayEvents[0]), arthurAnalysisReplayEvents[0]);
    expect(state.events).toHaveLength(1);
  });

  it("recovers events since last event id", () => {
    const recovered = eventsSince(arthurAnalysisReplayEvents.slice(0, 4), "arthur-stream-02");
    expect(recovered.map((event) => event.id)).toEqual(["arthur-stream-03", "arthur-stream-04"]);
  });

  it("advances replay cursor deterministically", () => {
    expect(nextReplayEvent(createReplayState())?.id).toBe("arthur-stream-01");
  });
});
