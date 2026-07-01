import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PAGINATION } from "@/lib/constants";

/**
 * GET /api/photos
 * Query params: `userId`, `username` (mutually optional). When none is given,
 * returns the most recent photos. Results are always bounded by `take`.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const username = url.searchParams.get("username");

    let targetUserId = userId ?? undefined;

    if (!targetUserId && username) {
      const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });
      if (!user) return NextResponse.json([]);
      targetUserId = user.id;
    }

    const photos = await prisma.photo.findMany({
      where: targetUserId ? { userId: targetUserId } : undefined,
      orderBy: { createdAt: "desc" },
      take: PAGINATION.PAGE_SIZE,
    });

    return NextResponse.json(photos);
  } catch (err) {
    console.error("GET /api/photos error:", err);
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
  }
}
