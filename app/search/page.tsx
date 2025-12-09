"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type UserResult = {
  id: string;
  username: string;
  email: string;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Debounce: wait 400ms after user stops typing
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    timerRef.current = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?username=${encodeURIComponent(query)}`
        );

        if (!res.ok) {
          // try to read json error if available
          const text = await res.text();
          throw new Error(text || "Search failed");
        }

        // typed response
        const body: { users?: UserResult[] } = await res.json();
        setResults(body.users ?? []);
        setError(null);
      } catch (err: unknown) {
        // Narrow unknown -> string safely
        const message = err instanceof Error ? err.message : String(err);
        console.error("Search error:", message);
        setError(message || "Search error");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [query]);

  return (
    // Changed: Reduced vertical padding on mobile (py-6) vs desktop (sm:py-12)
    <div className="max-w-2xl mx-auto py-6 sm:py-12 px-4">
      {/* Changed: Reduced card padding on mobile (p-4) vs desktop (sm:p-6) */}
      <div className="bg-linear-to-br from-white to-slate-50 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-xl sm:text-2xl font-semibold mb-4 text-slate-800 text-center">
          Search users
        </h1>

        <div className="relative">
          <label htmlFor="search" className="sr-only">
            Search by username
          </label>
          <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-2 shadow-sm">
            <svg
              className="w-5 h-5 text-slate-300 ml-2 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M21 21l-4.35-4.35"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="11"
                cy="11"
                r="6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <input
              id="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username"
              className="flex-1 bg-transparent outline-none p-2 text-slate-700 placeholder-slate-400 min-w-0"
            />

            <div className="pr-2 shrink-0">
              {loading ? (
                <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M12 2v4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 18v4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.25"
                    />
                    <path
                      d="M4.93 4.93l2.83 2.83"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.6"
                    />
                  </svg>
                  <span className="sr-only">Searching</span>
                </span>
              ) : (
                <button
                  onClick={() => setQuery("")}
                  className="text-sm text-slate-400 hover:text-slate-600 transition"
                  aria-label="Clear search"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          {error && (
            <div className="rounded-md bg-rose-50 border border-rose-100 p-3 text-rose-700 text-sm">
              {error}
            </div>
          )}

          {!loading &&
            results.length === 0 &&
            query.trim().length > 0 &&
            !error && (
              <div className="mt-3 rounded-md bg-slate-50 border border-slate-100 p-4 text-slate-500 text-sm text-center">
                No users found.
              </div>
            )}

          <div className="mt-3 space-y-3">
            {results.map((u) => (
              <Link
                key={u.id}
                href={`/profile/${encodeURIComponent(u.username)}`}
                className="block p-3 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Added min-w-0 to allow truncation of long usernames */}
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 truncate">
                      {u.username}
                    </p>
                  </div>
                  <div className="text-sm text-sky-600 font-medium shrink-0">
                    View
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}