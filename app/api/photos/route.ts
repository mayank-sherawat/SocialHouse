// app/api/photos/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/photos
 * Accepts query: userId, username, or email
 * If none provided → returns latest photos for feed
 */

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const username = url.searchParams.get("username");
    const email = url.searchParams.get("email");

    let targetUserId = userId ?? undefined;

    if (!targetUserId) {
      if (username) {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return NextResponse.json([], { status: 200 });
        targetUserId = user.id;
      } else if (email) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return NextResponse.json([], { status: 200 });
        targetUserId = user.id;
      }
    }

    // no user specified → return recent photos for feed
    if (!targetUserId) {
      const photos = await prisma.photo.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return NextResponse.json(photos);
    }

    // return photos for the requested user
    const photos = await prisma.photo.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(photos);
  } catch (err) {
    console.error("GET /api/photos error:", err);
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
  }
}
