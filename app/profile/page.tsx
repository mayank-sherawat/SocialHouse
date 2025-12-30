"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Inter } from "next/font/google";

// Initialize font
const inter = Inter({ subsets: ["latin"] });

type Photo = {
  id: string;
  imageUrl: string;
  caption?: string | null;
  createdAt?: string;
  userId?: string;
};

// Updated Type to include counts
type Me = {
  id: string;
  username: string;
  email: string;
  image?: string | null;
  _count?: {

    followers: number;
    following: number;
  };
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const [me, setMe] = useState<Me | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [postFile, setPostFile] = useState<File | null>(null);

  const [caption, setCaption] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  useEffect(() => {
    if (!session?.user?.id) return;

    (async () => {
      try {
        const res = await fetch("/api/me");
        if (res.ok) setMe(await res.json());
      } catch (err) {
        console.error(err);
      }
    })();

    (async () => {
      try {
        const res = await fetch(
          `/api/photos?userId=${encodeURIComponent(session.user.id)}`
        );
        if (res.ok) setPhotos(await res.json());
      } catch (err) {
        console.error(err);
      }
    })();
  }, [session?.user?.id]);

  if (!session)
    return (
      <div className={`flex min-h-screen items-center justify-center bg-zinc-50 ${inter.className}`}>
        <p className="text-zinc-400">Please log in.</p>
      </div>
    );

  const handleProfilePicUpload = async () => {
    if (!avatarFile) return alert("Select an image");
    const formData = new FormData();
    formData.append("file", avatarFile);

    const res = await fetch("/api/profile/uploadImage", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const fresh = await fetch("/api/me");
      if (fresh.ok) setMe(await fresh.json());
      alert("Profile picture updated!");
      setAvatarFile(null);
    } else {
      alert("Failed to upload");
    }
  };

  const handleUploadPhoto = async () => {
    if (!postFile) return alert("Select a file");
    const formData = new FormData();
    formData.append("file", postFile);
    formData.append("caption", caption);

    const res = await fetch("/api/cloudinary/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const created = await res.json();
      setPhotos((p) => [created, ...p]);
      setCaption("");
      setPostFile(null);
    } else {
      alert("Upload failed");
    }
  };

  return (
    <div className={`min-h-screen bg-zinc-50/50 pt-6 px-4 pb-32 sm:py-10 sm:px-6 ${inter.className}`}>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* --- HEADER CARD --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
          {/* Cover Image */}
          <div className="h-25 sm:h-30 bg-teal-100 relative">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] background-size:[16px_16px]"></div>
          </div>

          <div className="px-6 pb-8 bg-teal-100">
            <div className="relative flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-20 gap-4 sm:gap-8">
              {/* Avatar */}
              <div className="relative shrink-0 z-10">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full ring-4 ring-white overflow-hidden bg-white shadow-lg border border-zinc-100">
                  {me?.image ? (
                    <Image
                      src={me.image}
                      alt="Profile"
                      fill
                      className="object-cover rounded-full"
                      
                    />
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

                {/* --- ADDED: FOLLOWERS & FOLLOWING --- */}
                <div className="flex items-center justify-center sm:justify-start gap-6 mt-4">
                  <div className="flex flex-col sm:items-start items-center">
                    <span className="text-lg font-bold text-zinc-900">
                      {me?._count?.followers ?? 0}
                    </span>
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                      Followers
                    </span>
                  </div>
                  <div className="flex flex-col sm:items-start items-center">
                    <span className="text-lg font-bold text-zinc-900">
                      {me?._count?.following ?? 0}
                    </span>
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                      Following
                    </span>
                  </div>
                </div>
                {/* ------------------------------------ */}

              </div>

              {/* Sign Out Button */}
              <div className="w-full sm:w-auto mt-4 sm:mt-0 sm:mb-4">
                <button
                  onClick={() => signOut({ callbackUrl: "/auth" })}
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
                onClick={handleProfilePicUpload}
                disabled={!avatarFile}
                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-base font-bold rounded-2xl transition shadow-sm active:scale-[0.99]"
              >
                Save New Profile
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
                onClick={handleUploadPhoto}
                disabled={!postFile}
                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-base font-bold rounded-2xl transition shadow-sm active:scale-[0.99]"
              >
                Upload Post
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

          {photos.length === 0 ? (
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
                    src={p.imageUrl}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={p.caption ?? "photo"}
                    
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Desktop Hover Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 hidden sm:block">
                    <p className="text-white text-sm font-medium truncate">
                      {p.caption || "No caption"}
                    </p>
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

  {/* --- RESPONSIVE LIGHTBOX MODAL --- */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-0 sm:p-6 backdrop-blur-md"
          onClick={() => setSelectedPhoto(null)}
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div
            className="bg-white rounded-none sm:rounded-3xl overflow-hidden shadow-2xl w-full h-full sm:h-auto sm:max-w-5xl sm:max-h-[90vh] flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Area */}
            <div className="relative w-full md:w-2/3 h-[50vh] md:h-auto bg-zinc-100 flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-zinc-100">
              <Image
                src={selectedPhoto.imageUrl}
                alt="Enlarged view"
                width={1200}
                height={1200}
                className="object-contain w-full h-full max-h-[85vh] rounded-lg"
                
              />
            </div>

            {/* Details Area - Added pb-24 to fix cut-off content */}
            <div className="w-full md:w-1/3 flex flex-col p-6 sm:p-8 bg-white h-auto md:h-full overflow-y-auto pb-32">
              {/* Modal User Info */}
              <div className="flex items-center gap-3 mb-6 border-b border-zinc-100 pb-6 shrink-0">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-100 border border-zinc-200">
                  {me?.image ? (
                    <Image
                      src={me.image}
                      fill
                      className="object-cover"
                      alt="User"
                      
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-zinc-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-8 h-8"
                      >
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
                  <span className="block font-bold text-zinc-900 text-base">
                    {me?.username}
                  </span>
                </div>
              </div>

              {/* Caption */}
              <div className="flex-1 min-h-[50px]">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                  Caption
                </h4>
                {selectedPhoto.caption ? (
                  <p className="text-zinc-800 text-base leading-relaxed font-medium">
                    {selectedPhoto.caption}
                  </p>
                ) : (
                  <p className="text-zinc-400 text-sm italic">
                    No caption provided.
                  </p>
                )}
              </div>

              {/* Timestamp Footer */}
              <div className="mt-6 pt-6 border-t border-zinc-100 shrink-0">
                <p className="text-xs text-zinc-400 uppercase tracking-wide font-bold mb-1">
                  Posted on
                </p>
                <p className="text-zinc-900 font-semibold">
                  {formatDateTime(selectedPhoto.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}