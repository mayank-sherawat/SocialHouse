"use client";

import Image from "next/image";
import Link from "next/link";
import { cldOptimized } from "@/lib/cloudinary-url";
import LikeButton from "@/components/LikeButton";
import type { FeedPhoto } from "@/lib/feed";
import { User, Clock } from "lucide-react";

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

/** Archival photographic card for feed timeline. */
export default function FeedPost({
  photo,
  priority = false,
}: {
  photo: FeedPhoto;
  priority?: boolean;
}) {
  return (
    <article className="bg-[#FAF9F6] border border-[#DCD8CE] shadow-sm overflow-hidden transition-all duration-300">
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

      {/* Image Viewport */}
      <div className="relative w-full bg-[#EAE7DF] overflow-hidden flex items-center justify-center border-b border-[#EAE7DF] group">
        <Image
          src={cldOptimized(photo.imageUrl)}
          alt={photo.caption || "Archival photo"}
          width={1200}
          height={1200}
          priority={priority}
          className="w-full h-auto object-cover max-h-[750px] transition-transform duration-700 group-hover:scale-[1.01]"
        />
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-[#EAE7DF] bg-[#FAF9F6]">
        <LikeButton
          photoId={photo.id}
          initialLiked={photo.likedByMe}
          initialCount={photo.likeCount}
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
