"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    if (res?.ok) router.push("/feed");
    else alert("Invalid credentials");
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
        {/* Logo */}
        <div className="flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Socials"
            width={220}
            height={56}
            priority
          />
        </div>

        {/* Card */}
        <div className="w-full max-w-sm -mt-6 md:-mt-10">
          <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-white/60 overflow-hidden">
            <div className="px-6 py-8">
              <h1 className="text-2xl sm:text-3xl font-semibold text-center mb-4 text-gray-900">
                Sign In
              </h1>

              <label className="block text-xs text-gray-600 mb-1">Email</label>
              <input
                className="w-full p-2.5 rounded-lg bg-gray-100/60 border border-gray-200 focus:border-gray-300 mb-3 focus:outline-none placeholder-gray-400"
                placeholder="you@domain.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                type="email"
                autoComplete="email"
              />

              <label className="block text-xs text-gray-600 mb-1">
                Password
              </label>

              <div className="relative mb-4">
                <input
                  className="w-full p-2.5 pr-10 rounded-lg bg-gray-100/60 border border-gray-200 focus:border-gray-300 focus:outline-none placeholder-gray-400"
                  placeholder="Password"
                  type={showPassword ? "text" : "password"} // Toggles between text and password
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    // Eye Off Icon (Hide)
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    // Eye On Icon (Show)
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>

              <button
                className="w-full py-2.5 rounded-lg bg-black text-white font-medium mb-3"
                onClick={handleLogin}
              >
                Sign In
              </button>

              <div className="flex items-center gap-2 mb-3">
                <hr className="flex-1 border-t border-gray-200/70" />
                <span className="text-xs text-gray-400">Or</span>
                <hr className="flex-1 border-t border-gray-200/70" />
              </div>

              <Link href="/register">
                <button className="w-full py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">
                  Create Account
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