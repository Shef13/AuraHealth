import { arthurPendleton } from "@/lib/demo/arthur";
import { advanceScriptedAssessment, answerAssessmentQuestion, startAssessment } from "@/lib/assessment/service";

export async function POST(request: Request): Promise<Response> {
  const body = await request.json() as Partial<{ action: "start" | "scripted_next" | "answer"; sessionId: string; transcript: string; callId: string }>;
  const result = body.action === "start"
    ? startAssessment({ patientId: arthurPendleton.id, callId: body.callId ?? "call-patient-arthur-pendleton" })
    : body.action === "scripted_next"
      ? advanceScriptedAssessment({ sessionId: body.sessionId ?? "assessment-call-patient-arthur-pendleton" })
      : answerAssessmentQuestion({ sessionId: body.sessionId ?? "assessment-call-patient-arthur-pendleton", rawTranscript: body.transcript ?? "I don't know" });
  return new Response(JSON.stringify(result), { status: 202, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}
