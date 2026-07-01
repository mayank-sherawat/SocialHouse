import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleRoute, requireUser } from "@/lib/api";

export const GET = handleRoute(async () => {
  const sessionUser = await requireUser();

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      username: true,
      email: true,
      image: true,
      _count: {
        select: { followers: true, following: true },
      },
    },
  });

  if (!user) return apiError("User not found", 404);

  return apiSuccess(user);
});
