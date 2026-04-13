"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginForm() {
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
      router.push("/admin");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111827]">
      <div className="bg-[#1f2937] p-8 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white">Admin Access</h2>
          <p className="text-sm text-slate-400 mt-2">System administration control panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-[13px] font-bold mb-2">Admin Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#374151] border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-red-500 transition-colors" 
              placeholder="admin@admissionx.in"
              required 
            />
          </div>
          <div>
            <label className="block text-slate-300 text-[13px] font-bold mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#374151] border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-red-500 transition-colors" 
              placeholder="••••••••"
              required 
            />
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
              Back to Home
            </Link>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold py-3.5 px-4 rounded-lg mt-6 shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoading ? "Authenticating..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
