"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthBackgroundSlider } from "../../components/AuthBackgroundSlider";
import Header from "../../components/Header";
import Link from "next/link";
import Footer from "../../components/Footer";

function isTempPassword(pw: string) {
  return /^Adx@\d{4}#/.test(pw);
}

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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_password", currentPassword: current, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to change password.");
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
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
            { label: "Temporary Password", value: current, set: setCurrent, type: "text", icon: "lock", show: true },
            { label: "New Password", value: newPw, set: setNewPw, type: showNew ? "text" : "password", icon: "lock_open", show: showNew, toggle: () => setShowNew(p => !p) },
            { label: "Confirm New Password", value: confirm, set: setConfirm, type: "password", icon: "lock_reset", show: false },
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

function CollegeLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || null;
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forceChangePw, setForceChangePw] = useState<{ slug: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = { email: String(formData.get("email") || "").trim(), password: String(formData.get("password") || "") };
    try {
      const res = await fetch("/api/login/college", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok) {
        const slug = data.user?.slug;
        const id = data.user?.id;
        const destination = redirectTo || `/dashboard/college/${slug ?? id}`;
        if (isTempPassword(body.password) && slug) { setForceChangePw({ slug }); }
        else { router.push(destination); router.refresh(); }
      } else {
        setError(data.error || "Login failed. Please check your credentials.");
      }
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

      {/* Full-height main — pushes footer to bottom */}
      <main className="relative flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 overflow-hidden">
            {/* Card header strip */}
            <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #FF3C3C, #c0392b)" }} />

            <div className="p-8 sm:p-10">
              {/* Icon + title */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>apartment</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">College Login</h2>
                <p className="text-slate-500 text-sm mt-1.5">Sign in to manage your college profile and applications.</p>
              </div>

              {error && (
                <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <span className="material-symbols-outlined text-red-500 text-[18px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Official Email</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">mail</span>
                    <input name="email" type="email" placeholder="admissions@yourcollege.com" required autoComplete="email"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-800 placeholder:text-slate-400 transition-all" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Password</label>
                    <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">lock</span>
                    <input name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" required autoComplete="current-password"
                      className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-800 placeholder:text-slate-400 transition-all" />
                    <button type="button" onClick={() => setShowPassword(p => !p)} tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">{showPassword ? "visibility" : "visibility_off"}</span>
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-primary hover:bg-red-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-2">
                  {loading
                    ? <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                    : <><span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>Sign in as College</>
                  }
                </button>
              </form>

              <p className="mt-6 text-center text-slate-500 text-sm">
                Not registered yet?{" "}
                <Link href="/signup/college" className="text-primary font-bold hover:underline">Register your college</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CollegeLoginPage() {
  return (
    <Suspense>
      <CollegeLoginForm />
    </Suspense>
  );
}
