import { prisma } from "@/lib/prisma";
import ProfileBio from "@/components/ProfileBio";
import FollowButton from "@/components/FollowButton";
// Import the new Client Component for the grid
import PostGrid from "@/components/PostGrid"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function UserProfilePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth");

  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      photos: {
        orderBy: { createdAt: "desc" }, // Most recent first
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

  if (!user) return <div className="text-center mt-20 text-gray-500">User not found</div>;

  const isFollowing = user.followers.length > 0;
  const isOwner = session.user.id === user.id;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* --- PROFILE HEADER --- */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10 mb-12">
          
          {/* Avatar Section */}
          <div className="shrink-0">
            <div className="relative w-24 h-24 sm:w-36 sm:h-36 rounded-full overflow-hidden border-gray-200 shadow-sm ring-2 ring-white">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.username}
                  fill
                  className="object-cover"
                  
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="flex-1 w-full text-center sm:text-left">
            {/* Top Row: Username & Action Button */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-5">
              <h1 className="text-2xl sm:text-3xl font-light text-gray-900">
                {user.username}
              </h1>
              {!isOwner && (
                <div className="sm:ml-4">
                  <FollowButton userId={user.id} isFollowing={isFollowing} />
                </div>
              )}
              {isOwner && (
                <Link 
                   href="/settings"
                   className="sm:ml-4 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-semibold rounded-lg transition"
                >
                  Edit Profile
                </Link>
              )}
            </div>

            {/* Stats Row */}
            <ul className="flex justify-center sm:justify-start items-center gap-8 sm:gap-10 text-base mb-5">
              <li className="flex sm:flex-row flex-col items-center sm:gap-1">
                <span className="font-bold text-gray-900">{user.photos.length}</span>
                <span className="text-gray-600">posts</span>
              </li>
              <li className="flex sm:flex-row flex-col items-center sm:gap-1">
                <span className="font-bold text-gray-900">{user._count.followers}</span>
                <span className="text-gray-600">followers</span>
              </li>
              <li className="flex sm:flex-row flex-col items-center sm:gap-1">
                <span className="font-bold text-gray-900">{user._count.following}</span>
                <span className="text-gray-600">following</span>
              </li>
            </ul>

            {/* Bio Section */}
            <div className="text-sm sm:text-base text-gray-800 leading-relaxed max-w-md mx-auto sm:mx-0">
               <ProfileBio
                bio={user.bio}
                isOwner={isOwner}
              />
            </div>
          </div>
        </div>

        {/* --- DIVIDER --- */}
        <div className="border-t border-gray-200 mb-8 flex justify-center">
            <span className="border-t border-black -mt-px py-3 text-xs font-semibold tracking-widest text-gray-500 uppercase flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              Posts
            </span>
        </div>

        {/* --- POSTS GRID (Interactive) --- */}
        {user.photos.length > 0 ? (
          <PostGrid photos={user.photos} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
             </div>
             <h3 className="text-xl font-bold text-gray-900">No Posts Yet</h3>
          </div>
        )}

      </div>
    </div>
  );
}