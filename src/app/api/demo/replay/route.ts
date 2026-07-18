import { publishNextReplayEvent, resetReplayState, replayState, setReplayStatus } from "@/lib/stream/store";

export async function POST(request: Request): Promise<Response> {
  const body = await request.json() as Partial<{ action: "start" | "pause" | "resume" | "reset" | "step"; speedMs: number }>;
  if (body.action === "reset") resetReplayState();
  if (body.action === "start") { resetReplayState(); setReplayStatus("running", body.speedMs); }
  if (body.action === "pause") setReplayStatus("paused");
  if (body.action === "resume") setReplayStatus("running", body.speedMs);
  if (body.action === "step") publishNextReplayEvent();
  return new Response(JSON.stringify(replayState), { status: 202, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}
