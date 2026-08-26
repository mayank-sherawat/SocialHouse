"use client";

import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PROFILE, PASSWORD, OTP } from "@/lib/constants";
import logoImg from "@/public/logo.png";

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const validateEmail = (val: string) => {
    const trimmed = val.trim().toLowerCase();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed) {
      setEmailError("");
      return false;
    }
    if (!regex.test(trimmed)) {
      setEmailError("Invalid email format");
      return false;
    }
    setEmailError("");
    return true;
  };

  // 1. SEND OTP
  const handleSendOtp = async () => {
    if (!form.email || emailError || !validateEmail(form.email)) {
      toast.error("Please enter a valid email address first.");
      return;
    }

    setOtpLoading(true);
    const toastId = toast.loading("Dispatching verification code...");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsOtpSent(true);
        setCooldown(60);
        toast.success("Verification code dispatched to your email.", { id: toastId });
      } else {
        toast.error(data.error || "Failed to send verification code.", { id: toastId });
        if (data.error && data.error.toLowerCase().includes("already registered")) {
          setEmailError(data.error);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error while sending verification code.", { id: toastId });
    } finally {
      setOtpLoading(false);
    }
  };

  // 2. VERIFY OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.trim().length !== OTP.LENGTH) {
      toast.error(`Please enter the ${OTP.LENGTH}-digit verification code.`);
      return;
    }

    setOtpLoading(true);
    const toastId = toast.loading("Verifying code...");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsEmailVerified(true);
        setIsOtpSent(false);
        toast.success("Email verified successfully.", { id: toastId });
      } else {
        toast.error(data.error || "Verification failed. Check the code.", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error verifying code.", { id: toastId });
    } finally {
      setOtpLoading(false);
    }
  };

  // 3. COMPLETE SIGNUP
  const handleSignup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const { email, username, password } = form;

    if (!isEmailVerified) {
      toast.error("Please verify your email address first.");
      return;
    }

    if (!email || !username || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(username.trim())) {
      toast.error(
        `Username must be ${PROFILE.USERNAME_MIN_LENGTH}-${PROFILE.USERNAME_MAX_LENGTH} chars (letters, numbers, _ . -)`
      );
      return;
    }

    if (password.length < PASSWORD.MIN_LENGTH) {
      toast.error(`Password must be at least ${PASSWORD.MIN_LENGTH} characters.`);
      return;
    }

    setSignupLoading(true);
    const toastId = toast.loading("Creating creator account...");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          username: username.trim(),
          password,
          otp: otp.trim(),
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        toast.success("Account created. Logging in...", { id: toastId });
        const loginRes = await signIn("credentials", {
          redirect: false,
          email: email.trim().toLowerCase(),
          password,
        });

        if (loginRes?.ok) {
          window.location.href = "/feed";
        } else {
          window.location.href = "/login";
        }
      } else {
        toast.error(data?.error || "Registration failed.", { id: toastId });
        setSignupLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong during sign up.");
      setSignupLoading(false);
    }
  };

  const isUsernameValid = /^[a-zA-Z0-9_.-]{3,30}$/.test(form.username.trim());
  const isPasswordValid = form.password.length >= PASSWORD.MIN_LENGTH;

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen w-full bg-[#FAF9F6] text-[#181716] flex flex-col lg:flex-row antialiased selection:bg-[#181716] selection:text-[#FAF9F6] overflow-y-auto lg:overflow-hidden">
      {/* ────────────────────────────────────────────────────────────
          LEFT COLUMN: EDITORIAL PHOTOGRAPHY CHAMBER (Desktop Light)
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

        {/* Header */}
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
            INVITATION &bull; REGISTER
          </span>
        </div>

        {/* Center Editorial Manifesto Card */}
        <div className="relative z-10 my-auto py-2 max-w-sm mx-auto w-full">
          <div className="bg-[#FAF9F6] border border-[#DCD8CE] p-5 space-y-4 shadow-sm">
            <div className="border-b border-[#EAE7DF] pb-2.5 flex items-center justify-between">
              <span className="font-mono text-[11px] text-[#6C6860] tracking-widest uppercase font-semibold">
                INDEX &bull; PRINCIPLES
              </span>
              <span className="font-mono text-[10px] text-[#8C8880]">01 &mdash; 03</span>
            </div>

            <div className="space-y-3 font-mono text-xs text-[#6C6860]">
              <div className="flex items-start gap-2.5">
                <span className="text-[#8C8880] font-bold">01</span>
                <p className="leading-relaxed">
                  <strong className="text-[#181716] font-semibold block font-sans text-sm mb-0.5">
                    Uncompressed Imagery
                  </strong>
                  High-fidelity rendering without algorithmic degradation.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="text-[#8C8880] font-bold">02</span>
                <p className="leading-relaxed">
                  <strong className="text-[#181716] font-semibold block font-sans text-sm mb-0.5">
                    True Chronology
                  </strong>
                  No engagement algorithms or sponsored intrusions.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="text-[#8C8880] font-bold">03</span>
                <p className="leading-relaxed">
                  <strong className="text-[#181716] font-semibold block font-sans text-sm mb-0.5">
                    Verified Identity
                  </strong>
                  One account per person, authenticated with direct email OTP.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between border-t border-[#E2DFD7] pt-4 text-[11px] font-mono text-[#8C8880]">
          <span>MEMBER DIRECTORY</span>
          <span>EST. 2025</span>
        </div>
      </aside>

      {/* ────────────────────────────────────────────────────────────
          RIGHT COLUMN: REGISTRATION CHAMBER (Responsive Light)
          ──────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-[#FAF9F6] text-[#181716] h-full overflow-y-auto lg:overflow-hidden">
        {/* Mobile Header */}
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

        {/* Center Form */}
        <div className="w-full max-w-sm mx-auto my-auto py-1">
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8C8880]">
                MEMBERSHIP REGISTRATION
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#181716]">
                Create Account
              </h1>
              <p className="text-xs text-[#6C6860] leading-relaxed">
                Complete verification to create your archive.
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-3">
              {/* STEP 1: EMAIL & OTP */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#5A564E]">
                    Email Address
                  </label>
                  {isEmailVerified && (
                    <span className="font-mono text-[10px] text-[#1B5E20] tracking-wider font-bold">
                      [ &check; VERIFIED ]
                    </span>
                  )}
                </div>

                <div className="flex items-stretch gap-2">
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    disabled={isOtpSent || isEmailVerified}
                    placeholder="name@domain.com"
                    value={form.email}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm({ ...form, email: val });
                      validateEmail(val);
                    }}
                    className={`flex-1 px-3.5 py-2.5 bg-white border rounded-none text-sm text-[#181716] placeholder:text-[#9A968E] focus:outline-none focus:border-[#181716] transition-colors disabled:opacity-60 ${
                      emailError ? "border-[#C62828]" : "border-[#D4D0C6]"
                    }`}
                  />

                  {!isEmailVerified && !isOtpSent && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={
                        !form.email || !!emailError || otpLoading || cooldown > 0
                      }
                      className="px-3.5 py-2.5 bg-[#181716] hover:bg-[#2C2A28] active:scale-[0.98] text-[#FAF9F6] font-mono text-xs uppercase tracking-wider font-bold transition-all disabled:opacity-50 whitespace-nowrap flex items-center gap-1.5"
                    >
                      {otpLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>SENDING...</span>
                        </>
                      ) : cooldown > 0 ? (
                        `${cooldown}s`
                      ) : (
                        "SEND CODE"
                      )}
                    </button>
                  )}
                </div>

                {emailError && (
                  <p className="text-[11px] font-mono text-[#C62828] mt-0.5">
                    {emailError}
                  </p>
                )}
              </div>

              {/* OTP DRAWER */}
              <AnimatePresence>
                {isOtpSent && !isEmailVerified && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="p-3 bg-[#F2EFE9] border border-[#DCD8CE] space-y-2.5 overflow-hidden"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#5A564E] uppercase font-semibold">
                        Enter 6-Digit Code
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOtpSent(false);
                          setOtp("");
                        }}
                        className="text-[#78746C] hover:text-[#181716] underline transition-colors"
                      >
                        Change Email
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="123456"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, ""))
                        }
                        className="flex-1 px-3 py-2 bg-white border border-[#D4D0C6] rounded-none text-sm font-mono tracking-widest text-center text-[#181716] focus:outline-none focus:border-[#181716] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={otpLoading || otp.length !== 6}
                        className="px-3.5 py-2 bg-[#1B5E20] hover:bg-[#2E7D32] active:scale-[0.98] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {otpLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>...</span>
                          </>
                        ) : (
                          "CONFIRM"
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-[#78746C]">
                      <span>Dispatched via email</span>
                      {cooldown > 0 ? (
                        <span>Resend in {cooldown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="underline hover:text-[#181716] transition-colors"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* STEP 2: USERNAME & PASSWORD */}
              <div className="space-y-1">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#5A564E]">
                  Username
                </label>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="e.g. j.smith"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D4D0C6] rounded-none text-sm text-[#181716] placeholder:text-[#9A968E] focus:outline-none focus:border-[#181716] transition-colors"
                />
                {form.username.length > 0 && !isUsernameValid && (
                  <p className="text-[10px] font-mono text-[#9E6014]">
                    3-30 chars (letters, numbers, _ . -)
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#5A564E]">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
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
                {form.password.length > 0 && !isPasswordValid && (
                  <p className="text-[10px] font-mono text-[#9E6014]">
                    Minimum {PASSWORD.MIN_LENGTH} characters required
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={
                  signupLoading ||
                  !isEmailVerified ||
                  !isUsernameValid ||
                  !isPasswordValid
                }
                className="w-full py-3 px-4 bg-[#181716] hover:bg-[#2C2A28] active:scale-[0.99] text-[#FAF9F6] font-mono text-xs tracking-[0.15em] uppercase font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 group"
              >
                {signupLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>CREATING ARCHIVE...</span>
                  </>
                ) : (
                  <>
                    <span>REGISTER ACCOUNT</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-150" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-[#E2DFD7] flex items-center justify-between text-xs font-mono text-[#6C6860]">
              <span>ALREADY REGISTERED?</span>
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
          <span>CHRONOLOGICAL &bull; DIRECT PHOTOGRAPHY</span>
        </div>
      </main>
    </div>
  );
}