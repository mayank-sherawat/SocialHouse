"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const hideNavbar = pathname.startsWith("/auth");

  const isActive = (p: string) => pathname === p || pathname.startsWith(p + "/");

  // UI-only: remove any centered element that exactly reads "Latest posts"
  useEffect(() => {
    if (typeof window === "undefined") return;
    const candidates = Array.from(document.querySelectorAll("h1,h2,h3,p,div,span"));
    candidates.forEach((el) => {
      try {
        if (el.textContent?.trim() === "Latest posts") el.remove();
      } catch {
        /* noop */
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Mobile fixed header with centered logo (does not scroll) */}
      {!hideNavbar && (
        <header className="fixed top-0 left-0 right-0 z-50 md:hidden bg-white/90 backdrop-blur-sm border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-center">
            <div className="h-10 flex items-center">
              <Image src="/logo.png" alt="Logo" width={120} height={36} className="object-contain" />
            </div>
          </div>
        </header>
      )}

      {/* main: keep original padding; pt-14 already accounts for header height */}
      <main className={hideNavbar ? "pt-14" : "pt-14 md:pl-64"}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </main>

      {!hideNavbar && (
        <>
          {/* Desktop Sidebar */}
          <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:w-64 md:flex md:flex-col md:pt-10 md:pb-6 md:bg-white md:border-r md:shadow-sm">
            {/* Logo only (centered, like Instagram) */}
            <div className="px-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-70 h-20 rounded-xl bg-white flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    width={260}
                    height={44}
                    alt="Logo"
                    className="object-contain"
                  />
                </div>
                {/* intentionally no text label */}
              </div>
            </div>

            <div className="px-6">
              <div className="mb-6">
                <div className="text-sm text-gray-500">Navigate</div>
              </div>

              {/* Nav Links - pill style like Instagram */}
              <nav className="flex flex-col gap-3">
                <Link
                  href="/feed"
                  aria-current={isActive("/feed") ? "page" : undefined}
                  className={`relative group flex items-center gap-4 px-4 py-3 rounded-2xl transition
                    ${isActive("/feed")
                      ? "bg-blue-50 text-blue-600 shadow-sm"
                      : "bg-transparent text-gray-700 hover:bg-gray-50"}`}
                >
                  {/* left active bar */}
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-md transition-all
                      ${isActive("/feed") ? "bg-blue-500" : "bg-transparent group-hover:bg-slate-200"}`}
                    aria-hidden
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 10h4l3 8 4-16 3 8h4"/>
                  </svg>
                  <span className="font-medium">Feed</span>
                </Link>

                <Link
                  href="/search"
                  aria-current={isActive("/search") ? "page" : undefined}
                  className={`relative group flex items-center gap-4 px-4 py-3 rounded-2xl transition
                    ${isActive("/search")
                      ? "bg-blue-50 text-blue-600 shadow-sm"
                      : "bg-transparent text-gray-700 hover:bg-gray-50"}`}
                >
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-md transition-all
                      ${isActive("/search") ? "bg-blue-500" : "bg-transparent group-hover:bg-slate-200"}`}
                    aria-hidden
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  <span className="font-medium">Search</span>
                </Link>

                <Link
                  href="/profile"
                  aria-current={isActive("/profile") ? "page" : undefined}
                  className={`relative group flex items-center gap-4 px-4 py-3 rounded-2xl transition
                    ${isActive("/profile")
                      ? "bg-blue-50 text-blue-600 shadow-sm"
                      : "bg-transparent text-gray-700 hover:bg-gray-50"}`}
                >
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-md transition-all
                      ${isActive("/profile") ? "bg-blue-500" : "bg-transparent group-hover:bg-slate-200"}`}
                    aria-hidden
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M5.121 17.804A13.937 13.937 0 0112 15c2.89 0 5.56.88 7.879 2.387M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span className="font-medium">Profile</span>
                </Link>
              </nav>

              <div className="mt-6 px-3">
                <div className="text-xs text-gray-400">Made with ❤️</div>
              </div>
            </div>
          </aside>

          {/* Mobile Bottom Nav */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 shadow-md md:hidden">
            <Link
              href="/feed"
              className={`flex flex-col items-center text-sm transition
                ${isActive("/feed") ? "text-blue-600 font-medium" : "text-gray-600"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
                viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 10h4l3 8 4-16 3 8h4"/>
              </svg>
              <span>Feed</span>
            </Link>

            <Link
              href="/search"
              className={`flex flex-col items-center text-sm transition
                ${isActive("/search") ? "text-blue-600 font-medium" : "text-gray-600"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
                viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <span>Search</span>
            </Link>

            <Link
              href="/profile"
              className={`flex flex-col items-center text-sm transition
                ${isActive("/profile") ? "text-blue-600 font-medium" : "text-gray-600"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
                viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5.121 17.804A13.937 13.937 0 0112 15c2.89 0 5.56.88 7.879 2.387M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span>Profile</span>
            </Link>
          </nav>
        </>
      )}
    </div>
  );
}
