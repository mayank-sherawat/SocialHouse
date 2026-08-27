"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import { PROFILE } from "@/lib/constants";
import { User, Mail, ShieldCheck, Eye, EyeOff, Loader2, LogOut } from "lucide-react";

type Props = {
  user: {
    username: string;
    email: string;
    bio: string | null;
  };
};

export default function SettingsForm({ user }: Props) {
  const { update: updateSession } = useSession();
  const [username, setUsername] = useState(user.username);
  const [email] = useState(user.email);
  const [bio, setBio] = useState(user.bio ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (password && !currentPassword) {
      toast.error("Please enter your current password to set a new one");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Saving account changes...");

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          bio,
          ...(password ? { password, currentPassword } : {}),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(data?.error || "Failed to update settings", { id: toastId });
        return;
      }

      // Sync the NextAuth session token immediately if username changed
      if (username !== user.username) {
        await updateSession?.({ username });
      }

      toast.success("Settings updated successfully.", { id: toastId });
      setPassword("");
      setCurrentPassword("");
    } catch {
      toast.error("Something went wrong updating settings.", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* ────────────────────────────────────────────────────────────
          1. IDENTITY SECTION
          ──────────────────────────────────────────────────────────── */}
      <div className="bg-[#FAF9F6] border border-[#DCD8CE] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-[#EAE7DF] pb-3">
          <User className="w-4 h-4 text-[#8C8880]" />
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#181716]">
            Creator Identity
          </h2>
        </div>

        {/* Username */}
        <div className="space-y-1">
          <label className="block font-mono text-[11px] uppercase tracking-wider text-[#5A564E]">
            Username Handle
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#D4D0C6] rounded-none text-sm font-mono text-[#181716] placeholder:text-[#9A968E] focus:outline-none focus:border-[#181716] transition-colors"
            placeholder="johndoe"
          />
        </div>

        {/* Email (Read Only) */}
        <div className="space-y-1">
          <label className="block font-mono text-[11px] uppercase tracking-wider text-[#5A564E]">
            Registered Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C8880]">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              disabled
              value={email}
              className="w-full pl-9 pr-3.5 py-2.5 bg-[#F2EFE9] border border-[#EAE7DF] rounded-none text-sm font-mono text-[#78746C] cursor-not-allowed opacity-80"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#5A564E]">
              Creator Bio
            </label>
            <span
              className={`text-[10px] font-mono ${
                bio.length >= PROFILE.BIO_MAX_LENGTH ? "text-[#C62828]" : "text-[#8C8880]"
              }`}
            >
              {bio.length} / {PROFILE.BIO_MAX_LENGTH}
            </span>
          </div>
          <textarea
            maxLength={PROFILE.BIO_MAX_LENGTH}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full p-3 bg-white border border-[#D4D0C6] rounded-none text-xs font-mono text-[#181716] placeholder:text-[#9A968E] focus:outline-none focus:border-[#181716] transition-colors resize-none"
            placeholder="Tell us a little about your photography and stories..."
          />
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          2. SECURITY & PASSWORD SECTION
          ──────────────────────────────────────────────────────────── */}
      <div className="bg-[#FAF9F6] border border-[#DCD8CE] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-[#EAE7DF] pb-3">
          <ShieldCheck className="w-4 h-4 text-[#8C8880]" />
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#181716]">
            Password &amp; Security
          </h2>
        </div>

        {/* Current Password */}
        <div className="space-y-1">
          <label className="block font-mono text-[11px] uppercase tracking-wider text-[#5A564E]">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Required when setting new password"
              className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-[#D4D0C6] rounded-none text-sm text-[#181716] placeholder:text-[#9A968E] focus:outline-none focus:border-[#181716] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8880] hover:text-[#181716] p-1 transition-colors"
            >
              {showCurrentPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1">
          <label className="block font-mono text-[11px] uppercase tracking-wider text-[#5A564E]">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep unchanged"
              className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-[#D4D0C6] rounded-none text-sm text-[#181716] placeholder:text-[#9A968E] focus:outline-none focus:border-[#181716] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8880] hover:text-[#181716] p-1 transition-colors"
            >
              {showNewPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-4 bg-[#181716] hover:bg-[#2C2A28] active:scale-[0.99] disabled:opacity-50 text-[#FAF9F6] font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>SAVING PREFERENCES...</span>
          </>
        ) : (
          <span>SAVE ACCOUNT CHANGES &rarr;</span>
        )}
      </button>

      {/* Session Management / Sign Out */}
      <div className="pt-6 border-t border-[#E2DFD7] space-y-2">
        <div className="font-mono text-[10px] uppercase tracking-wider text-[#8C8880]">
          SESSION MANAGEMENT
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full py-3 px-4 bg-[#F2EFE9] hover:bg-[#FEE2E2] text-[#8C8880] hover:text-[#DC2626] border border-[#DCD8CE] hover:border-[#FCA5A5] font-mono text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>SIGN OUT OF CURRENT SESSION</span>
        </button>
      </div>
    </form>
  );
}