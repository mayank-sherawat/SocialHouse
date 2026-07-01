import { prisma } from "@/lib/prisma";
import { apiSuccess, handleRoute, parseBody, requireUser } from "@/lib/api";
import { followSchema } from "@/lib/validations";

export const POST = handleRoute(async (req: Request) => {
  const user = await requireUser();
  const { userId } = await parseBody(req, followSchema);

  // deleteMany is a no-op (and safe) when the follow doesn't exist.
  await prisma.follow.deleteMany({
    where: { followerId: user.id, followingId: userId },
  });

  return apiSuccess({ success: true });
});
