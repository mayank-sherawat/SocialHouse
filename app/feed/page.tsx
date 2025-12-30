import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// Fixed: Added specific type 'Date' to the parameter
function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth");

  const photos = await prisma.photo.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        {
          user: {
            followers: {
              some: {
                followerId: session.user.id,
              },
            },
          },
        },
      ],
    },
    include: {
      user: {
        select: {
          username: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Changed max-w-lg to max-w-2xl for a wider view */}
      <div className="max-w-2xl mx-auto pt-6 px-0 sm:px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 px-4 sm:px-0">
          Your Feed
        </h1>

        <div className="space-y-8">
          {photos.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">
                No posts yet. Follow someone to get started!
              </p>
            </div>
          ) : (
            photos.map((photo) => (
              <article
                key={photo.id}
                className="bg-white border-b sm:border border-gray-200 sm:rounded-xl overflow-hidden shadow-sm"
              >
                {/* Post Header - Now Clickable */}
                <div className="p-4">
                  <Link
                    href={`/profile/${photo.user.username}`}
                    className="flex items-center gap-3 w-fit group"
                  >
                    <div className="relative h-10 w-10 rounded-full overflow-hidden border border-gray-100 bg-gray-50">
                      {photo.user.image ? (
                        <Image
                          src={photo.user.image}
                          alt={`${photo.user.username}'s profile`}
                          fill
                          className="object-cover group-hover:opacity-90 transition-opacity"
                          unoptimized
                        />
                      ) : (
                        /* Fallback Avatar Icon */
                        <div className="flex items-center justify-center w-full h-full text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-6 h-6"
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
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-gray-900 group-hover:underline">
                        {photo.user.username}
                      </span>
                      {photo.createdAt && (
                        <span className="text-xs text-gray-500">
                          {formatDate(photo.createdAt)}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>

                {/* Main Image */}
                <div className="w-full bg-gray-100">
                  <Image
                    src={photo.imageUrl}
                    alt={photo.caption || "User post"}
                    width={1000}
                    height={1000}
                    className="w-full h-auto object-cover max-h-[700px]"
                    unoptimized
                  />
                </div>

                {/* Caption Area (Buttons removed) */}
                {photo.caption && (
                  <div className="p-4 pt-3">
                    <div className="text-sm text-gray-800 leading-relaxed">
                      <Link
                        href={`/profile/${photo.user.username}`}
                        className="font-bold mr-2 text-gray-900 hover:underline"
                      >
                        {photo.user.username}
                      </Link>
                      {photo.caption}
                    </div>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}