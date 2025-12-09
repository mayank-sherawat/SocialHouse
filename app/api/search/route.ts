// app/api/search/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("username")?.trim();

    if (!q || q.length === 0) {
      return NextResponse.json({ users: [] });
    }

    // Simple case-insensitive "contains" search, limit results to 20
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: q,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
      take: 20,
      orderBy: { username: "asc" },
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
