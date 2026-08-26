"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { PASSWORD, OTP } from "@/lib/constants";
import logoImg from "@/public/logo.png";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"request" | "reset">("request");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const sendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Dispatching recovery code...");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (res.ok) {
        toast.success("If registered, a recovery code was dispatched.", { id: toastId });
        setStep("reset");
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Failed to dispatch recovery code.", { id: toastId });
      }
    } catch {
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otp || !password) {
      toast.error("Please enter the verification code and your new password.");
      return;
    }
    if (password.length < PASSWORD.MIN_LENGTH) {
      toast.error(`Password must be at least ${PASSWORD.MIN_LENGTH} characters.`);
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Verifying code & resetting password...");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          password,
        }),
      });

      if (res.ok) {
        toast.success("Password updated. Please sign in.", { id: toastId });
        router.push("/login");
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Reset failed. Check the verification code.", { id: toastId });
      }
    } catch {
      toast.error("Error updating password.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen w-full bg-[#FAF9F6] text-[#181716] flex flex-col lg:flex-row antialiased selection:bg-[#181716] selection:text-[#FAF9F6] overflow-y-auto lg:overflow-hidden">
      {/* ────────────────────────────────────────────────────────────
          LEFT COLUMN: EDITORIAL RECOVERY CHAMBER (Desktop Light)
          ──────────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:w-1/2 bg-[#F2EFE9] text-[#181716] flex-col justify-between p-8 xl:p-12 border-r border-[#E2DFD7] relative overflow-hidden h-full">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(#181716 1px, transparent 1px), linear-gradient(to right, #181716 1px, transparent 1px)",
            backgroundSize: "32px 32px, 64px 64px",
          }}
        />

        <div className="relative z-10 flex items-center justify-between border-b border-[#E2DFD7] pb-4">
          <Link href="/feed" className="group flex items-center">
            <Image
              src={logoImg}
              alt="SocialHouse"
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
          <span className="font-mono text-[11px] text-[#8C8880] uppercase tracking-wider">
            CREDENTIAL RECOVERY
          </span>
        </div>

        <div className="relative z-10 my-auto py-2 max-w-sm mx-auto w-full">
          <div className="bg-[#FAF9F6] border border-[#DCD8CE] p-5 space-y-3 shadow-sm">
            <div className="font-mono text-[11px] text-[#6C6860] tracking-widest uppercase border-b border-[#EAE7DF] pb-2 font-semibold">
              ENCRYPTED RECOVERY PROTOCOL
            </div>
            <p className="text-xs font-mono text-[#6C6860] leading-relaxed">
              Account credentials are recovered exclusively through single-use, time-delimited verification tokens dispatched directly to your confirmed mailbox.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-[#E2DFD7] pt-4 text-[11px] font-mono text-[#8C8880]">
          <span>VERIFICATION PROTOCOL</span>
          <span>EST. 2025</span>
        </div>
      </aside>

      {/* ────────────────────────────────────────────────────────────
          RIGHT COLUMN: RECOVERY FORM (Responsive Light)
          ──────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-[#FAF9F6] text-[#181716] h-full overflow-y-auto lg:overflow-hidden">
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

        <div className="w-full max-w-sm mx-auto my-auto py-1">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8C8880]">
                RECOVERY CHAMBER
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#181716]">
                {step === "request" ? "Reset Password" : "Enter Verification"}
              </h1>
              <p className="text-xs text-[#6C6860] leading-relaxed">
                {step === "request"
                  ? "Enter your registered email to receive a recovery token."
                  : "Enter the code sent to your email along with your new password."}
              </p>
            </div>

            {step === "request" ? (
              <form onSubmit={sendCode} className="space-y-3">
                <div className="space-y-1">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#5A564E]">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D4D0C6] rounded-none text-sm text-[#181716] placeholder:text-[#9A968E] focus:outline-none focus:border-[#181716] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#181716] hover:bg-[#2C2A28] active:scale-[0.99] text-[#FAF9F6] font-mono text-xs tracking-[0.15em] uppercase font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>DISPATCHING CODE...</span>
                    </>
                  ) : (
                    <>
                      <span>SEND RECOVERY CODE</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-150" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={resetPassword} className="space-y-3">
                <div className="space-y-1">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#5A564E]">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={OTP.LENGTH}
                    required
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3.5 py-2 bg-white border border-[#D4D0C6] rounded-none text-sm font-mono tracking-widest text-[#181716] focus:outline-none focus:border-[#181716] transition-colors text-center"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#5A564E]">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2 bg-white border border-[#D4D0C6] rounded-none text-sm text-[#181716] placeholder:text-[#9A968E] focus:outline-none focus:border-[#181716] transition-colors"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#181716] hover:bg-[#2C2A28] active:scale-[0.99] text-[#FAF9F6] font-mono text-xs tracking-[0.15em] uppercase font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>UPDATING PASSWORD...</span>
                    </>
                  ) : (
                    <>
                      <span>UPDATE PASSWORD</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-150" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("request")}
                  className="w-full text-center text-xs font-mono text-[#78746C] hover:text-[#181716] underline pt-1 transition-colors"
                >
                  Change Email
                </button>
              </form>
            )}

            <div className="pt-3 border-t border-[#E2DFD7] flex items-center justify-between text-xs font-mono text-[#6C6860]">
              <span>REMEMBER PASSWORD?</span>
              <Link
                href="/login"
                className="font-bold text-[#181716] hover:underline underline-offset-4 flex items-center gap-1 group"
              >
                <span>SIGN IN</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-150" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E2DFD7] pt-3 text-[10px] font-mono text-[#8C8880] flex flex-col sm:flex-row items-center justify-between gap-1">
          <span>&copy; {new Date().getFullYear()} SOCIALHOUSE</span>
          <span>PASSWORD RECOVERY</span>
        </div>
      </main>
    </div>
  );
}
