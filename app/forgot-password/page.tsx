"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"request" | "reset">("request");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const sendCode = async () => {
    if (!email) return toast.error("Enter your email");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success("If an account exists, a reset code was sent");
        setStep("reset");
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Something went wrong");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!otp || !password) return toast.error("Enter the code and a new password");
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });
      if (res.ok) {
        toast.success("Password updated. Please sign in.");
        router.push("/login");
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Reset failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        background: "linear-gradient(90deg, #ffffff 0% 50%, #F3E9DD 50% 100%)",
      }}
      className="w-full h-full flex items-center justify-center overflow-auto"
    >
      <div className="flex flex-col items-center justify-center w-full px-6 -mt-6 md:-mt-12" style={{ maxWidth: 1000 }}>
        <Image src="/logo.png" alt="SocialHouse" width={220} height={56} priority />

        <div className="w-full max-w-sm -mt-6 md:-mt-10">
          <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-white/60 overflow-hidden">
            <div className="px-6 py-8">
              <h1 className="text-2xl sm:text-3xl font-semibold text-center mb-2 text-gray-900">
                Reset Password
              </h1>
              <p className="text-center text-sm text-gray-500 mb-6">
                {step === "request"
                  ? "Enter your email and we'll send a reset code."
                  : "Enter the code and choose a new password."}
              </p>

              {step === "request" ? (
                <>
                  <label className="block text-xs text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    autoComplete="email"
                    className="w-full p-2.5 rounded-lg bg-gray-100/60 border border-gray-200 focus:border-gray-300 mb-4 focus:outline-none placeholder-gray-400"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendCode()}
                  />
                  <button
                    onClick={sendCode}
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg bg-black text-white font-medium mb-3 disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send Reset Code"}
                  </button>
                </>
              ) : (
                <>
                  <label className="block text-xs text-gray-600 mb-1">Verification Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className="w-full p-2.5 rounded-lg bg-gray-100/60 border border-gray-200 focus:border-gray-300 mb-3 focus:outline-none tracking-widest placeholder-gray-400"
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />

                  <label className="block text-xs text-gray-600 mb-1">New Password</label>
                  <div className="relative mb-4">
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="w-full p-2.5 pr-10 rounded-lg bg-gray-100/60 border border-gray-200 focus:border-gray-300 focus:outline-none placeholder-gray-400"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && resetPassword()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  <button
                    onClick={resetPassword}
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg bg-black text-white font-medium mb-3 disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>

                  <button
                    onClick={() => setStep("request")}
                    className="w-full text-xs text-gray-400 hover:text-gray-600 underline"
                  >
                    Use a different email
                  </button>
                </>
              )}

              <div className="flex items-center gap-2 my-3">
                <hr className="flex-1 border-t border-gray-200/70" />
                <span className="text-xs text-gray-400">Or</span>
                <hr className="flex-1 border-t border-gray-200/70" />
              </div>

              <Link href="/login">
                <button className="w-full py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">
                  Back to Sign In
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
