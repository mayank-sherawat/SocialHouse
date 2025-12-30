import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  // 1. FIX: Type 'params' as a Promise
  { params }: { params: Promise<{ username: string }> }
) {
  // 2. FIX: Await the params to get the data
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username }, // Use the awaited username
    select: {
      _count: {
        select: {
          followers: true,
          following: true,
          photos: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user._count);
}