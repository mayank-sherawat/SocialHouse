import { Skeleton } from "@/components/ui/Skeleton";

/** Instant skeleton shown while a user's profile is fetched server-side. */
export default function UserProfileLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10 mb-12">
          <Skeleton className="w-24 h-24 sm:w-36 sm:h-36 rounded-full shrink-0" />
          <div className="flex-1 w-full space-y-4">
            <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
            <div className="flex justify-center sm:justify-start gap-8">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-64 mx-auto sm:mx-0" />
          </div>
        </div>

        <div className="border-t border-gray-200 mb-8" />

        {/* Posts grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
