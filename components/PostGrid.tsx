"use client";

import { useState } from "react";
import Image from "next/image";
import { cldOptimized } from "@/lib/cloudinary-url";
import LikeButton from "@/components/LikeButton";
import { X, Calendar } from "lucide-react";

interface Photo {
  id: string;
  imageUrl: string;
  caption?: string | null;
  createdAt?: Date | string | null;
  likeCount: number;
  likedByMe: boolean;
}

export default function PostGrid({ photos }: { photos: Photo[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  return (
    <>
      {/* --- GRID VIEW --- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="group relative cursor-pointer bg-[#EAE7DF] border border-[#DCD8CE] overflow-hidden aspect-square transition-all duration-300"
          >
            <Image
              src={cldOptimized(photo.imageUrl)}
              alt={photo.caption || "Gallery Print"}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />

            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3 text-white">
              <div className="flex justify-end">
                <span className="font-mono text-[10px] bg-black/60 px-2 py-0.5 backdrop-blur-sm">
                  VIEW
                </span>
              </div>
              <div className="space-y-1">
                {photo.caption && (
                  <p className="text-xs font-mono line-clamp-2 leading-tight">
                    {photo.caption}
                  </p>
                )}
                {photo.createdAt && (
                  <div className="flex items-center gap-1 text-[10px] font-mono text-white/80">
                    <Calendar className="w-2.5 h-2.5" />
                    <span>{new Date(photo.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- LIGHTBOX MODAL --- */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-50 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Modal Content Container */}
          <div
            className="bg-[#FAF9F6] border border-[#DCD8CE] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Area */}
            <div className="relative w-full flex-1 min-h-[50vh] bg-[#EAE7DF] flex items-center justify-center p-3 border-b border-[#DCD8CE]">
              <Image
                src={cldOptimized(selectedPhoto.imageUrl)}
                alt="Enlarged view"
                width={1200}
                height={1200}
                className="object-contain w-auto h-auto max-h-[65vh] sm:max-h-[75vh]"
              />
            </div>

            {/* Caption Area */}
            <div className="p-5 bg-[#FAF9F6] flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-3">
                <LikeButton
                  photoId={selectedPhoto.id}
                  initialLiked={selectedPhoto.likedByMe}
                  initialCount={selectedPhoto.likeCount}
                />
                {selectedPhoto.createdAt && (
                  <span className="font-mono text-xs text-[#8C8880] uppercase tracking-wider">
                    {new Date(selectedPhoto.createdAt).toLocaleDateString(undefined, {
                      dateStyle: "medium",
                    })}
                  </span>
                )}
              </div>

              {selectedPhoto.caption && (
                <p className="font-mono text-xs leading-relaxed text-[#181716]">
                  {selectedPhoto.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}