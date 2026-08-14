import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { PAGINATION } from "@/lib/constants";

/**
 * GET /api/photos
 * Query params: `userId`, `username` (mutually optional). When none is given,
 * returns the most recent photos. Each photo includes its like count and, if a
 * user is signed in, whether they've liked it. Results are bounded by `take`.
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const viewerId = session?.user?.id;

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

    const rows = await prisma.photo.findMany({
      where: targetUserId ? { userId: targetUserId } : undefined,
      orderBy: { createdAt: "desc" },
      take: PAGINATION.PAGE_SIZE,
      include: {
        _count: { select: { likes: true } },
        // `__none__` matches no user, so likes is [] for signed-out viewers.
        likes: { where: { userId: viewerId ?? "__none__" }, select: { id: true } },
      },
    });

    const photos = rows.map((r) => ({
      id: r.id,
      imageUrl: r.imageUrl,
      caption: r.caption,
      publicId: r.publicId,
      createdAt: r.createdAt,
      userId: r.userId,
      likeCount: r._count.likes,
      likedByMe: r.likes.length > 0,
    }));

    return NextResponse.json(photos);
  } catch (err) {
    console.error("GET /api/photos error:", err);
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
  }
}
