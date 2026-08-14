import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleRoute, HttpError, requireUser } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

/** POST /api/photos/[id]/like — like a photo (idempotent). */
export const POST = handleRoute(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;

  try {
    await prisma.like.create({ data: { userId: user.id, photoId: id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        // Already liked — treat as success (idempotent).
      } else if (err.code === "P2003") {
        throw new HttpError(404, "Photo not found.");
      } else {
        throw err;
      }
    } else {
      throw err;
    }
  }

  const count = await prisma.like.count({ where: { photoId: id } });
  return apiSuccess({ liked: true, count });
});

/** DELETE /api/photos/[id]/like — remove a like (no-op if absent). */
export const DELETE = handleRoute(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;

  await prisma.like.deleteMany({ where: { userId: user.id, photoId: id } });

  const count = await prisma.like.count({ where: { photoId: id } });
  return apiSuccess({ liked: false, count });
});
