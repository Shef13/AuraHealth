import { eventsSince, publishNextReplayEvent, replayState } from "@/lib/stream/store";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const lastEventId = request.headers.get("last-event-id") ?? new URL(request.url).searchParams.get("lastEventId");
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const event of eventsSince(replayState.events, lastEventId)) controller.enqueue(encoder.encode(formatEvent(event.id, event)));
      const interval = setInterval(() => {
        if (replayState.status === "running") {
          const event = publishNextReplayEvent();
          if (event) controller.enqueue(encoder.encode(formatEvent(event.id, event)));
        }
      }, Math.max(100, replayState.speedMs));
      setTimeout(() => { clearInterval(interval); controller.close(); }, 30000);
    }
  });
  return new Response(stream, { headers: { "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-store", connection: "keep-alive" } });
}

function formatEvent(id: string, data: unknown): string { return `id: ${id}\nevent: analysis\ndata: ${JSON.stringify(data)}\n\n`; }
