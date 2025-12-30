"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  isFollowing: boolean;
}

export default function FollowButton({ userId, isFollowing }: Props) {
  const [following, setFollowing] = useState(isFollowing);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const toggleFollow = async () => {
    // Optimistic UI (instant feedback)
    setFollowing((prev) => !prev);

    await fetch(following ? "/api/unfollow" : "/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    // Re-fetch server data (followers count, feed, etc.)
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <button
      onClick={toggleFollow}
      disabled={isPending}
      className={`
        mt-3 px-5 py-1.5 rounded-full text-sm font-medium
        transition-all duration-300
        ${following
          ? "bg-gray-200 text-gray-800 hover:bg-red-100 hover:text-red-600"
          : "bg-blue-600 text-white hover:bg-blue-700"}
        ${isPending ? "opacity-60 scale-95" : "scale-100"}
      `}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
