import { cn } from "@/lib/utils";

/** Base shimmer block. Compose these to build skeleton screens. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-zinc-200/70", className)} />;
}
