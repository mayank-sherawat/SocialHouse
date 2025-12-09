import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Image from "next/image";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function UserProfilePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth");

  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: { photos: true },
  });

  if (!user) return <p className="text-center mt-10">User not found</p>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* PROFILE HEADER */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm bg-gray-50">
              {user.image ? (
                <Image
                  src={user.image}
                  width={128}
                  height={128}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Photo
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold leading-tight">
                  @{user.username}
                </h1>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
              <div>
                <span className="font-semibold text-gray-800">
                  {user.photos.length}
                </span>{" "}
                posts
              </div>
            </div>

            {user?.photos && user.photos.length > 0 && (
              <p className="mt-3 text-sm text-gray-500 line-clamp-2">
                Latest post: {user.photos[0].caption ?? "—"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* POSTS GRID */}
      <h2 className="text-lg font-semibold mb-4">Posts</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {user.photos.map((photo) => (
          <div key={photo.id} className="flex flex-col group">
            {/* Image Container */}
            <div className="relative w-full pb-[100%] overflow-hidden rounded-lg bg-gray-100 border border-gray-100 shadow-sm">
              <Image
                src={photo.imageUrl}
                alt={photo.caption ?? ""}
                fill
                className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
            </div>

            {/* Caption & Time Info */}
            <div className="mt-2 px-0.5">
              <p className="text-sm font-medium text-gray-900 truncate">
                {photo.caption || (
                  <span className="text-gray-400 font-normal italic">
                    No caption
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(photo.createdAt ?? new Date()).toLocaleDateString(
                  undefined,
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}