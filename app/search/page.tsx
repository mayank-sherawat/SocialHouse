"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface User {
  id: string;
  username: string;
  image: string | null;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length < 2) {
      setUsers([]);
    }
  };

  useEffect(() => {
    if (query.trim().length < 2) return;

    const fetchUsers = async () => {
      setLoading(true);
      const res = await fetch(`/api/search?q=${query}`);
      const data = await res.json();
      console.log("SEARCH RESULT:", data);
      setUsers(data);
      setLoading(false);
    };

    fetchUsers();
  }, [query]);

  return (
    // 🔹 ADDED "w-full" here and kept "min-h-screen bg-black"
    <div className="min-h-screen bg-white flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="p-6 border-b border-gray-100 bg-white">
          <h1 className="text-xl font-bold text-gray-800 mb-4">Find People</h1>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg 
                className={`w-5 h-5 transition-colors duration-200 ${loading ? 'text-blue-500' : 'text-gray-400'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <input
              type="text"
              placeholder="Search by username..."
              value={query}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
            />
            
            {loading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!loading && users.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              {query.length < 2 ? (
                <p className="text-sm">Type at least 2 characters to search</p>
              ) : (
                <p className="text-sm">No users found for &quot;{query}&quot;</p>
              )}
            </div>
          )}

          {/* User List */}
          {users.length > 0 && (
            <div className="divide-y divide-gray-50">
              {users.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-4 p-4 hover:bg-blue-50 transition-colors duration-200 group"
                >
                  <div className="relative shrink-0">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.username}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200 group-hover:border-blue-200 transition-colors"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center border border-gray-200 group-hover:border-blue-200 transition-colors">
                        <svg 
                          className="w-6 h-6 text-gray-400" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                      @{user.username}
                    </span>
                    <span className="text-xs text-gray-400">View Profile</span>
                  </div>
                  
                  <svg className="w-5 h-5 text-gray-300 ml-auto group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}