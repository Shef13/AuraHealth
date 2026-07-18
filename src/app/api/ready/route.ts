import { readinessReport } from "@/lib/stage/diagnostics";

export function GET() { return Response.json(readinessReport(), { status: readinessReport().ok ? 200 : 503 }); }
