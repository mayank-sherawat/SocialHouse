"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";

type Photo = {
  id: string;
  imageUrl: string;
  caption?: string | null;
  createdAt?: string;
  userId?: string;
};

type Me = {
  id: string;
  username: string;
  email: string;
  image?: string | null;
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const [me, setMe] = useState<Me | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);

  // fetch fresh user info (including image)
  useEffect(() => {
    if (!session?.user?.id) return;

    (async () => {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data: Me = await res.json();
          setMe(data);
        } else {
          console.error("Failed to fetch /api/me", await res.text());
        }
      } catch (err) {
        console.error("Error fetching /api/me", err);
      }
    })();
  }, [session?.user?.id]);

  // Load the user's photos by userId (preferred)
  useEffect(() => {
    if (!session?.user?.id) return;

    (async () => {
      try {
        const res = await fetch(
          `/api/photos?userId=${encodeURIComponent(session.user.id)}`
        );
        if (!res.ok) {
          console.error("Failed to fetch photos", await res.text());
          return;
        }
        const data = await res.json();
        setPhotos(data);
      } catch (err) {
        console.error("fetch photos error:", err);
      }
    })();
  }, [session?.user?.id]);

  if (!session)
    return <p className="text-center mt-10 text-gray-600">Please log in.</p>;

  // Upload profile picture
  const handleProfilePicUpload = async () => {
    if (!file) return alert("Select an image");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/profile/uploadImage", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      // fetch fresh user info so avatar updates immediately
      const fresh = await fetch("/api/me");
      if (fresh.ok) setMe(await fresh.json());
      alert("Profile picture updated!");
    } else {
      const t = await res.text();
      alert("Failed to upload profile pic: " + t);
    }
  };

  // Upload normal photo
  const handleUploadPhoto = async () => {
    if (!file) return alert("Select a file");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("caption", caption);

    const res = await fetch("/api/cloudinary/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const created = await res.json();
      setPhotos((p) => [created, ...p]);
      setCaption("");
      setFile(null);
    } else {
      const text = await res.text();
      alert("Upload failed: " + text);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 sm:py-10">
      {/* PROFILE INFO */}
      {/* Changed: added flex-col for mobile, sm:flex-row for desktop, and text alignment adjustments */}
      <div className="flex flex-col sm:flex-row items-center gap-5 mb-6 bg-linear-to-r from-white to-slate-50 p-6 rounded-2xl shadow-sm border border-slate-100/50">
        <div className="shrink-0 w-24 h-24 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm">
          {me?.image ? (
            <Image
              src={me.image}
              width={96}
              height={96}
              alt="Profile"
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-slate-400">
              <svg
                className="w-10 h-10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M12 12a5 5 0 100-10 5 5 0 000 10z"
                  strokeWidth="1.5"
                ></path>
                <path d="M4 20a8 8 0 0116 0" strokeWidth="1.5"></path>
              </svg>
            </div>
          )}
        </div>

        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-semibold text-slate-800 break-all">
            @{me?.username ?? session.user.username}
          </h1>
          <p className="text-sm text-slate-500 mt-1 break-all">
            {me?.email ?? session.user.email}
          </p>
        </div>
      </div>

      {/* UPLOAD AREAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* UPLOAD PROFILE PICTURE */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <h2 className="font-medium mb-3 text-slate-700">
            Upload Profile Picture
          </h2>

          <label className="flex items-center gap-3 p-3 rounded-md border border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            {/* Added min-w-0 to allow truncation on small screens */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-600">Choose an image</p>
              <p className="text-xs text-slate-400 mt-1 truncate">
                {file ? `Selected: ${file.name}` : "No file selected"}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault(); // prevent label double-click issue
                const inputs = document.querySelectorAll<HTMLInputElement>(
                  'input[type="file"]'
                );
                inputs[0]?.click();
              }}
              className="shrink-0 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white"
              type="button"
            >
              Browse
            </button>
          </label>

          <button
            onClick={handleProfilePicUpload}
            className="mt-3 w-full py-2 rounded-md bg-linear-to-r from-emerald-400 to-cyan-400 text-white font-medium shadow-sm hover:scale-[1.01] active:scale-[0.98] transition"
          >
            Upload
          </button>
        </div>

        {/* UPLOAD NORMAL PHOTO */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <h2 className="font-medium mb-3 text-slate-700">Upload a Photo</h2>

          <label className="flex items-center gap-3 p-3 rounded-md border border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-600">Pick a photo to share</p>
              <p className="text-xs text-slate-400 mt-1 truncate">
                {file ? `Selected: ${file.name}` : "No file selected"}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                const inputs = document.querySelectorAll<HTMLInputElement>(
                  'input[type="file"]'
                );
                inputs[1]?.click();
              }}
              className="shrink-0 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white"
              type="button"
            >
              Browse
            </button>
          </label>

          <input
            type="text"
            placeholder="Caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full p-2 border rounded-md mt-3 text-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-200 text-sm"
          />
          <button
            onClick={handleUploadPhoto}
            className="mt-3 w-full py-2 rounded-md bg-linear-to-r from-sky-400 to-blue-400 text-white font-medium shadow-sm hover:scale-[1.01] active:scale-[0.98] transition"
          >
            Upload Photo
          </button>
        </div>
      </div>

      {/* LOGOUT */}
      <div className="mb-8">
        <button
          onClick={() => signOut({ callbackUrl: "/auth" })}
          className="w-full py-2 rounded-md bg-linear-to-r from-rose-400 to-red-500 text-white font-medium shadow-sm hover:opacity-95 transition"
        >
          Logout
        </button>
      </div>

      {/* USER PHOTOS */}
      <h2 className="text-xl font-semibold mb-4 text-slate-800">
        Your Photos
      </h2>

      {photos.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p className="text-slate-500">No photos yet. Upload your first photo above!</p>
        </div>
      ) : (
        /* Changed: Adjusted gap for mobile and grid sizes */
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {photos.map((p) => (
            <figure
              key={p.id}
              className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Changed: Added sm:h-48 to make images slightly larger on desktop */}
              <div className="w-full h-40 sm:h-48 relative bg-slate-50">
                <Image
                  src={p.imageUrl}
                  fill
                  className="object-cover"
                  alt={p.caption ?? "photo"}
                  unoptimized
                />
              </div>
              <figcaption className="p-2 sm:p-3 text-sm">
                <p className="text-slate-800 truncate font-medium">
                  {p.caption ?? <span className="text-slate-400 font-normal">No caption</span>}
                </p>
                {p.createdAt && (
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}