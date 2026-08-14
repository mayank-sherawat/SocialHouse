"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { fetcher } from "@/lib/fetcher";
import type { Me, Photo } from "@/types/models";

/**
 * Profile data + mutations, backed by SWR.
 *
 * SWR gives us caching, request dedup and background revalidation (navigating
 * back to the profile shows cached data instantly). Mutations update the cache
 * optimistically and surface feedback via toasts. `isUploading*`/`isDeleting`
 * remain local so buttons can show per-action spinners.
 */
export function useProfile(userId: string | undefined) {
  const { data: me, isLoading: meLoading, mutate: mutateMe } = useSWR<Me>(
    userId ? "/api/me" : null,
    fetcher
  );

  const {
    data: photos = [],
    isLoading: photosLoading,
    mutate: mutatePhotos,
  } = useSWR<Photo[]>(
    userId ? `/api/photos?userId=${encodeURIComponent(userId)}` : null,
    fetcher
  );

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingPost, setIsUploadingPost] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function uploadAvatar(file: File): Promise<boolean> {
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/profile/uploadImage", { method: "POST", body: formData });
      if (!res.ok) {
        toast.error("Failed to update profile picture");
        return false;
      }
      await mutateMe();
      toast.success("Profile picture updated");
      return true;
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function uploadPost(file: File, caption: string): Promise<boolean> {
    setIsUploadingPost(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caption", caption);
      const res = await fetch("/api/cloudinary/upload", { method: "POST", body: formData });
      if (!res.ok) {
        toast.error("Upload failed");
        return false;
      }
      const created = (await res.json()) as Omit<Photo, "likeCount" | "likedByMe">;
      const newPhoto: Photo = { ...created, likeCount: 0, likedByMe: false };
      // Prepend the new photo to the cache without a refetch.
      await mutatePhotos((prev = []) => [newPhoto, ...prev], { revalidate: false });
      toast.success("Post uploaded");
      return true;
    } finally {
      setIsUploadingPost(false);
    }
  }

  async function deletePhoto(id: string): Promise<boolean> {
    setIsDeleting(true);
    try {
      await mutatePhotos(
        async (prev = []) => {
          const res = await fetch(`/api/photos/${id}/delete`, { method: "DELETE" });
          if (!res.ok) throw new Error("delete failed");
          return prev.filter((p) => p.id !== id);
        },
        {
          optimisticData: (prev = []) => prev.filter((p) => p.id !== id),
          rollbackOnError: true,
          revalidate: false,
        }
      );
      toast.success("Photo deleted");
      return true;
    } catch {
      toast.error("Failed to delete photo");
      return false;
    } finally {
      setIsDeleting(false);
    }
  }

  return {
    me,
    photos,
    isLoading: meLoading || photosLoading,
    isUploadingAvatar,
    isUploadingPost,
    isDeleting,
    uploadAvatar,
    uploadPost,
    deletePhoto,
  };
}
