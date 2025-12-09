// "use client";
// import Image from "next/image";
// import { signIn } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import validator from "validator";

// export default function Authpage() {
//   const [isSignup, setIsSignup] = useState(false);
//   const [form, setForm] = useState({
//     email: "",
//     username: "",
//     password: "",
//   });

//   // <-- added email error state (UI only)
//   const [emailError, setEmailError] = useState("");

//   const router = useRouter();

//   const validateEmailClient = (email: string) => {
//     // quick client-side strict-ish check (less strict than server)
//     return validator.isEmail(email.trim(), {
//       allow_display_name: false,
//       require_tld: true,
//       allow_utf8_local_part: false,
//       allow_ip_domain: false,
//     });
//   };

//   const handleSignup = async () => {

// const { email, username, password } = form;
//     if (!email || !username || !password) return alert("All fields are required");

//     if (!validateEmailClient(email)) {
//       return alert("Please enter a valid email address");
//     }
//     if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(username)) {
//       return alert("Username: 3-30 chars (letters, numbers, _ . -)");
//     }
//     if (password.length < 8) return alert("Password must be at least 8 characters");

//     const res = await fetch("/api/auth/signup", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(form),
//     });
    

//     if (res.ok) {
//       await signIn("credentials", {
//         redirect: false,
//         email: form.email,
//         password: form.password,
//       });
//       router.push("/feed");
//     } else {
//       let message = "Signup failed";
//       try {
//         const data = await res.json();
//         if (data.error) message = data.error;
//       } catch {}
//       alert(message);
//     }
//   };

//   const handleLogin = async () => {
//     const res = await signIn("credentials", {
//       redirect: false,
//       email: form.email,
//       password: form.password,
//     });

//     if (res?.ok) router.push("/feed");
//     else alert("Invalid credentials");
//   };

//   return (
//     // Full-viewport wrapper — fixed so it *completely* covers* the page.
//     // On desktop (md+) we hide outer scrolling (content is sized to fit),
//     // on small screens we allow overflow so nothing gets clipped.
//     <main
//       style={{
//         position: "fixed",
//         inset: 0,
//         // split background: left white, right beige
//         background: "linear-gradient(90deg, #ffffff 0% 50%, #F3E9DD 50% 100%)",
//       }}
//       className="w-full h-full flex items-center justify-center overflow-auto md:overflow-hidden"
//     >
//       {/* Center column (logo + card) — no extra outer wrapper */}
//       <div
//         className="flex flex-col items-center justify-center w-full px-6 -mt-6 md:-mt-12"
//         style={{ maxWidth: 1000 }}
//       >
//         {/* Logo (centered above card) */}
//         <div className=" flex items-center justify-center">
//           <Image
//             src="/logo.png"
//             alt="Socials"
//             width={220}
//             height={56}
//             priority
//           />
//         </div>

//         {/* Card (sized to fit typical desktop heights so no scrolling) */}
//         <div className="w-full max-w-sm -mt-6 md:-mt-10">
//           <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-white/60 overflow-hidden">
//             <div className="px-6 py-8">
//               <h1 className="text-2xl sm:text-3xl font-semibold text-center mb-4 text-gray-900">
//                 {isSignup ? "Create Account" : "Sign In"}
//               </h1>

//               {/* Email field with real-time validation + error UI */}
//               <label className="block text-xs text-gray-600 mb-1">Email</label>
//               <input
//                 className={`w-full p-2.5 rounded-lg bg-gray-100/60 border mb-1 focus:outline-none placeholder-gray-400
//                   ${emailError ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-gray-300"}`}
//                 placeholder="you@domain.com"
//                 value={form.email}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   setForm({ ...form, email: value });

//                   // email validation regex
//                   const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//                   setEmailError(regex.test(value) ? "" : "Please enter a valid email address");
//                 }}
//                 type="email"
//                 autoComplete="email"
//                 pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
//               />

//               {emailError && (
//                 <p className="text-xs text-red-500 mb-2 mt-0.5">{emailError}</p>
//               )}

//               {isSignup && (
//                 <>
//                   <label className="block text-xs text-gray-600 mb-1">
//                     Username
//                   </label>
//                   <input
//                     className="w-full p-2.5 rounded-lg bg-gray-100/60 border border-gray-200 focus:border-gray-300 mb-3 focus:outline-none placeholder-gray-400"
//                     placeholder="Choose a username"
//                     value={form.username}
//                     onChange={(e) =>
//                       setForm({ ...form, username: e.target.value })
//                     }
//                     type="text"
//                     autoComplete="username"
//                   />
//                 </>
//               )}

//               <label className="block text-xs text-gray-600 mb-1">
//                 Password
//               </label>
//               <input
//                 className="w-full p-2.5 rounded-lg bg-gray-100/60 border border-gray-200 focus:border-gray-300 mb-4 focus:outline-none placeholder-gray-400"
//                 placeholder="Password"
//                 type="password"
//                 value={form.password}
//                 onChange={(e) => setForm({ ...form, password: e.target.value })}
//                 autoComplete={isSignup ? "new-password" : "current-password"}
//               />

//               {isSignup ? (
//                 <button
//                   className="w-full py-2.5 rounded-lg bg-black text-white font-medium mb-3"
//                   onClick={handleSignup}
//                 >
//                   Create Account
//                 </button>
//               ) : (
//                 <button
//                   className="w-full py-2.5 rounded-lg bg-black text-white font-medium mb-3"
//                   onClick={handleLogin}
//                 >
//                   Sign In
//                 </button>
//               )}

//               <div className="flex items-center gap-2 mb-3">
//                 <hr className="flex-1 border-t border-gray-200/70" />
//                 <span className="text-xs text-gray-400">Or</span>
//                 <hr className="flex-1 border-t border-gray-200/70" />
//               </div>

//               {isSignup ? (
//                 <button
//                   className="w-full py-2 rounded-lg bg-gray-100 text-gray-800 font-medium"
//                   onClick={() => setIsSignup(false)}
//                 >
//                   Back to Sign In
//                 </button>
//               ) : (
//                 <button
//                   className="w-full py-2 rounded-lg bg-gray-100 text-gray-800 font-medium"
//                   onClick={() => setIsSignup(true)}
//                 >
//                   Create Account
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="text-center text-xs text-gray-500 mt-6">
//             Social House © {new Date().getFullYear()} • Privacy & Legal • Contact
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }









// app/maintenance/page.tsx
"use client";         // <<< add this

import React from "react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold mb-4">Site Under Maintenance</h1>
        <p className="text-gray-600 mb-6">
          We’re doing a quick update. We’ll be back shortly — thanks for your patience.
        </p>
      </div>
      {/* If you used styled-jsx here before, keep it. */}
    </div>
  );
}
