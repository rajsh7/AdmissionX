"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CollegeLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Placeholder login flow
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard/college");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f6f6]">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-800">College Portal</h2>
          <p className="text-sm text-slate-500 mt-2">Sign in to manage your college dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-700 text-[13px] font-bold mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-colors" 
              placeholder="college@example.com"
              required 
            />
          </div>
          <div>
            <label className="block text-slate-700 text-[13px] font-bold mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-colors" 
              placeholder="••••••••"
              required 
            />
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
              Back to Home
            </Link>
            <a href="#" className="text-xs font-semibold text-[#8B3D3D] hover:underline">
              Forgot password?
            </a>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#8B3D3D] hover:bg-[#6e3030] text-white font-bold py-3.5 px-4 rounded-lg mt-6 shadow-md transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
