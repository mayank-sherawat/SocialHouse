import Image from "next/image";
import Link from "next/link";
import { cldOptimized } from "@/lib/cloudinary-url";
import LikeButton from "@/components/LikeButton";
import type { FeedPhoto } from "@/lib/feed";

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(date));
}

/** A single feed post card (author header, image, caption). */
export default function FeedPost({ photo }: { photo: FeedPhoto }) {
  return (
    <article className="bg-white border-b sm:border border-gray-200 sm:rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4">
        <Link
          href={`/profile/${photo.user.username}`}
          className="flex items-center gap-3 w-fit group"
        >
          <div className="relative h-10 w-10 rounded-full overflow-hidden border border-gray-100 bg-gray-50">
            {photo.user.image ? (
              <Image
                src={photo.user.image}
                alt={`${photo.user.username}'s profile`}
                fill
                className="object-cover group-hover:opacity-90 transition-opacity"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path
                    fillRule="evenodd"
                    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-gray-900 group-hover:underline">
              {photo.user.username}
            </span>
            {photo.createdAt && (
              <span className="text-xs text-gray-500">{formatDate(photo.createdAt)}</span>
            )}
          </div>
        </Link>
      </div>

      {/* Image */}
      <div className="w-full bg-gray-100">
        <Image
          src={cldOptimized(photo.imageUrl)}
          alt={photo.caption || "User post"}
          width={1000}
          height={1000}
          className="w-full h-auto object-cover max-h-[700px]"
        />
      </div>

      {/* Actions */}
      <div className="px-4 pt-3">
        <LikeButton
          photoId={photo.id}
          initialLiked={photo.likedByMe}
          initialCount={photo.likeCount}
        />
      </div>

      {/* Caption */}
      {photo.caption && (
        <div className="p-4 pt-2">
          <div className="text-sm text-gray-800 leading-relaxed">
            <Link
              href={`/profile/${photo.user.username}`}
              className="font-bold mr-2 text-gray-900 hover:underline"
            >
              {photo.user.username}
            </Link>
            {photo.caption}
          </div>
        </div>
      )}
    </article>
  );
}
