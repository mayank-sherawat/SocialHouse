import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleRoute, HttpError, parseBody, requireUser } from "@/lib/api";
import { settingsSchema } from "@/lib/validations";

export const PATCH = handleRoute(async (req: Request) => {
  const user = await requireUser();
  const body = await parseBody(req, settingsSchema);

  // Only include fields the user actually provided.
  const data: Prisma.UserUpdateInput = {};
  if (body.username !== undefined) data.username = body.username;
  if (body.email !== undefined) data.email = body.email;
  if (body.bio !== undefined) data.bio = body.bio;
  if (body.password !== undefined) data.password = await bcrypt.hash(body.password, 10);

  try {
    await prisma.user.update({ where: { id: user.id }, data });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new HttpError(409, "That username or email is already taken.");
    }
    throw err;
  }

  return apiSuccess({ success: true });
});
