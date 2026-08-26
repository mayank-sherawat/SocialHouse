"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  photoId: string;
  initialLiked: boolean;
  initialCount: number;
  className?: string;
}

/** Tactile heart toggle with optimistic update and micro-animation. */
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

    // Optimistic update
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
      // Roll back
      setLiked(!nextLiked);
      setCount((c) => Math.max(0, c + (nextLiked ? -1 : 1)));
      toast.error("Couldn't update reaction");
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
        "group inline-flex items-center gap-1.5 text-xs font-mono tracking-wider transition-all duration-200 active:scale-90",
        liked
          ? "text-[#DC2626] font-bold"
          : "text-[#6C6860] hover:text-[#181716]",
        className
      )}
    >
      <Heart
        className={cn(
          "w-4 h-4 transition-transform duration-200 group-hover:scale-110",
          liked
            ? "fill-[#DC2626] text-[#DC2626]"
            : "fill-none text-current"
        )}
      />
      <span className="tabular-nums font-mono text-xs">
        {count} {count === 1 ? "LIKE" : "LIKES"}
      </span>
    </button>
  );
}
