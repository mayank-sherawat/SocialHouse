import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleRoute, HttpError, parseBody, requireUser } from "@/lib/api";
import { followSchema } from "@/lib/validations";

export const POST = handleRoute(async (req: Request) => {
  const user = await requireUser();
  const { userId } = await parseBody(req, followSchema);

  if (userId === user.id) {
    throw new HttpError(400, "You cannot follow yourself.");
  }

  try {
    await prisma.follow.create({
      data: { followerId: user.id, followingId: userId },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // Already following -> idempotent success.
      if (err.code === "P2002") return apiSuccess({ success: true });
      // Target user does not exist.
      if (err.code === "P2003") throw new HttpError(404, "User not found.");
    }
    throw err;
  }

  return apiSuccess({ success: true });
});
