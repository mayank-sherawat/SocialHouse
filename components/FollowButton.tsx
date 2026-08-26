"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserCheck, UserPlus } from "lucide-react";

interface Props {
  userId: string;
  isFollowing: boolean;
}

export default function FollowButton({ userId, isFollowing }: Props) {
  const [following, setFollowing] = useState(isFollowing);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const toggleFollow = async () => {
    const next = !following;
    setFollowing(next); // optimistic

    try {
      const res = await fetch(next ? "/api/follow" : "/api/unfollow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("request failed");

      // Re-fetch server data (followers count, feed, etc.)
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setFollowing(!next); // revert on failure
      toast.error("Something went wrong updating follow status.");
    }
  };

  return (
    <button
      type="button"
      onClick={toggleFollow}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 px-4 py-1.5 font-mono text-xs uppercase tracking-wider font-bold transition-all active:scale-95 disabled:opacity-60 ${
        following
          ? "bg-[#F2EFE9] border border-[#DCD8CE] text-[#181716] hover:bg-[#FEE2E2] hover:text-[#DC2626] hover:border-[#FCA5A5]"
          : "bg-[#181716] hover:bg-[#2C2A28] text-[#FAF9F6]"
      }`}
    >
      {following ? (
        <>
          <UserCheck className="w-3.5 h-3.5" />
          <span>FOLLOWING</span>
        </>
      ) : (
        <>
          <UserPlus className="w-3.5 h-3.5" />
          <span>FOLLOW</span>
        </>
      )}
    </button>
  );
}
