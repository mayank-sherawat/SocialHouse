"use client";

import { useSession } from "next-auth/react";
import { useState, useMemo } from "react";
import Image from "next/image";
import { toast } from "sonner";
import type { Photo } from "@/types/models";
import PhotoLightbox from "@/components/PhotoLightbox";
import { Skeleton } from "@/components/ui/Skeleton";
import { cldOptimized, cldBlurPlaceholder } from "@/lib/cloudinary-url";
import { useProfile } from "./useProfile";
import {
  Camera,
  Upload,
  User,
  Image as ImageIcon,
  Calendar,
  X,
  FileCheck,
  Loader2,
} from "lucide-react";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [postFile, setPostFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [deletePhotoId, setDeletePhotoId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"post" | "avatar">("post");

  const postPreview = useMemo(() => {
    return postFile ? URL.createObjectURL(postFile) : null;
  }, [postFile]);

  const avatarPreview = useMemo(() => {
    return avatarFile ? URL.createObjectURL(avatarFile) : null;
  }, [avatarFile]);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] text-xs font-mono text-[#8C8880]">
        <span>AUTHENTICATION REQUIRED</span>
      </div>
    );
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return toast.error("Select an image first");
    if (await uploadAvatar(avatarFile)) setAvatarFile(null);
  };

  const handlePostUpload = async () => {
    if (!postFile) return toast.error("Select a photo first");
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
    <div className="w-full space-y-8">
      {/* ────────────────────────────────────────────────────────────
          1. CREATOR PROFILE HEADER
          ──────────────────────────────────────────────────────────── */}
      <div className="bg-[#FAF9F6] border border-[#DCD8CE] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#DCD8CE] bg-[#EAE7DF]">
              {me?.image ? (
                <Image
                  src={me.image}
                  alt="Profile Avatar"
                  fill
                  sizes="(max-width: 640px) 96px, 112px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-[#8C8880]">
                  <User className="w-10 h-10" />
                </div>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="space-y-0.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#181716]">
                @{me?.username ?? session.user.username}
              </h1>
              <p className="font-mono text-xs text-[#6C6860]">
                {me?.email ?? session.user.email}
              </p>
            </div>

            {/* Metrics Row */}
            <div className="flex items-center justify-center sm:justify-start gap-8 pt-2 font-mono">
              <div className="flex flex-col items-center sm:items-start">
                <span className="text-base font-bold text-[#181716] tabular-nums">
                  {photos.length}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#8C8880]">
                  Prints
                </span>
              </div>
              <div className="flex flex-col items-center sm:items-start">
                <span className="text-base font-bold text-[#181716] tabular-nums">
                  {me?._count?.followers ?? 0}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#8C8880]">
                  Followers
                </span>
              </div>
              <div className="flex flex-col items-center sm:items-start">
                <span className="text-base font-bold text-[#181716] tabular-nums">
                  {me?._count?.following ?? 0}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#8C8880]">
                  Following
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          2. STUDIO MEDIA DISPATCH (Tabs)
          ──────────────────────────────────────────────────────────── */}
      <div className="bg-[#FAF9F6] border border-[#DCD8CE] shadow-sm overflow-hidden">
        {/* Tab Selection */}
        <div className="flex border-b border-[#EAE7DF] bg-[#F2EFE9]">
          <button
            type="button"
            onClick={() => setActiveTab("post")}
            className={`flex-1 py-3 px-4 font-mono text-xs uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-2 border-r border-[#EAE7DF] ${
              activeTab === "post"
                ? "bg-[#FAF9F6] text-[#181716] border-b-2 border-b-[#181716]"
                : "text-[#6C6860] hover:text-[#181716]"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Publish New Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("avatar")}
            className={`flex-1 py-3 px-4 font-mono text-xs uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-2 ${
              activeTab === "avatar"
                ? "bg-[#FAF9F6] text-[#181716] border-b-2 border-b-[#181716]"
                : "text-[#6C6860] hover:text-[#181716]"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Update Profile Avatar</span>
          </button>
        </div>

        {/* Tab 1: New Post */}
        {activeTab === "post" && (
          <div className="p-6 sm:p-8 space-y-5">
            {!postPreview ? (
              <label className="group flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#DCD8CE] hover:border-[#181716] bg-white cursor-pointer transition-colors p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPostFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <Upload className="w-6 h-6 text-[#8C8880] group-hover:text-[#181716] mb-2 transition-colors" />
                <p className="font-mono text-xs text-[#181716] font-semibold">
                  Select Photo
                </p>
                <p className="font-mono text-[10px] text-[#8C8880] mt-0.5">
                  JPEG, PNG, WebP up to 10MB
                </p>
              </label>
            ) : (
              /* Selected Photo Preview Card */
              <div className="bg-white border border-[#DCD8CE] p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-[#EAE7DF] border border-[#DCD8CE] overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={postPreview}
                    alt="Selected preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 font-mono text-[10px] text-[#1B5E20] font-bold">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>PHOTO ATTACHED</span>
                  </div>
                  <p className="font-mono text-xs font-bold text-[#181716] truncate">
                    {postFile?.name}
                  </p>
                  <p className="font-mono text-[10px] text-[#8C8880]">
                    {postFile ? formatFileSize(postFile.size) : ""} &bull; Ready to publish
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <label className="px-3 py-1.5 bg-[#F2EFE9] hover:bg-[#EAE7DF] border border-[#DCD8CE] text-[#181716] font-mono text-xs font-semibold cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPostFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    Change
                  </label>
                  <button
                    type="button"
                    onClick={() => setPostFile(null)}
                    className="p-1.5 text-[#8C8880] hover:text-[#C62828] hover:bg-[#FEE2E2] transition-colors"
                    title="Remove Photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[#5A564E]">
                Caption &amp; Photographic Notes
              </label>
              <input
                type="text"
                placeholder="Camera, film stock, location, or memory..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#D4D0C6] rounded-none text-sm font-mono text-[#181716] placeholder:text-[#9A968E] focus:outline-none focus:border-[#181716] transition-colors"
              />
            </div>

            {/* Upload Progress Bar */}
            {isUploadingPost && (
              <div className="space-y-1.5 p-3 bg-[#F2EFE9] border border-[#DCD8CE]">
                <div className="flex justify-between font-mono text-[10px] text-[#6C6860]">
                  <span className="font-bold text-[#181716]">OPTIMIZING &amp; DISPATCHING TO ARCHIVE...</span>
                  <span className="animate-pulse">PLEASE WAIT</span>
                </div>
                <div className="h-1.5 w-full bg-[#EAE7DF] overflow-hidden">
                  <div className="h-full bg-[#181716] animate-[pulse_1s_ease-in-out_infinite] w-full" />
                </div>
              </div>
            )}

            <button
              onClick={handlePostUpload}
              disabled={!postFile || isUploadingPost}
              className="w-full py-3 px-4 bg-[#181716] hover:bg-[#2C2A28] active:scale-[0.99] disabled:opacity-50 text-[#FAF9F6] font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              {isUploadingPost ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>DISPATCHING TO CLOUD...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>PUBLISH TO GALLERY</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Tab 2: Avatar */}
        {activeTab === "avatar" && (
          <div className="p-6 sm:p-8 space-y-5">
            {!avatarPreview ? (
              <label className="group flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#DCD8CE] hover:border-[#181716] bg-white cursor-pointer transition-colors p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <ImageIcon className="w-6 h-6 text-[#8C8880] group-hover:text-[#181716] mb-2 transition-colors" />
                <p className="font-mono text-xs text-[#181716] font-semibold">
                  Select new avatar
                </p>
                <p className="font-mono text-[10px] text-[#8C8880] mt-0.5">
                  Recommended 400x400px
                </p>
              </label>
            ) : (
              /* Selected Avatar Preview Card */
              <div className="bg-white border border-[#DCD8CE] p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-20 h-20 rounded-full bg-[#EAE7DF] border-2 border-[#DCD8CE] overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 font-mono text-[10px] text-[#1B5E20] font-bold">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>AVATAR ATTACHED</span>
                  </div>
                  <p className="font-mono text-xs font-bold text-[#181716] truncate">
                    {avatarFile?.name}
                  </p>
                  <p className="font-mono text-[10px] text-[#8C8880]">
                    {avatarFile ? formatFileSize(avatarFile.size) : ""} &bull; Ready to upload
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <label className="px-3 py-1.5 bg-[#F2EFE9] hover:bg-[#EAE7DF] border border-[#DCD8CE] text-[#181716] font-mono text-xs font-semibold cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    Change
                  </label>
                  <button
                    type="button"
                    onClick={() => setAvatarFile(null)}
                    className="p-1.5 text-[#8C8880] hover:text-[#C62828] hover:bg-[#FEE2E2] transition-colors"
                    title="Remove Avatar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Avatar Progress Bar */}
            {isUploadingAvatar && (
              <div className="space-y-1.5 p-3 bg-[#F2EFE9] border border-[#DCD8CE]">
                <div className="flex justify-between font-mono text-[10px] text-[#6C6860]">
                  <span className="font-bold text-[#181716]">OPTIMIZING &amp; UPDATING PROFILE AVATAR...</span>
                  <span className="animate-pulse">PLEASE WAIT</span>
                </div>
                <div className="h-1.5 w-full bg-[#EAE7DF] overflow-hidden">
                  <div className="h-full bg-[#181716] animate-[pulse_1s_ease-in-out_infinite] w-full" />
                </div>
              </div>
            )}

            <button
              onClick={handleAvatarUpload}
              disabled={!avatarFile || isUploadingAvatar}
              className="w-full py-3 px-4 bg-[#181716] hover:bg-[#2C2A28] active:scale-[0.99] disabled:opacity-50 text-[#FAF9F6] font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              {isUploadingAvatar ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>UPDATING AVATAR...</span>
                </>
              ) : (
                <span>SAVE NEW AVATAR</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────────
          3. CREATOR GALLERY MATRIX
          ──────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2DFD7] pb-3 px-1">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#181716]">
              Your Archive Gallery
            </h2>
          </div>
          <span className="font-mono text-xs font-bold px-2.5 py-1 bg-[#F2EFE9] border border-[#DCD8CE] text-[#181716]">
            {photos.length} {photos.length === 1 ? "PRINT" : "PRINTS"}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square bg-[#EAE7DF]" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="bg-[#FAF9F6] border border-dashed border-[#DCD8CE] py-16 text-center space-y-2">
            <Camera className="w-8 h-8 text-[#8C8880] mx-auto" />
            <p className="font-mono text-xs uppercase tracking-wider font-bold text-[#181716]">
              No photographs in archive yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPhoto(p)}
                className="group relative cursor-pointer bg-[#EAE7DF] border border-[#DCD8CE] overflow-hidden aspect-square transition-all duration-300"
              >
                <Image
                  src={cldOptimized(p.imageUrl)}
                  fill
                  placeholder="blur"
                  blurDataURL={cldBlurPlaceholder(p.imageUrl)}
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={p.caption ?? "Archival photo"}
                />

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3 text-white">
                  <div className="flex justify-end">
                    <span className="font-mono text-[10px] bg-black/60 px-2 py-0.5 backdrop-blur-sm">
                      VIEW
                    </span>
                  </div>
                  <div className="space-y-1">
                    {p.caption && (
                      <p className="text-xs font-mono line-clamp-2 leading-tight">
                        {p.caption}
                      </p>
                    )}
                    {p.createdAt && (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-white/80">
                        <Calendar className="w-2.5 h-2.5" />
                        <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
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
