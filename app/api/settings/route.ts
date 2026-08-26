import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleRoute, HttpError, parseBody, requireUser } from "@/lib/api";
import { settingsSchema } from "@/lib/validations";

export const PATCH = handleRoute(async (req: Request) => {
  const user = await requireUser();
  const body = await parseBody(req, settingsSchema);

  // If changing password, verify current password first
  if (body.password) {
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    });
    if (!existingUser) {
      throw new HttpError(404, "User not found.");
    }
    const isValidCurrent = await bcrypt.compare(body.currentPassword!, existingUser.password);
    if (!isValidCurrent) {
      throw new HttpError(400, "Current password is incorrect.");
    }
  }

  // Only include fields the user actually provided.
  const data: Prisma.UserUpdateInput = {};
  if (body.username !== undefined) data.username = body.username;
  if (body.bio !== undefined) data.bio = body.bio;
  if (body.password !== undefined) data.password = await bcrypt.hash(body.password, 10);

  try {
    await prisma.user.update({ where: { id: user.id }, data });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new HttpError(409, "That username is already taken.");
    }
    throw err;
  }

  return apiSuccess({ success: true, username: body.username });
});
