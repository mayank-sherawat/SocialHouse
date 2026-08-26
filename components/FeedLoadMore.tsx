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
        <div ref={sentinelRef} className="bg-[#FAF9F6] border border-[#DCD8CE] shadow-sm overflow-hidden mb-8">
          <div className="p-4 flex items-center gap-3 border-b border-[#EAE7DF]">
            <Skeleton className="h-8 w-8 rounded-full bg-[#EAE7DF]" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-28 bg-[#EAE7DF]" />
              <Skeleton className="h-2 w-16 bg-[#EAE7DF]" />
            </div>
          </div>
          <Skeleton className="w-full aspect-[4/3] rounded-none bg-[#EAE7DF]" />
        </div>
      )}

      {reachedEnd && items.length > 0 && (
        <div className="py-8 text-center font-mono text-[11px] text-[#8C8880] tracking-widest uppercase border-t border-[#E2DFD7] mt-8">
          &mdash; END OF ARCHIVE TIMELINE &bull; ALL MOMENTS EXPLORED &mdash;
        </div>
      )}
    </>
  );
}
