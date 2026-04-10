"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function CollegeSignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlideIndex(i => (i + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const collegeName = String(formData.get("collegeName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const contactName = String(formData.get("contactName") || "").trim();
    const phone = String(formData.get("phone") || "").trim();

    if (!collegeName || !email || !contactName || !phone) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/signup/college", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeName, email, contactName, phone, captchaOk: true, password: "pending_admin_approval" }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/signup/college/success");
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

      <main className="relative flex-1 flex items-center justify-center px-6 py-36 z-10">
        <div className="flex w-full max-w-[920px] rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden" style={{ minHeight: "600px" }}>

          {/* ── LEFT: Image Slider ───────────────────────────── */}
          <div className="w-[38%] relative flex-shrink-0" style={{ minHeight: "600px" }}>
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
                Partner with India&apos;s<br /><span className="font-light">largest student network</span>
              </h2>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3 py-2">
                  <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                  <p className="text-white text-[10px] font-medium leading-tight">10,000+ active students<br /><span className="text-white/60 font-normal">searching daily</span></p>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3 py-2">
                  <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                  <p className="text-white text-[10px] font-medium leading-tight">Analytics & insights<br /><span className="text-white/60 font-normal">track your reach</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Form Panel ────────────────────────────── */}
          <div className="flex-1 bg-[#f3f4f6] flex items-center justify-center px-8 py-10">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-md px-8 py-8">
              <h1 className="text-[24px] font-bold text-[#111] mb-1">Register Your College</h1>
              <p className="text-[13px] text-gray-500 mb-5">Submit details. Login credentials sent within 1–2 business days.</p>

              {error && (
                <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {[
                  { label: "College / University Name", name: "collegeName", type: "text", placeholder: "e.g. Delhi Institute of Technology" },
                  { label: "Official Email", name: "email", type: "email", placeholder: "admissions@college.com" },
                  { label: "Contact Person", name: "contactName", type: "text", placeholder: "Admissions Head / Principal" },
                  { label: "Phone", name: "phone", type: "tel", placeholder: "+91 98765 43210" },
                ].map(f => (
                  <div key={f.name} className="flex flex-col gap-1">
                    <label className="text-[12px] font-semibold text-gray-700">
                      {f.label}<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input type={f.type} name={f.name} placeholder={f.placeholder} required
                      className="px-3 py-2 border border-gray-300 rounded-[7px] text-[13px] text-[#111] outline-none focus:border-black transition-colors" />
                  </div>
                ))}

                {/* Info note */}
                <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                  <span className="material-symbols-outlined text-blue-500 text-[14px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                  <p className="text-[10px] text-blue-700 leading-relaxed">
                    After approval, you will receive your <strong>login credentials via email</strong> within 1–2 business days.
                  </p>
                </div>

                <button type="submit" disabled={loading}
                  className="mt-1 py-2.5 bg-[#111] hover:bg-[#333] disabled:opacity-60 text-white rounded-lg text-[13.5px] font-semibold transition-colors w-full">
                  {loading ? "Submitting…" : "Submit Registration Request"}
                </button>
              </form>

              <p className="mt-4 text-[12px] text-gray-500 text-center">
                Already registered?{" "}
                <Link href="/login/college" className="text-[#111] font-semibold hover:underline">College Login</Link>
              </p>
              <p className="mt-2.5 text-[11px] text-gray-400 text-center">
                By registering, you agree to our{" "}
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
