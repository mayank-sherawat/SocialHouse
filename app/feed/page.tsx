// app/feed/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth");

  const photos = await prisma.photo.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { username: true, email: true } },
    },
  });

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-[#F5F7FA] pb-4 pt-6">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-2xl font-semibold text-slate-800 text-center">
            Latest Posts
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-10">
        {photos.length === 0 ? (
          <p className="text-center text-slate-500 mt-6">No photos yet.</p>
        ) : (
          <div className="space-y-8 mt-4">
            {photos.map((photo) => (
              <article
                key={photo.id}
                className="rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-sm hover:shadow-md transition"
              >
                {/* Header */}
                <header className="flex items-center gap-4 p-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{
                      background:
                        "linear-gradient(135deg,#60A5FA 0%, #7C3AED 100%)",
                    }}
                    aria-hidden
                  >
                    {photo.user.username?.[0]?.toUpperCase() ?? "U"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">
                      {photo.user.username}
                    </p>
                    <p className="text-xs text-slate-400">
                      {photo.createdAt
                        ? new Date(photo.createdAt).toLocaleDateString()
                        : ""}
                    </p>
                  </div>

                  {/* static action icons (UI-only) */}
                  <div className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-slate-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </div>
                </header>

                {/* Photo */}
                <div className="bg-slate-50">
                  <div className="w-full max-h-[520px] relative">
                    <Image
                      src={photo.imageUrl}
                      alt={photo.caption || "Post image"}
                      width={900}
                      height={600}
                      className="w-full object-cover max-h-[520px]"
                      unoptimized
                    />
                  </div>
                </div>

                {/* Caption */}
                <div className="p-4">
                  <p className="text-slate-800 text-sm leading-relaxed">
                    <span className="font-semibold mr-2">
                      {photo.user.username}
                    </span>
                    <span className="text-slate-700">{photo.caption}</span>
                  </p>

                  {/* placeholder meta row (UI-only) */}
                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                    <span>• {photo.createdAt ? new Date(photo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
                    <span>• Public</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
