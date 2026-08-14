"use client";

import Image from "next/image";
import type { Photo } from "@/types/models";
import { cldOptimized } from "@/lib/cloudinary-url";
import LikeButton from "@/components/LikeButton";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";

interface PhotoLightboxProps {
  photo: Photo;
  authorName?: string;
  authorImage?: string | null;
  canDelete: boolean;
  isDeleting: boolean;
  confirmingDelete: boolean;
  onClose: () => void;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}

function formatDateTime(dateString?: string) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Full-screen photo viewer with author details and an owner-only delete action. */
export default function PhotoLightbox({
  photo,
  authorName,
  authorImage,
  canDelete,
  isDeleting,
  confirmingDelete,
  onClose,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: PhotoLightboxProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-0 sm:p-6 backdrop-blur-md"
      onClick={onClose}
    >
      {/* Close Button */}
      <button className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white p-2 z-50 transition-colors bg-black/20 rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div
        className="bg-white rounded-none sm:rounded-3xl overflow-hidden shadow-2xl w-full h-full sm:h-auto sm:max-w-5xl sm:max-h-[90vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Area */}
        <div className="relative w-full md:w-2/3 h-[50vh] md:h-auto bg-zinc-100 flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-zinc-100">
          <Image
            src={cldOptimized(photo.imageUrl)}
            alt="Enlarged view"
            width={1200}
            height={1200}
            className="object-contain w-full h-full max-h-[85vh] rounded-lg"
          />
        </div>

        {/* Details Area */}
        <div className="w-full md:w-1/3 flex flex-col p-6 sm:p-8 bg-white h-auto md:h-full overflow-y-auto pb-32">
          {/* Author */}
          <div className="flex items-center gap-3 mb-6 border-b border-zinc-100 pb-6 shrink-0">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-100 border border-zinc-200">
              {authorImage ? (
                <Image src={authorImage} fill className="object-cover" alt="User" />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-zinc-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                    <path
                      fillRule="evenodd"
                      d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <span className="block font-bold text-zinc-900 text-base">{authorName}</span>
            </div>
          </div>

          {/* Like */}
          <div className="mb-5">
            <LikeButton
              photoId={photo.id}
              initialLiked={photo.likedByMe}
              initialCount={photo.likeCount}
            />
          </div>

          {/* Caption */}
          <div className="flex-1 min-h-[50px]">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Caption</h4>
            {photo.caption ? (
              <p className="text-zinc-800 text-base leading-relaxed font-medium">{photo.caption}</p>
            ) : (
              <p className="text-zinc-400 text-sm italic">No caption provided.</p>
            )}
          </div>

          {/* Timestamp + Delete */}
          <div className="mt-6 pt-6 border-t border-zinc-100 shrink-0 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wide font-bold mb-1">Posted on</p>
              <p className="text-zinc-900 font-semibold">{formatDateTime(photo.createdAt)}</p>
            </div>

            {canDelete && (
              <button
                onClick={onRequestDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title="Delete Photo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path
                    fillRule="evenodd"
                    d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.49 1.478l-.56 12.73a5.75 5.75 0 01-5.75 5.75h-3.16a5.75 5.75 0 01-5.75-5.75l-.56-12.73a48.848 48.848 0 01-3.388-.512.75.75 0 11.49-1.478 48.856 48.856 0 013.976-.57c.303-.15.638-.285.995-.405l.169-.06c.646-.226 1.344-.337 2.05-.337.706 0 1.404.111 2.05.337l.169.06c.357.12.692.255.995.405.286.109.589.2.903.256zM12 2.25a.75.75 0 01.75.75v1.5h-1.5v-1.5A.75.75 0 0112 2.25z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}

            {confirmingDelete && (
              <ConfirmDeleteModal loading={isDeleting} onCancel={onCancelDelete} onConfirm={onConfirmDelete} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
