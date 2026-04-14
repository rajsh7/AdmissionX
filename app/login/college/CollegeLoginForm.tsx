"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { AuthBackgroundSlider } from "../../components/AuthBackgroundSlider";

const SLIDES = [
  "/Background-images/bg-signup1.jpg",
  "/Background-images/1.jpg",
  "/Background-images/17.jpg",
  "/Background-images/18.jpg",
  "/Background-images/19.jpg",
];

function isTempPassword(pw: string) { return /^Adx@\d{4}#/.test(pw); }

function ForceChangePasswordModal({ slug, onDone }: { slug: string; onDone: () => void }) {
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPw.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (newPw !== confirm) { setError("Passwords do not match."); return; }
    if (newPw === current) { setError("New password must differ from the temporary password."); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/settings`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_password", currentPassword: current, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to change password.");
      onDone();
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong."); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-amber-600 text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock_reset</span>
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg leading-tight">Change Your Temporary Password</h2>
            <p className="text-sm text-amber-700 mt-0.5">Please set a new password to continue.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[
            { label: "Temporary Password", value: current, set: setCurrent, type: "text", icon: "lock" },
            { label: "New Password", value: newPw, set: setNewPw, type: showNew ? "text" : "password", icon: "lock_open", toggle: () => setShowNew(p => !p), show: showNew },
            { label: "Confirm New Password", value: confirm, set: setConfirm, type: "password", icon: "lock_reset" },
          ].map((f) => (
            <div key={f.label} className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">{f.label}</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">{f.icon}</span>
                <input type={f.type} value={f.value} onChange={(e) => { f.set(e.target.value); setError(""); }} required minLength={f.label !== "Temporary Password" ? 8 : undefined}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                {f.toggle && (
                  <button type="button" tabIndex={-1} onClick={f.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">{f.show ? "visibility_off" : "visibility"}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
          <button type="submit" disabled={loading || !current || !newPw || newPw !== confirm}
            className="w-full bg-primary hover:bg-red-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
            {loading ? <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg> : "Set New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CollegeLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forceChangePw, setForceChangePw] = useState<{ slug: string } | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlideIndex(i => (i + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login/college", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (res.ok) {
        const slug = data.user?.slug;
        const id = data.user?.id;
        const destination = redirectTo || `/dashboard/college/${slug ?? id}`;
        if (isTempPassword(password) && slug) { setForceChangePw({ slug }); }
        else { router.push(destination); router.refresh(); }
      } else { setError(data.error || "Login failed. Please check your credentials."); }
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col font-display relative">
      <AuthBackgroundSlider />
      <Header />
      {forceChangePw && (
        <ForceChangePasswordModal slug={forceChangePw.slug} onDone={() => {
          setForceChangePw(null);
          router.push(redirectTo || `/dashboard/college/${forceChangePw.slug}`);
          router.refresh();
        }} />
      )}
      <main className="relative flex-1 flex items-center justify-center px-6 py-48 z-10">
        <div className="flex w-full max-w-[920px] rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden" style={{ minHeight: "520px" }}>

          {/* LEFT: Slider */}
          <div className="w-[38%] relative flex-shrink-0" style={{ minHeight: "520px" }}>
            {SLIDES.map((src, i) => (
              <div key={src} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: i === slideIndex ? 1 : 0 }}>
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-10" />
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {SLIDES.map((_, i) => (
                <button key={i} onClick={() => setSlideIndex(i)}
                  className={`rounded-full transition-all ${i === slideIndex ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`} />
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
              <h2 className="text-white text-xl font-bold leading-snug mb-3">
                Welcome back to<br /><span className="font-light">AdmissionX</span>
              </h2>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3 py-2">
                  <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>apartment</span>
                  <p className="text-white text-[10px] font-medium leading-tight">Manage your college<br /><span className="text-white/60 font-normal">profile & applications</span></p>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3 py-2">
                  <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                  <p className="text-white text-[10px] font-medium leading-tight">Track analytics<br /><span className="text-white/60 font-normal">and student reach</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="flex-1 bg-[#f3f4f6] flex items-center justify-center px-8 py-10">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-md px-8 py-8">
              <h1 className="text-[24px] font-bold text-[#111] mb-1">College Login</h1>
              <p className="text-[13px] text-gray-500 mb-6">Sign in to manage your college dashboard.</p>

              {error && (
                <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-gray-700">Official Email<span className="text-red-500 ml-0.5">*</span></label>
                  <input type="email" placeholder="admissions@yourcollege.com" required
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
                  {loading ? "Signing in…" : "Log in"}
                </button>
              </form>

              <p className="mt-4 text-[12px] text-gray-500 text-center">
                Not registered yet?{" "}
                <Link href="/signup/college" className="text-[#111] font-semibold hover:underline">Register your college</Link>
              </p>
              <p className="mt-2.5 text-[11px] text-gray-400 text-center">
                By logging in, you agree to our{" "}
                <Link href="/terms-and-conditions" className="text-gray-500 underline">terms of use</Link>.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
