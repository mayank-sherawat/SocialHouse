"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import type { Photo } from "@/types/models";
import PhotoLightbox from "@/components/PhotoLightbox";
import { Skeleton } from "@/components/ui/Skeleton";
import { cldOptimized } from "@/lib/cloudinary-url";
import { useProfile } from "./useProfile";

export default function ProfilePage() {
  const { data: session } = useSession();
  const {
    me,
    photos,
    isLoading,
    isUploadingAvatar,
    isUploadingPost,
    isDeleting,
    uploadAvatar,
    uploadPost,
    deletePhoto,
  } = useProfile(session?.user?.id);

  // UI-only state.
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [postFile, setPostFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [deletePhotoId, setDeletePhotoId] = useState<string | null>(null);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-400">Please log in.</p>
      </div>
    );
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return toast.error("Select an image first");
    if (await uploadAvatar(avatarFile)) setAvatarFile(null);
  };

  const handlePostUpload = async () => {
    if (!postFile) return toast.error("Select a file first");
    if (await uploadPost(postFile, caption)) {
      setCaption("");
      setPostFile(null);
    }
  };

  const handleDelete = async () => {
    if (!deletePhotoId) return;
    if (await deletePhoto(deletePhotoId)) {
      if (selectedPhoto?.id === deletePhotoId) setSelectedPhoto(null);
      setDeletePhotoId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 pt-6 px-4 pb-32 sm:py-10 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* --- HEADER CARD --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="h-25 sm:h-30 bg-teal-100 relative">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] background-size:[16px_16px]"></div>
          </div>

          <div className="px-6 pb-8 bg-teal-100">
            <div className="relative flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-20 gap-4 sm:gap-8">
              {/* Avatar */}
              <div className="relative shrink-0 z-10">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full ring-4 ring-white overflow-hidden bg-white shadow-lg border border-zinc-100">
                  {me?.image ? (
                    <Image src={me.image} alt="Profile" fill className="object-cover rounded-full" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-zinc-300 bg-zinc-50">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* User Details */}
              <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0 sm:mb-2 w-full">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                  {me?.username ?? session.user.username}
                </h1>
                <p className="text-zinc-500 font-medium text-base sm:text-lg mt-1">
                  {me?.email ?? session.user.email}
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-6 mt-4">
                  <div className="flex flex-col sm:items-start items-center">
                    <span className="text-lg font-bold text-zinc-900">{me?._count?.followers ?? 0}</span>
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Followers</span>
                  </div>
                  <div className="flex flex-col sm:items-start items-center">
                    <span className="text-lg font-bold text-zinc-900">{me?._count?.following ?? 0}</span>
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Following</span>
                  </div>
                </div>
              </div>

              {/* Sign Out */}
              <div className="w-full sm:w-auto mt-4 sm:mt-0 sm:mb-4">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white bg-red-600 hover:bg-red-700 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- UPLOAD SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card A: Avatar */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-zinc-200 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-zinc-900">Profile Picture</h2>
            </div>

            <div className="flex-1 flex flex-col justify-end space-y-5">
              <label className="group flex flex-col items-center justify-center w-full h-40 sm:h-48 border-2 border-dashed border-zinc-200 rounded-3xl cursor-pointer bg-zinc-50/50 hover:bg-blue-50/30 hover:border-blue-200 transition-all duration-300">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4 w-full">
                  <p className="text-sm sm:text-base text-zinc-500 font-medium group-hover:text-blue-600 transition-colors w-full truncate">
                    {avatarFile ? (
                      <span className="text-zinc-900 font-bold">{avatarFile.name}</span>
                    ) : (
                      "Click to select Picture"
                    )}
                  </p>
                </div>
              </label>

              <button
                onClick={handleAvatarUpload}
                disabled={!avatarFile || isUploadingAvatar}
                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-base font-bold rounded-2xl transition shadow-sm active:scale-[0.99]"
              >
                {isUploadingAvatar ? "Uploading..." : "Save New Profile"}
              </button>
            </div>
          </div>

          {/* Card B: Post */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-zinc-200 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-zinc-900">New Post</h2>
            </div>

            <div className="flex-1 flex flex-col space-y-5">
              <label className="group flex flex-col items-center justify-center w-full h-32 sm:h-40 border-2 border-dashed border-zinc-200 rounded-3xl cursor-pointer bg-zinc-50/50 hover:bg-blue-50/30 hover:border-blue-200 transition-all duration-300">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPostFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <div className="text-center px-4 w-full">
                  <p className="text-sm sm:text-base text-zinc-500 font-medium w-full truncate group-hover:text-blue-600 transition-colors">
                    {postFile ? (
                      <span className="text-zinc-900 font-bold">{postFile.name}</span>
                    ) : (
                      "Select photo to upload"
                    )}
                  </p>
                </div>
              </label>

              <input
                type="text"
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-zinc-400"
              />

              <button
                onClick={handlePostUpload}
                disabled={!postFile || isUploadingPost}
                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-base font-bold rounded-2xl transition shadow-sm active:scale-[0.99]"
              >
                {isUploadingPost ? "Uploading..." : "Upload Post"}
              </button>
            </div>
          </div>
        </div>

        {/* --- GALLERY SECTION --- */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-200 pb-4 px-2">
            <h2 className="text-2xl font-bold text-zinc-900">Your Gallery</h2>
            <span className="text-sm font-bold px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full">
              {photos.length}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-2xl" />
              ))}
            </div>
          ) : photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-zinc-300 text-center mx-2 sm:mx-0">
              <p className="text-zinc-900 font-bold text-lg">No photos yet</p>
              <p className="text-zinc-500 mt-1">Upload your first memory above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {photos.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPhoto(p)}
                  className="group relative cursor-pointer bg-zinc-100 rounded-2xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-lg transition-all duration-300 aspect-square"
                >
                  <Image
                    src={cldOptimized(p.imageUrl)}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={p.caption ?? "photo"}
                  />

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 hidden sm:block">
                    <p className="text-white text-sm font-medium truncate">{p.caption || "No caption"}</p>
                    <p className="text-white/80 text-[10px] mt-0.5">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedPhoto && (
        <PhotoLightbox
          photo={selectedPhoto}
          authorName={me?.username}
          authorImage={me?.image}
          canDelete={session.user.id === selectedPhoto.userId}
          isDeleting={isDeleting}
          confirmingDelete={deletePhotoId !== null}
          onClose={() => setSelectedPhoto(null)}
          onRequestDelete={() => setDeletePhotoId(selectedPhoto.id)}
          onCancelDelete={() => setDeletePhotoId(null)}
          onConfirmDelete={handleDelete}
        />
      )}
    </div>
  );
}
