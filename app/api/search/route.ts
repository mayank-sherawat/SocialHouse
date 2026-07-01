import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PAGINATION } from "@/lib/constants";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    const { searchParams } = new URL(req.url);
    const q = searchParams
      .get("q")
      ?.trim()
      .slice(0, PAGINATION.SEARCH_MAX_QUERY_LENGTH);

    if (!q || q.length < PAGINATION.SEARCH_MIN_QUERY_LENGTH) {
      return NextResponse.json([]);
    }

    const users = await prisma.user.findMany({
      where: {
        username: { contains: q, mode: "insensitive" },
        NOT: session?.user?.id ? { id: session.user.id } : undefined,
      },
      select: { id: true, username: true, image: true },
      take: PAGINATION.SEARCH_LIMIT,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
