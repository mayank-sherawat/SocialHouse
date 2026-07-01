"use client";

import { useEffect, useRef } from "react";
import useSWRInfinite from "swr/infinite";
import { fetcher } from "@/lib/fetcher";
import FeedPost from "@/components/FeedPost";
import { Skeleton } from "@/components/ui/Skeleton";
import type { FeedPage } from "@/lib/feed";

/**
 * Client-side continuation of the feed. The server renders page 1; this loads
 * subsequent pages via `/api/feed?cursor=` as the sentinel scrolls into view
 * (IntersectionObserver). `initialCursor` is the cursor after the SSR'd page.
 */
export default function FeedLoadMore({ initialCursor }: { initialCursor: string | null }) {
  const getKey = (index: number, prev: FeedPage | null) => {
    if (index === 0) return initialCursor ? `/api/feed?cursor=${initialCursor}` : null;
    if (prev && !prev.nextCursor) return null; // no more pages
    return `/api/feed?cursor=${prev?.nextCursor}`;
  };

  const { data, setSize, isValidating } = useSWRInfinite<FeedPage>(getKey, fetcher);

  const pages = data ?? [];
  const items = pages.flatMap((p) => p.items);
  const reachedEnd =
    initialCursor === null || (pages.length > 0 && !pages[pages.length - 1].nextCursor);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (reachedEnd) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isValidating) {
          setSize((s) => s + 1);
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reachedEnd, isValidating, setSize]);

  return (
    <>
      {items.map((photo) => (
        <FeedPost key={photo.id} photo={photo} />
      ))}

      {!reachedEnd && (
        <div ref={sentinelRef} className="bg-white sm:border border-gray-200 sm:rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>
          <Skeleton className="w-full aspect-square rounded-none" />
        </div>
      )}
    </>
  );
}
