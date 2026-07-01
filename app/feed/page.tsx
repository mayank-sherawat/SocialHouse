import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getFeedPage } from "@/lib/feed";
import FeedPost from "@/components/FeedPost";
import FeedLoadMore from "@/components/FeedLoadMore";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // Page 1 is server-rendered for a fast first paint; further pages stream in
  // client-side via FeedLoadMore.
  const { items, nextCursor } = await getFeedPage(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto pt-6 px-0 sm:px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 px-4 sm:px-0">Your Feed</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No posts yet. Follow someone to get started!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {items.map((photo) => (
              <FeedPost key={photo.id} photo={photo} />
            ))}
            <FeedLoadMore initialCursor={nextCursor} />
          </div>
        )}
      </div>
    </div>
  );
}
