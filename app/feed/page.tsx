import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getFeedPage } from "@/lib/feed";
import FeedPost from "@/components/FeedPost";
import FeedLoadMore from "@/components/FeedLoadMore";
import Link from "next/link";
import { Compass, Camera } from "lucide-react";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // Page 1 is server-rendered for a fast first paint; further pages stream in
  // client-side via FeedLoadMore.
  const { items, nextCursor } = await getFeedPage(session.user.id);

  return (
    <div className="w-full">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Timeline Header */}
        <div className="flex items-center justify-between border-b border-[#E2DFD7] pb-4 px-1">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8C8880]">
              CHRONOLOGICAL TIMELINE
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#181716]">
              Your Feed
            </h1>
          </div>
          <Link
            href="/search"
            className="px-3.5 py-1.5 bg-[#F2EFE9] hover:bg-[#EAE7DF] border border-[#DCD8CE] text-[#181716] font-mono text-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>EXPLORE</span>
          </Link>
        </div>

        {items.length === 0 ? (
          /* Empty Timeline State */
          <div className="bg-[#FAF9F6] border border-[#DCD8CE] p-12 text-center space-y-4 shadow-sm my-6">
            <div className="w-12 h-12 bg-[#F2EFE9] border border-[#DCD8CE] mx-auto flex items-center justify-center text-[#6C6860]">
              <Camera className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-mono text-sm uppercase tracking-wider font-bold text-[#181716]">
                TIMELINE IS EMPTY
              </h3>
              <p className="text-xs font-mono text-[#6C6860] max-w-sm mx-auto leading-relaxed">
                You are not following any creators yet. Explore the archive directory to follow fellow photographers.
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#181716] hover:bg-[#2C2A28] text-[#FAF9F6] font-mono text-xs uppercase tracking-wider font-bold transition-all active:scale-95 mt-2"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>DISCOVER CREATORS &rarr;</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {items.map((photo, index) => (
              <FeedPost key={photo.id} photo={photo} priority={index < 2} />
            ))}
            <FeedLoadMore initialCursor={nextCursor} />
          </div>
        )}
      </div>
    </div>
  );
}
