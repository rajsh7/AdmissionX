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

      <main className="relative flex-1 flex items-center justify-center px-4 py-24 overflow-hidden">
        <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/10 z-10">

          {/* ── Left: Login Card ── */}
          <div className="bg-white p-8 lg:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-2xl mb-4">
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>apartment</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">College Login</h2>
              <p className="text-slate-500 text-sm">Sign in to manage your college profile, courses, and student applications.</p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <span className="material-symbols-outlined text-red-500 text-[18px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Official Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">mail</span>
                  <input name="email" type="email" placeholder="admissions@yourcollege.com" required autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-800 placeholder:text-slate-400 transition-all" />
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
                    className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-800 placeholder:text-slate-400 transition-all" />
                  <button type="button" onClick={() => setShowPassword(p => !p)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">{showPassword ? "visibility" : "visibility_off"}</span>
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-primary hover:bg-red-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                {loading ? <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                  : <><span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>Sign in as College</>}
              </button>
            </form>

            <p className="mt-6 text-center text-slate-500 text-sm">
              Not registered yet?{" "}
              <Link href="/signup/college" className="text-primary font-bold hover:underline">Register your college</Link>
            </p>
          </div>

          {/* ── Right: Promo Panel ── */}
          <div className="hidden lg:flex flex-col justify-between p-10 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #FF3C3C, transparent)" }} />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #FF3C3C, transparent)" }} />

            <div>
              <Link href="/" className="inline-block mb-10 bg-white px-4 py-2 rounded-xl">
                <img src="/admissionx-logo.png" className="h-7 w-auto object-contain" alt="AdmissionX" />
              </Link>
              <h2 className="text-3xl font-black text-white leading-tight mb-4">
                Your College Dashboard Awaits
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Manage your college profile, review student applications, update courses, and track your performance — all from one powerful dashboard.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: "description", title: "Manage Applications", desc: "Review, accept or reject student applications in real-time" },
                { icon: "menu_book", title: "Update Courses & Fees", desc: "Keep your course listings and fee structure up to date" },
                { icon: "photo_library", title: "Gallery & Media", desc: "Showcase your campus with photos and videos" },
                { icon: "star", title: "Student Reviews", desc: "Monitor and respond to student feedback" },
              ].map((b) => (
                <div key={b.title} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{b.icon}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{b.title}</p>
                    <p className="text-slate-500 text-xs">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-slate-600 text-xs mt-8">
              New to AdmissionX?{" "}
              <Link href="/signup/college" className="text-primary font-semibold hover:underline">Register your college →</Link>
            </p>
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
