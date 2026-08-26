import { prisma } from "@/lib/prisma";
import ProfileBio from "@/components/ProfileBio";
import FollowButton from "@/components/FollowButton";
import PostGrid from "@/components/PostGrid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User, Camera, Settings } from "lucide-react";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function UserProfilePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      photos: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { likes: true } },
          likes: { where: { userId: session.user.id }, select: { id: true } },
        },
      },
      followers: {
        where: {
          followerId: session.user.id,
        },
      },
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    return (
      <div className="bg-[#FAF9F6] border border-[#DCD8CE] p-12 text-center my-12 space-y-3">
        <User className="w-8 h-8 text-[#8C8880] mx-auto" />
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#181716]">
          CREATOR NOT FOUND
        </h2>
        <p className="font-mono text-xs text-[#6C6860]">
          The requested creator username does not exist in our archive.
        </p>
      </div>
    );
  }

  const isFollowing = user.followers.length > 0;
  const isOwner = session.user.id === user.id;

  const photos = user.photos.map((p) => ({
    id: p.id,
    imageUrl: p.imageUrl,
    caption: p.caption,
    createdAt: p.createdAt,
    likeCount: p._count.likes,
    likedByMe: p.likes.length > 0,
  }));

  return (
    <div className="w-full space-y-8">
      {/* --- PROFILE HEADER CARD --- */}
      <div className="bg-[#FAF9F6] border border-[#DCD8CE] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#DCD8CE] bg-[#EAE7DF]">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.username}
                  fill
                  sizes="(max-width: 640px) 96px, 112px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#8C8880]">
                  <User className="w-10 h-10" />
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#181716]">
                  @{user.username}
                </h1>
              </div>

              {/* Action Button */}
              <div>
                {!isOwner ? (
                  <FollowButton userId={user.id} isFollowing={isFollowing} />
                ) : (
                  <Link
                    href="/settings"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#F2EFE9] hover:bg-[#EAE7DF] border border-[#DCD8CE] text-[#181716] font-mono text-xs uppercase tracking-wider font-semibold transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>EDIT PROFILE</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Metrics */}
            <div className="flex items-center justify-center sm:justify-start gap-8 font-mono border-y border-[#EAE7DF] py-2.5">
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
                  {user._count.followers}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#8C8880]">
                  Followers
                </span>
              </div>
              <div className="flex flex-col items-center sm:items-start">
                <span className="text-base font-bold text-[#181716] tabular-nums">
                  {user._count.following}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#8C8880]">
                  Following
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="pt-1">
              <ProfileBio bio={user.bio} isOwner={isOwner} />
            </div>
          </div>
        </div>
      </div>

      {/* --- GALLERY SECTION --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2DFD7] pb-3 px-1">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#181716]">
              Photographic Prints
            </h2>
          </div>
          <span className="font-mono text-xs font-bold px-2.5 py-1 bg-[#F2EFE9] border border-[#DCD8CE] text-[#181716]">
            {photos.length} {photos.length === 1 ? "PRINT" : "PRINTS"}
          </span>
        </div>

        {photos.length > 0 ? (
          <PostGrid photos={photos} />
        ) : (
          <div className="bg-[#FAF9F6] border border-dashed border-[#DCD8CE] py-16 text-center space-y-2">
            <Camera className="w-8 h-8 text-[#8C8880] mx-auto" />
            <p className="font-mono text-xs uppercase tracking-wider font-bold text-[#181716]">
              No published prints yet
            </p>
            <p className="text-xs font-mono text-[#6C6860]">
              @{user.username} hasn&rsquo;t uploaded any photographs to their archive yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}