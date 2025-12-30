import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: {
    username?: string;
    email?: string;
    bio?: string | null;
    password?: string;
  } = await req.json();

  const data: Prisma.UserUpdateInput = {
    username: body.username,
    email: body.email,
    bio: body.bio,
  };

  if (body.password && body.password.length >= 6) {
    data.password = await bcrypt.hash(body.password, 10);
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data,
  });

  return NextResponse.json({ success: true });
}
