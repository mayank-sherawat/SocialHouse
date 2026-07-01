"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

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
  const [emailError, setEmailError] = useState("");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // 1. SEND OTP FUNCTION
  const handleSendOtp = async () => {
    if (!form.email || emailError) {
      return toast.error("Please enter a valid email address first.");
    }

    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsOtpSent(true);
        toast.success("Verification code sent");
      } else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong sending OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // 2. VERIFY OTP FUNCTION
  const handleVerifyOtp = async () => {
    if (!otp) return toast.error("Please enter the OTP");

    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsEmailVerified(true);
        setIsOtpSent(false);
        toast.success("Email verified");
      } else {
        toast.error(data.error || "Verification failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong verifying OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // 3. FINAL SIGNUP FUNCTION
  const handleSignup = async () => {
    const { email, username, password } = form;

    if (!isEmailVerified) {
      return toast.error("Please verify your email address first.");
    }

    if (!email || !username || !password) return toast.error("All fields are required");

    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(username)) {
      return toast.error("Username: 3-30 chars (letters, numbers, _ . -)");
    }
    if (password.length < 8) return toast.error("Password must be at least 8 characters");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, otp }),
    });

    if (res.ok) {
      await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });
      router.push("/feed");
    } else {
      let message = "Signup failed";
      try {
        const data = await res.json();
        if (data.error) message = data.error;
      } catch { }
      toast.error(message);
    }
  };

  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        background: "linear-gradient(90deg, #ffffff 0% 50%, #F3E9DD 50% 100%)",
      }}
      className="w-full h-full flex items-center justify-center overflow-auto md:overflow-hidden"
    >
      <div
        className="flex flex-col items-center justify-center w-full px-6 -mt-6 md:-mt-12"
        style={{ maxWidth: 1000 }}
      >
        <div className="flex items-center justify-center">
          <Image src="/logo.png" alt="Socials" width={220} height={56} priority />
        </div>

        <div className="w-full max-w-sm -mt-6 md:-mt-10">
          <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-white/60 overflow-hidden">
            <div className="px-6 py-8">
              <h1 className="text-2xl sm:text-3xl font-semibold text-center mb-4 text-gray-900">
                Create Account
              </h1>

              {/* --- EMAIL SECTION (UPDATED UI) --- */}
              <label className="block text-xs text-gray-600 mb-1">Email</label>

              <div className="flex items-stretch gap-2 mb-1">
                {/* Email Input */}
                <input
                  className={`flex-1 min-w-0 p-2.5 rounded-lg bg-gray-100/60 border focus:outline-none placeholder-gray-400 disabled:opacity-60 disabled:cursor-not-allowed ${emailError
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-200 focus:border-gray-300"
                    }`}
                  placeholder="you@domain.com"
                  value={form.email}
                  disabled={isOtpSent || isEmailVerified}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm({ ...form, email: value });
                    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    setEmailError(regex.test(value) ? "" : "Invalid email");
                  }}
                  type="email"
                  autoComplete="email"
                />

                {/* Send Button or Verified Badge (Now Side-by-Side) */}
                <div className="shrink-0">
                  {isEmailVerified ? (
                    <div className="h-full px-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-xs font-bold whitespace-nowrap">✓ Verified</span>
                    </div>
                  ) : (
                    !isOtpSent && (
                      <button
                        onClick={handleSendOtp}
                        disabled={!!emailError || !form.email || otpLoading}
                        className="h-full px-4 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors whitespace-nowrap"
                      >
                        {otpLoading ? "..." : "Send OTP"}
                      </button>
                    )
                  )}
                </div>
              </div>

              {emailError && <p className="text-xs text-red-500 mb-2 mt-0.5">{emailError}</p>}

              {/* --- OTP VERIFICATION BLOCK --- */}
              {isOtpSent && !isEmailVerified && (
                <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-xs text-gray-600 mb-1">
                    Enter Verification Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 p-2 rounded-md border border-gray-200 text-sm focus:border-gray-400 focus:outline-none"
                      placeholder="6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      type="text"
                      maxLength={6}
                    />
                    <button
                      onClick={handleVerifyOtp}
                      disabled={otpLoading}
                      className="bg-green-600 text-white text-xs font-bold px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {otpLoading ? "..." : "Verify"}
                    </button>
                  </div>
                  <button
                    onClick={() => setIsOtpSent(false)}
                    className="text-[10px] text-gray-400 mt-2 hover:text-gray-600 underline"
                  >
                    Change Email
                  </button>
                </div>
              )}

              <label className="block text-xs text-gray-600 mb-1">Username</label>
              <input
                className="w-full p-2.5 rounded-lg bg-gray-100/60 border border-gray-200 focus:border-gray-300 mb-3 focus:outline-none placeholder-gray-400"
                placeholder="Choose a username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                type="text"
                autoComplete="username"
              />

              <label className="block text-xs text-gray-600 mb-1">Password</label>
              <div className="relative mb-4">
                <input
                  className="w-full p-2.5 pr-10 rounded-lg bg-gray-100/60 border border-gray-200 focus:border-gray-300 focus:outline-none placeholder-gray-400"
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    // Eye Off Icon
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    // Eye Icon
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>

              <button
                className="w-full py-2.5 rounded-lg bg-black text-white font-medium mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSignup}
                disabled={!isEmailVerified}
              >
                Create Account
              </button>

              <div className="flex items-center gap-2 mb-3">
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
          <div className="text-center text-xs text-gray-500 mt-6">
            Social House © {new Date().getFullYear()} • Privacy & Legal • Contact
          </div>
        </div>
      </div>
    </main>
  );
}