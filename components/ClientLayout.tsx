"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import logoImg from "@/public/logo.png";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import {
  Compass,
  Search,
  User,
  Settings,
  LogOut,
} from "lucide-react";

interface NavLinkProps {
  href: string;
  active: boolean;
  label: string;
  icon: React.ReactNode;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password");

  if (isAuthPage) {
    return <>{children}</>;
  }

  const isActive = (p: string) => pathname === p || (p !== "/" && pathname.startsWith(p + "/"));

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#181716] antialiased selection:bg-[#181716] selection:text-[#FAF9F6]">
      {/* Global Desktop Keyboard Shortcuts */}
      <KeyboardShortcuts />

      {/* ────────────────────────────────────────────────────────────
          MOBILE TOP HEADER (Light Editorial)
          ──────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 md:hidden bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E2DFD7]">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="w-8" />
          <Link href="/feed" className="flex items-center justify-center group py-1">
            <Image
              src={logoImg}
              alt="SocialHouse"
              className="h-9 w-auto object-contain mx-auto"
              priority
            />
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-8 h-8 flex items-center justify-center text-[#8C8880] hover:text-[#DC2626] active:scale-90 transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ────────────────────────────────────────────────────────────
          DESKTOP SIDEBAR (Warm Gallery Linen)
          ──────────────────────────────────────────────────────────── */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:w-64 md:flex md:flex-col md:bg-[#F2EFE9] md:border-r md:border-[#E2DFD7] z-30">
        {/* Masthead Branding */}
        <div className="h-20 flex items-center justify-center px-4 border-b border-[#E2DFD7]">
          <Link href="/feed" className="flex items-center justify-center group w-full">
            <Image
              src={logoImg}
              alt="SocialHouse"
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-200 mx-auto"
              priority
            />
          </Link>
        </div>

        {/* Nav Links */}
        <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {/* Main Group */}
          <div>
            <div className="px-3 text-[10px] font-mono font-semibold text-[#8C8880] uppercase tracking-[0.15em] mb-2.5">
              NAVIGATION
            </div>
            <nav className="flex flex-col gap-1">
              <SidebarLink
                href="/feed"
                active={isActive("/feed")}
                label="Timeline Feed"
                icon={<Compass className="w-4 h-4" />}
              />
              <SidebarLink
                href="/search"
                active={isActive("/search")}
                label="Explore Creators"
                icon={<Search className="w-4 h-4" />}
              />
              <SidebarLink
                href="/profile"
                active={isActive("/profile")}
                label="Personal Gallery"
                icon={<User className="w-4 h-4" />}
              />
            </nav>
          </div>

          {/* Preferences Group */}
          <div>
            <div className="px-3 text-[10px] font-mono font-semibold text-[#8C8880] uppercase tracking-[0.15em] mb-2.5">
              PREFERENCES
            </div>
            <nav className="flex flex-col gap-1">
              <SidebarLink
                href="/settings"
                active={isActive("/settings")}
                label="Account Settings"
                icon={<Settings className="w-4 h-4" />}
              />
            </nav>
          </div>
        </div>

        {/* Colophon Footer with Logout */}
        <div className="p-4 border-t border-[#E2DFD7] text-[10px] font-mono text-[#8C8880] space-y-3">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-mono text-[#6C6860] hover:text-[#DC2626] bg-[#FAF9F6]/80 hover:bg-[#FEE2E2]/60 border border-[#DCD8CE] hover:border-[#FCA5A5] transition-all active:scale-[0.98] group"
          >
            <span className="font-semibold uppercase tracking-wider group-hover:text-[#DC2626]">
              SIGN OUT
            </span>
            <LogOut className="w-3.5 h-3.5 text-[#8C8880] group-hover:text-[#DC2626] transition-colors" />
          </button>

          <div className="flex items-center justify-between text-[9px] text-[#8C8880] pt-1">
            <span>ISSUE 04 &bull; 2026</span>
            <span>CURATED &bull; AD-FREE</span>
          </div>
        </div>
      </aside>

      {/* ────────────────────────────────────────────────────────────
          MAIN VIEWPORT CONTENT WRAPPER
          ──────────────────────────────────────────────────────────── */}
      <main className="pt-16 md:pt-0 md:pl-64 min-h-screen pb-20 md:pb-10 transition-all duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>

      {/* ────────────────────────────────────────────────────────────
          MOBILE BOTTOM NAV (Tactile Porcelain Pill)
          ──────────────────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#FAF9F6]/95 backdrop-blur-lg border-t border-[#E2DFD7] flex justify-around items-center px-4 py-2.5 md:hidden z-40 safe-area-bottom">
        <MobileNavLink
          href="/feed"
          active={isActive("/feed")}
          label="Feed"
          icon={<Compass className="w-5 h-5" />}
        />
        <MobileNavLink
          href="/search"
          active={isActive("/search")}
          label="Search"
          icon={<Search className="w-5 h-5" />}
        />
        <MobileNavLink
          href="/profile"
          active={isActive("/profile")}
          label="Profile"
          icon={<User className="w-5 h-5" />}
        />
        <MobileNavLink
          href="/settings"
          active={isActive("/settings")}
          label="Settings"
          icon={<Settings className="w-5 h-5" />}
        />
      </nav>
    </div>
  );
}

function SidebarLink({ href, active, label, icon }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`group flex items-center justify-between px-3 py-2.5 text-xs font-mono tracking-wider transition-all duration-150 rounded-none border ${
        active
          ? "bg-[#FAF9F6] text-[#181716] font-bold border-[#DCD8CE] shadow-sm translate-x-1"
          : "text-[#5A564E] hover:text-[#181716] hover:bg-[#EAE7DF] border-transparent"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`transition-colors ${
            active ? "text-[#181716]" : "text-[#8C8880] group-hover:text-[#181716]"
          }`}
        >
          {icon}
        </span>
        <span className="uppercase">{label}</span>
      </div>
      {active && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#181716] animate-pulse" />
      )}
    </Link>
  );
}

function MobileNavLink({ href, active, label, icon }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
        active ? "text-[#181716] font-bold" : "text-[#8C8880] hover:text-[#181716]"
      }`}
    >
      <div
        className={`p-1 transition-all ${
          active
            ? "bg-[#181716] text-[#FAF9F6] rounded-none shadow-sm"
            : "text-[#6C6860]"
        }`}
      >
        {icon}
      </div>
      <span className="text-[10px] font-mono uppercase tracking-wider">
        {label}
      </span>
    </Link>
  );
}