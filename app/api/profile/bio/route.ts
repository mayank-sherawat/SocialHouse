import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bio } = await req.json();

  if (typeof bio !== "string") {
    return NextResponse.json({ error: "Invalid bio" }, { status: 400 });
  }

  if (bio.length > 150) {
    return NextResponse.json({ error: "Bio too long" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { bio: bio.trim() || null },
  });

  return NextResponse.json({ success: true });
}
