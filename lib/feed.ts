import { prisma } from "@/lib/prisma";
import { PAGINATION } from "@/lib/constants";

export interface FeedPhoto {
  id: string;
  imageUrl: string;
  caption: string | null;
  createdAt: string | Date;
  user: { username: string; image: string | null };
}

export interface FeedPage {
  items: FeedPhoto[];
  nextCursor: string | null;
}

/**
 * One page of a user's feed: their own photos plus photos from people they
 * follow, newest first. Uses keyset (cursor) pagination — fetches one extra row
 * to determine whether another page exists. The compound `orderBy` keeps the
 * ordering deterministic so the cursor is stable.
 */
export async function getFeedPage(
  userId: string,
  cursor?: string,
  take: number = PAGINATION.PAGE_SIZE
): Promise<FeedPage> {
  const rows = await prisma.photo.findMany({
    where: {
      OR: [{ userId }, { user: { followers: { some: { followerId: userId } } } }],
    },
    include: { user: { select: { username: true, image: true } } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = rows.length > take;
  const items = hasMore ? rows.slice(0, take) : rows;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { items, nextCursor };
}
