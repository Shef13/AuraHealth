import { canAccessProtectedMedia } from "@/lib/governance/media";

export async function GET(request: Request, context: { params: { mediaId: string } }) {
  if (!canAccessProtectedMedia(request.headers)) return new Response("Unauthorised media preview", { status: 401 });
  return Response.json({ mediaId: context.params.mediaId, preview: "Protected AuraCare demo image preview placeholder", storageUrlExposed: false });
}
