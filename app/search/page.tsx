"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/Skeleton";
import { PAGINATION } from "@/lib/constants";
import type { PublicUser } from "@/types/models";
import { Search, User, ArrowRight } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query.trim(), 300);
  const enabled = debounced.length >= PAGINATION.SEARCH_MIN_QUERY_LENGTH;

  const {
    data: users = [],
    isLoading,
    isValidating,
  } = useSWR<PublicUser[]>(
    enabled ? `/api/search?q=${encodeURIComponent(debounced)}` : null,
    fetcher,
    { keepPreviousData: true }
  );

  const showSkeletons = enabled && isLoading;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#E2DFD7] pb-4 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-[#181716]">
          Find Creators
        </h1>
        <p className="text-xs font-mono text-[#6C6860] mt-1">
          Search the creator by username.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-[#FAF9F6] border border-[#DCD8CE] p-4 shadow-sm space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8880]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="e.g. alex, studio..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-white border border-[#D4D0C6] rounded-none text-sm font-mono text-[#181716] placeholder:text-[#9A968E] focus:outline-none focus:border-[#181716] transition-all"
          />
          {isValidating && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
              <div className="w-4 h-4 border-2 border-[#181716]/20 border-t-[#181716] rounded-full animate-spin" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-[#8C8880]">
        </div>
      </div>

      {/* Results Container */}
      <div className="bg-[#FAF9F6] border border-[#DCD8CE] shadow-sm overflow-hidden">
        {showSkeletons ? (
          <div className="divide-y divide-[#EAE7DF]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="w-10 h-10 rounded-full bg-[#EAE7DF] shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3 w-32 bg-[#EAE7DF]" />
                  <Skeleton className="h-2 w-20 bg-[#EAE7DF]" />
                </div>
              </div>
            ))}
          </div>
        ) : !enabled ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-xs font-mono text-[#8C8880] uppercase tracking-wider">
              Type at least 2 characters to search the archive
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-xs font-mono text-[#8C8880] uppercase tracking-wider">
              No creators found for &ldquo;{debounced}&rdquo;
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EAE7DF]">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                className="flex items-center gap-4 p-4 bg-[#FAF9F6] hover:bg-[#F2EFE9] transition-colors duration-150 group"
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[#DCD8CE] bg-[#EAE7DF]">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.username}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8C8880]">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs font-bold tracking-wider text-[#181716] group-hover:underline underline-offset-4 truncate">
                      @{user.username}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#8C8880] uppercase tracking-wider">
                    VIEW ARCHIVE PROFILE
                  </span>
                </div>

                <ArrowRight className="w-4 h-4 text-[#8C8880] group-hover:text-[#181716] group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
