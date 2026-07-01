import { Skeleton } from "@/components/ui/Skeleton";

/** Instant skeleton shown while the feed's server component fetches photos. */
export default function FeedLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto pt-6 px-0 sm:px-4">
        <Skeleton className="h-8 w-40 mb-6 mx-4 sm:mx-0" />

        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white sm:border border-gray-200 sm:rounded-xl overflow-hidden shadow-sm"
            >
              <div className="p-4 flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
              <Skeleton className="w-full aspect-square rounded-none" />
              <div className="p-4">
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
