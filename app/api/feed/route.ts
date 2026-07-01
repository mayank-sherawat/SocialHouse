import { apiSuccess, handleRoute, requireUser } from "@/lib/api";
import { getFeedPage } from "@/lib/feed";

/** GET /api/feed?cursor=<photoId> — one paginated page of the current user's feed. */
export const GET = handleRoute(async (req: Request) => {
  const user = await requireUser();
  const cursor = new URL(req.url).searchParams.get("cursor") ?? undefined;

  const page = await getFeedPage(user.id, cursor);
  return apiSuccess(page);
});
