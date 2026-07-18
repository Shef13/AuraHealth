import { demoClinician, recordClinicianAction } from "@/lib/clinician/service";
import type { ClinicianActionType } from "@/lib/clinician/types";

export async function POST(request: Request): Promise<Response> {
  const body = await request.json() as Partial<{ patientId: string; action: ClinicianActionType }>;
  if (!body.patientId || !body.action) return json({ error: "patientId and action are required" }, 400);
  return json(recordClinicianAction({ patientId: body.patientId, action: body.action, user: demoClinician }), 202);
}
function json(payload: unknown, status: number) { return new Response(JSON.stringify(payload), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } }); }
