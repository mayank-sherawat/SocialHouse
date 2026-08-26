"use client";

import Image from "next/image";
import type { Photo } from "@/types/models";
import { cldOptimized } from "@/lib/cloudinary-url";
import LikeButton from "@/components/LikeButton";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { X, Trash2, User, Clock } from "lucide-react";

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

/** Full-screen photo viewer with author details and owner-only delete action. */
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-50 transition-colors"
      >
        <X className="w-7 h-7" />
      </button>

      <div
        className="bg-[#FAF9F6] border border-[#DCD8CE] shadow-2xl w-full h-full sm:h-auto sm:max-w-5xl sm:max-h-[90vh] flex flex-col md:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Area */}
        <div className="relative w-full md:w-2/3 h-[50vh] md:h-auto bg-[#EAE7DF] flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-[#DCD8CE]">
          <Image
            src={cldOptimized(photo.imageUrl)}
            alt="Enlarged view"
            width={1400}
            height={1400}
            className="object-contain w-full h-full max-h-[80vh]"
          />
        </div>

        {/* Details Area */}
        <div className="w-full md:w-1/3 flex flex-col p-6 sm:p-8 bg-[#FAF9F6] h-auto md:h-full overflow-y-auto justify-between">
          <div className="space-y-6">
            {/* Author */}
            <div className="flex items-center gap-3 border-b border-[#EAE7DF] pb-4">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#EAE7DF] border border-[#DCD8CE] shrink-0">
                {authorImage ? (
                  <Image src={authorImage} fill sizes="40px" className="object-cover" alt="Author" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-[#8C8880]">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#8C8880]">
                  PHOTOGRAPHER
                </span>
                <span className="font-mono text-sm font-bold text-[#181716]">
                  @{authorName}
                </span>
              </div>
            </div>

            {/* Like Button */}
            <div>
              <LikeButton
                photoId={photo.id}
                initialLiked={photo.likedByMe}
                initialCount={photo.likeCount}
              />
            </div>

            {/* Caption */}
            <div className="space-y-1.5">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#8C8880]">
                PHOTOGRAPHIC NOTES
              </div>
              {photo.caption ? (
                <p className="font-mono text-xs leading-relaxed text-[#181716] whitespace-pre-wrap">
                  {photo.caption}
                </p>
              ) : (
                <p className="font-mono text-xs text-[#8C8880] italic">
                  No caption documented.
                </p>
              )}
            </div>
          </div>

          {/* Footer Metadata & Delete Button */}
          <div className="mt-8 pt-4 border-t border-[#EAE7DF] flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-mono text-[9px] uppercase tracking-wider text-[#8C8880]">
                RECORD TIMESTAMP
              </div>
              <div className="flex items-center gap-1 font-mono text-[11px] text-[#181716]">
                <Clock className="w-3 h-3 text-[#8C8880]" />
                <span>{formatDateTime(photo.createdAt)}</span>
              </div>
            </div>

            {canDelete && (
              <button
                type="button"
                onClick={onRequestDelete}
                className="p-2 text-[#C62828] hover:bg-[#FEE2E2] border border-transparent hover:border-[#FCA5A5] transition-colors"
                title="Delete Photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {confirmingDelete && (
              <ConfirmDeleteModal
                loading={isDeleting}
                onCancel={onCancelDelete}
                onConfirm={onConfirmDelete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
