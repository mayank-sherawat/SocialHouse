// app/feed/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth");

  const photos = await prisma.photo.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { username: true, email: true, image: true } },
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header (Mobile only) */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-slate-100 md:hidden">
        <div className="px-4 py-3 flex justify-center items-center">
          <h1 className="text-lg font-semibold text-slate-800">Feed</h1>
        </div>
      </div>

      {/* 🔹 CHANGED: Increased max-width from 470px to 2xl for better PC view */}
      <main className="max-w-2xl mx-auto pb-12 pt-6 px-4 sm:px-6 lg:px-8">
        {photos.length === 0 ? (
          /* 🔹 CHANGED: Added color to the empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-100 shadow-sm mt-8">
            <div className="bg-indigo-50 p-4 rounded-full mb-4">
              <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-slate-700 font-semibold text-lg">No posts yet.</p>
            <p className="text-slate-500 mt-2">Be the first to share a photo!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {photos.map((photo) => (
              <article
                key={photo.id}
                /* 🔹 CHANGED: Softer borders, rounder corners, and added hover shadow */
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {/* --- Post Header --- */}
                <header className="flex items-center justify-between p-4">
                  <Link href={`/profile/${photo.user.username}`} className="flex items-center gap-3 group">
                    <div className="relative w-10 h-10">
                      {photo.user.image ? (
                        <Image 
                          src={photo.user.image} 
                          alt={photo.user.username} 
                          fill
                          className="rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div
                          className="w-full h-full rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
                          // Kept the nice gradient
                          style={{
                            background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                          }}
                        >
                          {photo.user.username?.[0]?.toUpperCase() ?? "U"}
                        </div>
                      )}
                    </div>
                    
                    {/* 🔹 CHANGED: Added Indigo hover color */}
                    <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {photo.user.username}
                    </span>
                  </Link>

                  <button className="text-slate-400 hover:text-indigo-600 transition-colors p-2 -mr-2">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </button>
                </header>

                {/* --- Post Image --- */}
                <div className="relative bg-slate-100 aspect-square max-h-[650px]">
                  <Image
                    src={photo.imageUrl}
                    alt={photo.caption || "Post content"}
                    width={900}
                    height={900}
                    className="w-full h-full object-cover"
                    unoptimized
                    priority={true}
                  />
                </div>

                {/* --- Content Section --- */}
                <div className="p-5">
                  {/* Caption */}
                  <div className="text-slate-800 leading-relaxed mb-3">
                    <Link href={`/profile/${photo.user.username}`} className="font-bold mr-2 hover:text-indigo-600 transition-colors">
                      {photo.user.username}
                    </Link>
                    <span>{photo.caption}</span>
                  </div>

                  {/* Date & Time Display */}
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                    {photo.createdAt
                      ? new Date(photo.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "Just now"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}