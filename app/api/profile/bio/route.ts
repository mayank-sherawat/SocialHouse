import { prisma } from "@/lib/prisma";
import { apiSuccess, handleRoute, parseBody, requireUser } from "@/lib/api";
import { updateBioSchema } from "@/lib/validations";

export const POST = handleRoute(async (req: Request) => {
  const user = await requireUser();
  const { bio } = await parseBody(req, updateBioSchema);

  await prisma.user.update({
    where: { id: user.id },
    data: { bio: bio || null },
  });

  return apiSuccess({ success: true });
});
