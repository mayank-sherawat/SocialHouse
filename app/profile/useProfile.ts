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
    const toastId = toast.loading("Processing and updating avatar...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/profile/uploadImage", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Failed to update profile picture", { id: toastId });
        return false;
      }
      await mutateMe();
      toast.success("Profile avatar updated successfully.", { id: toastId });
      return true;
    } catch {
      toast.error("Network error updating avatar.", { id: toastId });
      return false;
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function uploadPost(file: File, caption: string): Promise<boolean> {
    setIsUploadingPost(true);
    const toastId = toast.loading("Uploading and archiving photograph...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caption", caption);
      const res = await fetch("/api/cloudinary/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Upload failed. Please try again.", { id: toastId });
        return false;
      }
      const created = (await res.json()) as Omit<Photo, "likeCount" | "likedByMe">;
      const newPhoto: Photo = { ...created, likeCount: 0, likedByMe: false };
      // Prepend the new photo to the cache without a refetch.
      await mutatePhotos((prev = []) => [newPhoto, ...prev], { revalidate: false });
      toast.success("Photographic print published to gallery.", { id: toastId });
      return true;
    } catch {
      toast.error("Network error during upload.", { id: toastId });
      return false;
    } finally {
      setIsUploadingPost(false);
    }
  }

  async function deletePhoto(id: string): Promise<boolean> {
    setIsDeleting(true);
    const toastId = toast.loading("Removing print from archive...");
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
      toast.success("Photograph removed.", { id: toastId });
      return true;
    } catch {
      toast.error("Failed to delete photo.", { id: toastId });
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
