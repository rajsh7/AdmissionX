"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import { AuthBackgroundSlider } from "../../components/AuthBackgroundSlider";
import Link from "next/link";
import Footer from "../../components/Footer";

export default function CollegeSignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const collegeName = String(formData.get("collegeName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const contactName = String(formData.get("contactName") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const courses = String(formData.get("courses") || "").trim();
    const password = String(formData.get("password") || "").trim();
    const confirmPassword = String(formData.get("confirmPassword") || "").trim();
    const captchaOk = formData.get("captcha") === "on";

    if (!collegeName || !email || !contactName || !phone || !address || !courses || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!captchaOk) {
      setError("Please confirm you are not a robot.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/signup/college", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeName, email, contactName, phone, address, courses, captchaOk, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/dashboard/college/");
      } else {
        setError(data.error || "Signup failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-display relative">
      <AuthBackgroundSlider />
      <Header />

      <main className="relative flex-1 flex items-center justify-center px-4 py-24 overflow-hidden">
        <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/10 z-10">

          {/* -- Left: Promo Panel -- */}
          <div className="hidden lg:flex flex-col justify-between p-10 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #FF3C3C, transparent)" }} />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #FF3C3C, transparent)" }} />

            <div>
              <Link href="/" className="inline-block mb-10 bg-white px-4 py-2 rounded-xl">
                <img src="/admissionx-logo.png" className="h-7 w-auto object-contain" alt="AdmissionX" />
              </Link>
              <h2 className="text-3xl font-black text-white leading-tight mb-4">
                Partner with India&apos;s Most Trusted Admissions Platform
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Join 16,000+ institutions already on AdmissionX. Reach thousands of qualified students actively searching for colleges like yours.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              {[
                { icon: "groups", title: "10,000+ Active Students", desc: "Reach students searching for your courses daily" },
                { icon: "verified", title: "Verified College Profile", desc: "Build trust with a verified badge on your listing" },
                { icon: "description", title: "Application Management", desc: "Manage all student applications in one dashboard" },
                { icon: "analytics", title: "Analytics & Insights", desc: "Track profile views, applications, and conversions" },
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
              Already registered?{" "}
              <Link href="/login/college" className="text-primary font-semibold hover:underline">College Login →</Link>
            </p>
          </div>

          {/* -- Right: Signup Form -- */}
          <div className="bg-white p-8 lg:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <h1 className="text-2xl font-black text-slate-900 mb-1">Register Your College</h1>
              <p className="text-slate-500 text-sm">Submit your details. Our team will review and send your login credentials within 1–2 business days.</p>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <span className="material-symbols-outlined text-red-500 text-[18px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* College Name */}
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">College / University Name <span className="text-primary">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">corporate_fare</span>
                  <input name="collegeName" type="text" placeholder="e.g. Delhi Institute of Technology" required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-800 placeholder:text-slate-400 transition-all" />
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Official Email <span className="text-primary">*</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">mail</span>
                    <input name="email" type="email" placeholder="admissions@college.com" required
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-800 placeholder:text-slate-400 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Phone <span className="text-primary">*</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">call</span>
                    <input name="phone" type="tel" placeholder="+91 98765 43210" required
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-800 placeholder:text-slate-400 transition-all" />
                  </div>
                </div>
              </div>

              {/* Contact Person */}
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Contact Person <span className="text-primary">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">person</span>
                  <input name="contactName" type="text" placeholder="Admissions Head / Principal" required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-800 placeholder:text-slate-400 transition-all" />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Address <span className="text-primary">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3.5 text-slate-400 text-[18px]">location_on</span>
                  <textarea name="address" placeholder="Street, City, State, ZIP" required rows={2}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-800 placeholder:text-slate-400 transition-all resize-none" />
                </div>
              </div>

              {/* Courses */}
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Courses Offered <span className="text-primary">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">school</span>
                  <input name="courses" type="text" placeholder="e.g. B.Tech, MBA, Ph.D" required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-800 placeholder:text-slate-400 transition-all" />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Password <span className="text-primary">*</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">lock</span>
                    <input name="password" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" required minLength={8}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-800 placeholder:text-slate-400 transition-all" />
                    <button type="button" onClick={() => setShowPassword(p => !p)} tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <span className="material-symbols-outlined text-[18px]">{showPassword ? "visibility" : "visibility_off"}</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Confirm Password <span className="text-primary">*</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">lock_reset</span>
                    <input name="confirmPassword" type={showPassword ? "text" : "password"} placeholder="Re-enter password" required minLength={8}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-800 placeholder:text-slate-400 transition-all" />
                  </div>
                </div>
              </div>

              {/* Captcha */}
              <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <input id="college-captcha" name="captcha" type="checkbox"
                  className="h-4 w-4 mt-0.5 rounded border-slate-300 text-primary focus:ring-primary shrink-0" />
                <label htmlFor="college-captcha" className="text-xs text-slate-600 leading-snug">
                  I confirm the information is accurate and I am authorised to register this institution on AdmissionX.
                </label>
              </div>

              {/* Info note */}
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <span className="material-symbols-outlined text-blue-500 text-[16px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Set your password now. You can <strong>log in immediately</strong> after registration.
                </p>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-primary hover:bg-red-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_reg</span>Submit Registration Request</>
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-slate-500 text-xs lg:hidden">
              Already registered? <Link href="/login/college" className="text-primary font-bold hover:underline">College Login</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
