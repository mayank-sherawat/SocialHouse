"use client";

import { useState } from "react";
import Image from "next/image";

interface Photo {
  id: string;
  imageUrl: string;
  caption?: string | null;
  createdAt?: Date | string | null;
}

export default function PostGrid({ photos }: { photos: Photo[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  return (
    <>
      {/* --- GRID VIEW --- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="flex flex-col group">
            {/* Image Thumbnail */}
            <div
              onClick={() => setSelectedPhoto(photo)}
              className="relative w-full aspect-square cursor-pointer bg-gray-100 rounded-lg overflow-hidden border border-gray-100"
            >
              <Image
                src={photo.imageUrl}
                alt={photo.caption || "Post"}
                fill
                className="object-cover transition-opacity duration-300 group-hover:opacity-90"
                unoptimized
              />
            </div>
            
            {/* Grid Caption (Visible on Mobile & Desktop) */}
            <div className="mt-2 px-1">
               <p className="text-sm text-gray-900 line-clamp-1 break-all">
                {photo.caption || <span className="text-gray-400 italic">No caption</span>}
               </p>
            </div>
          </div>
        ))}
      </div>

      {/* --- LIGHTBOX MODAL --- */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          {/* Close Button */}
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Modal Content Container */}
          <div 
            className="bg-white rounded-lg overflow-hidden shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Image Area - White Background to fix dark logos */}
            <div className="relative w-full flex-1 min-h-[50vh] bg-white flex items-center justify-center p-2">
               <Image
                src={selectedPhoto.imageUrl}
                alt="Enlarged view"
                width={1200}
                height={1200}
                className="object-contain w-auto h-auto max-h-[70vh] sm:max-h-[80vh]"
                unoptimized
              />
            </div>
            
            {/* Caption Area - Below image, white bg, black text */}
            {selectedPhoto.caption && (
              <div className="p-4 border-t border-gray-100 bg-white">
                <p className="text-gray-900 text-sm sm:text-base font-medium">
                  {selectedPhoto.caption}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedPhoto.createdAt 
                    ? new Date(selectedPhoto.createdAt).toLocaleDateString() 
                    : ""}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}