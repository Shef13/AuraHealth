export function GET() {
  return Response.json({ ok: true, service: "AuraCare", safety: "Demonstration only. Not for diagnosis, prescribing or emergency use." });
}
