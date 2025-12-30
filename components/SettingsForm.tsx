"use client";

import { useState } from "react";

type Props = {
  user: {
    username: string;
    email: string;
    bio: string | null;
  };
};

export default function SettingsForm({ user }: Props) {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(user.bio ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, bio, password }),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Failed to update settings");
      return;
    }

    alert("Settings updated");
    setPassword("");
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 p-6 sm:p-8 space-y-6">
      
      {/* Username Input */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-zinc-900 ml-1">Username</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-zinc-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-100 focus:border-zinc-400 transition-all text-sm sm:text-base text-zinc-900 font-medium"
            placeholder="johndoe"
          />
        </div>
      </div>

      {/* Email Input */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-zinc-900 ml-1">Email</label>
        <div className="relative group">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-zinc-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
              <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
            </svg>
          </div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-100 focus:border-zinc-400 transition-all text-sm sm:text-base text-zinc-900 font-medium"
            placeholder="john@example.com"
          />
        </div>
      </div>

      {/* Bio Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between ml-1">
          <label className="text-sm font-semibold text-zinc-900">Bio</label>
          <span className={`text-xs font-medium ${bio.length > 150 ? 'text-red-500' : 'text-zinc-400'}`}>
            {bio.length}/160
          </span>
        </div>
        <textarea
          maxLength={160}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-100 focus:border-zinc-400 transition-all text-sm sm:text-base text-zinc-900 font-medium resize-none"
          placeholder="Tell us a little about yourself..."
        />
      </div>

      {/* Password Input */}
      <div className="space-y-2 pt-2 border-t border-zinc-100">
        <label className="text-sm font-semibold text-zinc-900 ml-1">New Password</label>
        <div className="relative group">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-zinc-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave empty to keep current"
            className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-100 focus:border-zinc-400 transition-all text-sm sm:text-base text-zinc-900 font-medium"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-zinc-900 text-white py-3.5 rounded-xl font-bold hover:bg-black disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {loading ? (
             <>
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
             </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
}