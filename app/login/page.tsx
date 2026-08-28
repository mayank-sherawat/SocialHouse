"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import logoImg from "@/public/logo.png";

function formatAuthError(error?: string | null): string {
  if (!error) return "Invalid email or password. Please try again.";
  if (error === "CredentialsSignin") {
    return "Invalid email or password. Please check your credentials.";
  }
  if (error === "SessionRequired") {
    return "Please sign in to access this page.";
  }
  if (error === "OAuthAccountNotLinked") {
    return "An account with this email already exists with another provider.";
  }
  return error;
}

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get("error");
      if (urlError) {
        setErrorMessage(formatAuthError(urlError));
      }
    }
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!form.email || !form.password) {
      toast.error("Please enter both your email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (res?.ok) {
        const params = new URLSearchParams(window.location.search);
        const target = params.get("callbackUrl") || "/feed";
        window.location.href = target;
      } else {
        const friendly = formatAuthError(res?.error);
        setErrorMessage(friendly);
        toast.error(friendly);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      const msg = "An unexpected error occurred. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen w-full bg-[#FAF9F6] text-[#181716] flex flex-col lg:flex-row antialiased selection:bg-[#181716] selection:text-[#FAF9F6] overflow-y-auto lg:overflow-hidden">
      {/* ────────────────────────────────────────────────────────────
          LEFT COLUMN: EDITORIAL PHOTOGRAPHY CHAMBER (Desktop Light)
          ──────────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:w-1/2 bg-[#F2EFE9] text-[#181716] flex-col justify-between p-8 xl:p-12 border-r border-[#E2DFD7] relative overflow-hidden h-full">
        {/* Archival Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(#181716 1px, transparent 1px), linear-gradient(to right, #181716 1px, transparent 1px)",
            backgroundSize: "32px 32px, 64px 64px",
          }}
        />

        {/* Masthead Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-[#E2DFD7] pb-4">
          <Link href="/" className="group flex items-center gap-3">
            <span className="font-mono text-xs tracking-[0.25em] uppercase text-[#6C6860] group-hover:text-[#181716] transition-colors font-bold">
              SOCIALHOUSE
            </span>
          </Link>
          <span className="font-mono text-[11px] text-[#8C8880] uppercase tracking-wider">
            ISSUE 04 &bull; PHOTO FEED
          </span>
        </div>

        {/* Archival Photo Frame */}
        <div className="relative z-10 my-auto py-2 max-w-sm mx-auto w-full">
          <div className="bg-[#FAF9F6] border border-[#DCD8CE] p-4 shadow-sm space-y-3">
            {/* Registration Marks */}
            <div className="flex items-center justify-between text-[10px] font-mono text-[#78746C] tracking-widest border-b border-[#EAE7DF] pb-2">
              <span>+ REC 024 &bull; 35MM</span>
              <span>1/500s &bull; f/2.8 &bull; ISO 400</span>
            </div>

            {/* Photo Container */}
            <div className="relative aspect-[4/3] w-full bg-[#EAE7DF] overflow-hidden border border-[#DCD8CE] flex items-center justify-center group">
              <Image
                src={logoImg}
                alt="SocialHouse Photographic Print"
                className="w-48 h-auto object-contain opacity-90 group-hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>

            {/* Gallery Label Caption */}
            <div className="space-y-1 pt-0.5">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold tracking-tight text-[#181716]">
                  A quiet room for visual work.
                </h2>
                <span className="font-mono text-[10px] text-[#78746C]">FIG. A</span>
              </div>
              <p className="text-xs text-[#6C6860] leading-relaxed">
                Chronological, unhurried, and uncluttered. A dedicated home for photographers and friends.
              </p>
            </div>
          </div>
        </div>

        {/* Editorial Footer */}
        <div className="relative z-10 flex items-center justify-between border-t border-[#E2DFD7] pt-4 text-[11px] font-mono text-[#8C8880]">
          <span>EST. 2025</span>
          <span>CURATED &bull; ZERO ADS &bull; CHRONOLOGICAL</span>
        </div>
      </aside>

      {/* ────────────────────────────────────────────────────────────
          RIGHT COLUMN: AUTHENTICATION CHAMBER (Responsive Light)
          ──────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-[#FAF9F6] text-[#181716] h-full overflow-y-auto lg:overflow-hidden">
        {/* Mobile Masthead */}
        <div className="lg:hidden flex items-center justify-center border-b border-[#E2DFD7] pb-4 mb-6">
          <Link href="/feed" className="flex items-center justify-center group">
            <Image
              src={logoImg}
              alt="SocialHouse"
              className="h-9 w-auto object-contain mx-auto"
              priority
            />
          </Link>
        </div>

        {/* Center Auth Form */}
        <div className="w-full max-w-sm mx-auto my-auto py-2">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-1.5">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8C8880]">
                AUTHENTICATION
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#181716]">
                Sign In
              </h1>
              <p className="text-xs text-[#6C6860] leading-relaxed">
                Enter your registered credentials to access your archive.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-xs font-mono flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" />
                <div className="flex-1 leading-snug">{errorMessage}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#5A564E]">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@domain.com"
                  value={form.email}
                  onChange={(e) => {
                    setErrorMessage(null);
                    setForm({ ...form, email: e.target.value });
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D4D0C6] rounded-none text-sm text-[#181716] placeholder:text-[#9A968E] focus:outline-none focus:border-[#181716] transition-colors"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#5A564E]">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-mono text-[#78746C] hover:text-[#181716] transition-colors underline underline-offset-4"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => {
                      setErrorMessage(null);
                      setForm({ ...form, password: e.target.value });
                    }}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-[#D4D0C6] rounded-none text-sm text-[#181716] placeholder:text-[#9A968E] focus:outline-none focus:border-[#181716] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78746C] hover:text-[#181716] p-1 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#181716] hover:bg-[#2C2A28] active:scale-[0.99] text-[#FAF9F6] font-mono text-xs tracking-[0.15em] uppercase font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <span>ENTER ARCHIVE</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-150" />
                  </>
                )}
              </button>
            </form>

            {/* Alternate Action Divider */}
            <div className="pt-3 border-t border-[#E2DFD7] flex items-center justify-between text-xs font-mono text-[#6C6860]">
              <span>NO ACCOUNT YET?</span>
              <Link
                href="/register"
                className="font-bold text-[#181716] hover:underline underline-offset-4 flex items-center gap-1 group"
              >
                <span>CREATE ONE</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-150" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E2DFD7] pt-3 text-[10px] font-mono text-[#8C8880] flex flex-col sm:flex-row items-center justify-between gap-1">
          <span>&copy; {new Date().getFullYear()} SOCIALHOUSE</span>
          <span>SECURE &bull; ENCRYPTED SESSION</span>
        </div>
      </main>
    </div>
  );
}