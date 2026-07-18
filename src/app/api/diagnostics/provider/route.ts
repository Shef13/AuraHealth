import { providerDiagnostics } from "@/lib/stage/diagnostics";
import { isOperatorRequest } from "@/lib/stage/modes";

export function GET(request: Request) {
  if (!isOperatorRequest(request.headers)) return new Response("Unauthorised diagnostics", { status: 401 });
  return Response.json({ diagnostics: providerDiagnostics(), storageUrlsExposed: false });
}
