"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cldOptimized, cldBlurPlaceholder } from "@/lib/cloudinary-url";
import LikeButton from "@/components/LikeButton";
import type { FeedPhoto } from "@/lib/feed";
import { User, Clock, Heart } from "lucide-react";

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

/** Archival photographic card for feed timeline with double-tap to like and progressive blur. */
export default function FeedPost({
  photo,
  priority = false,
}: {
  photo: FeedPhoto;
  priority?: boolean;
}) {
  const [liked, setLiked] = useState(photo.likedByMe);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const lastTapRef = useRef<number>(0);

  const triggerDoubleTapLike = () => {
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);

    // If not liked yet, trigger like toggle
    if (!liked) {
      const btn = document.querySelector<HTMLButtonElement>(`[data-like-btn="${photo.id}"]`);
      if (btn) {
        btn.click();
      } else {
        setLiked(true);
      }
    }
  };

  const handleTouchEnd = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      triggerDoubleTapLike();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  return (
    <article
      data-feed-post
      data-post-id={photo.id}
      className="bg-[#FAF9F6] border border-[#DCD8CE] shadow-sm overflow-hidden transition-all duration-300 relative"
    >
      {/* Post Header */}
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-[#EAE7DF] bg-[#FAF9F6]">
        <Link
          href={`/profile/${photo.user.username}`}
          className="flex items-center gap-3 group"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#DCD8CE] bg-[#EAE7DF] shrink-0">
            {photo.user.image ? (
              <Image
                src={photo.user.image}
                alt={`${photo.user.username}'s profile`}
                fill
                sizes="32px"
                className="object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-[#8C8880]">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold tracking-wider text-[#181716] group-hover:underline underline-offset-4">
              @{photo.user.username}
            </span>
          </div>
        </Link>

        {photo.createdAt && (
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#8C8880] uppercase tracking-wider">
            <Clock className="w-3 h-3" />
            <span>{formatDate(photo.createdAt)}</span>
          </div>
        )}
      </div>

      {/* Image Viewport with Double-Tap to Like */}
      <div
        onDoubleClick={triggerDoubleTapLike}
        onTouchEnd={handleTouchEnd}
        className="relative w-full bg-[#EAE7DF] overflow-hidden flex items-center justify-center border-b border-[#EAE7DF] group cursor-pointer select-none"
      >
        <Image
          src={cldOptimized(photo.imageUrl)}
          alt={photo.caption || "Archival photo"}
          width={1200}
          height={1200}
          priority={priority}
          placeholder="blur"
          blurDataURL={cldBlurPlaceholder(photo.imageUrl)}
          className="w-full h-auto object-cover max-h-[750px] transition-transform duration-700 group-hover:scale-[1.01]"
        />

        {/* Tactile Heart Burst Animation */}
        <AnimatePresence>
          {showHeartBurst && (
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -15 }}
              animate={{ scale: [0, 1.3, 1.15], opacity: [0, 1, 1], rotate: 0 }}
              exit={{ scale: 1.5, opacity: 0, rotate: 15 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <div className="relative p-6 rounded-full bg-black/30 backdrop-blur-xs border border-white/20 shadow-2xl">
                <Heart className="w-16 h-16 sm:w-20 sm:h-20 text-[#DC2626] fill-[#DC2626] drop-shadow-[0_4px_12px_rgba(220,38,38,0.6)]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-[#EAE7DF] bg-[#FAF9F6]">
        <LikeButton
          photoId={photo.id}
          initialLiked={photo.likedByMe}
          initialCount={photo.likeCount}
          isLiked={liked}
          onLikeChange={(nextLiked) => {
            setLiked(nextLiked);
          }}
        />
        <span className="font-mono text-[10px] text-[#8C8880] uppercase tracking-widest">
          35MM ARCHIVE
        </span>
      </div>

      {/* Caption Section */}
      {photo.caption && (
        <div className="px-5 py-3.5 bg-[#FAF9F6]">
          <p className="text-xs font-mono leading-relaxed text-[#181716]">
            <Link
              href={`/profile/${photo.user.username}`}
              className="font-bold mr-2 text-[#181716] hover:underline underline-offset-4"
            >
              @{photo.user.username}
            </Link>
            <span className="text-[#3A3834]">{photo.caption}</span>
          </p>
        </div>
      )}
    </article>
  );
}
