"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AuthBackgroundSlider } from "../components/AuthBackgroundSlider";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) { router.push(redirectTo); router.refresh(); }
      else { setError(data.error || "Login failed. Please check your credentials."); }
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col font-display relative">
      <AuthBackgroundSlider />
      <Header />
      <main className="relative flex-1 flex items-center justify-center px-6 py-48 z-10">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-md px-8 py-8">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
            </div>
            <div>
              <h1 className="text-[22px] font-bold text-[#111] leading-tight">Admin Login</h1>
              <p className="text-[12px] text-gray-500">Secure access for administrators only.</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-gray-700">Admin Email<span className="text-red-500 ml-0.5">*</span></label>
              <input type="email" placeholder="admin@admissionx.com" required
                value={email} onChange={e => setEmail(e.target.value)} suppressHydrationWarning
                className="px-3 py-2 border border-gray-300 rounded-[7px] text-[13px] text-[#111] outline-none focus:border-black transition-colors" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-[12px] font-semibold text-gray-700">Password<span className="text-red-500 ml-0.5">*</span></label>
                <Link href="/forgot-password" className="text-[11px] text-gray-500 hover:text-black hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Enter your password" required
                  value={password} onChange={e => setPassword(e.target.value)} suppressHydrationWarning
                  className="w-full px-3 py-2 border border-gray-300 rounded-[7px] text-[13px] text-[#111] outline-none focus:border-black transition-colors pr-9" />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(p => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <span className="material-symbols-outlined text-[17px]">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="mt-2 py-2.5 bg-[#111] hover:bg-[#333] disabled:opacity-60 text-white rounded-lg text-[13.5px] font-semibold transition-colors w-full">
              {loading ? "Signing in…" : "Sign in as Admin"}
            </button>
          </form>

          <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
            <span className="material-symbols-outlined text-amber-500 text-[14px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            <p className="text-[10px] text-amber-700 leading-relaxed">
              This is a restricted area. Unauthorized access attempts are logged and monitored.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
        <div className="w-6 h-6 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
