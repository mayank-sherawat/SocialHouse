import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleRoute } from "@/lib/api";

export const GET = handleRoute(
  async (_req: Request, { params }: { params: Promise<{ username: string }> }) => {
    const { username } = await params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        _count: {
          select: { followers: true, following: true, photos: true },
        },
      },
    });

    if (!user) return apiError("User not found", 404);

    return apiSuccess(user._count);
  }
);
