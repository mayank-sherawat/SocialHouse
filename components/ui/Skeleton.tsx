import { cn } from "@/lib/utils";

/** Base shimmer block for archival skeleton loading states. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-none bg-[#EAE7DF]", className)} />;
}
