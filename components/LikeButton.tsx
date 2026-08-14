"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  photoId: string;
  initialLiked: boolean;
  initialCount: number;
  className?: string;
}

/** Heart toggle with an optimistic count; reconciles with the server response. */
export default function LikeButton({
  photoId,
  initialLiked,
  initialCount,
  className,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  const toggle = async () => {
    if (pending) return;
    const nextLiked = !liked;

    // Optimistic update.
    setLiked(nextLiked);
    setCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)));
    setPending(true);

    try {
      const res = await fetch(`/api/photos/${photoId}/like`, {
        method: nextLiked ? "POST" : "DELETE",
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { liked: boolean; count: number };
      setLiked(data.liked);
      setCount(data.count);
    } catch {
      // Roll back.
      setLiked(!nextLiked);
      setCount((c) => Math.max(0, c + (nextLiked ? -1 : 1)));
      toast.error("Couldn't update like");
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
      className={cn(
        "flex items-center gap-1.5 text-sm font-medium transition-colors",
        liked ? "text-red-600" : "text-gray-500 hover:text-gray-800",
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        className={cn(
          "w-6 h-6 transition-transform active:scale-125",
          liked ? "fill-red-600 stroke-red-600" : "fill-none stroke-current"
        )}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      {count > 0 && <span className="tabular-nums">{count}</span>}
    </button>
  );
}
