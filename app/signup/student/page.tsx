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

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

export default function StudentSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlideIndex(i => (i + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    const res = await fetch("/api/signup/student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, captchaOk: true }),
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      // Full page reload so cookie is read fresh by SSR
      window.location.href = "/signup/student/success";
    } else {
      const data = await res.json();
      setErrorMsg(data.error || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-display relative">
      <AuthBackgroundSlider />
      <Header />
      <main className="relative flex-1 flex items-center justify-center px-6 py-36 z-10">
        <div className="flex w-full max-w-[920px] rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden" style={{ minHeight: "600px" }}>

          {/* LEFT: Slider */}
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
                Join India&apos;s largest<br /><span className="font-light">student network</span>
              </h2>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3 py-2">
                  <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                  <p className="text-white text-[10px] font-medium leading-tight">500+ colleges<br /><span className="text-white/60 font-normal">across India</span></p>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3 py-2">
                  <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                  <p className="text-white text-[10px] font-medium leading-tight">Track applications<br /><span className="text-white/60 font-normal">and get admitted</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="flex-1 bg-[#f3f4f6] flex items-center justify-center px-8 py-10">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-md px-8 py-8">
              <h1 className="text-[24px] font-bold text-[#111] mb-1">Student Signup</h1>
              <p className="text-[13px] text-gray-500 mb-5">Create your free student account today.</p>

              <a href="/api/auth/google"
                className="flex items-center justify-center gap-2.5 w-full py-2.5 border border-gray-300 rounded-lg text-[13px] font-medium text-[#111] bg-white hover:border-gray-400 transition-colors mb-4">
                <GoogleIcon />Sign up with Google
              </a>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[11px] text-gray-400 font-semibold tracking-wider">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {errorMsg && (
                <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{errorMsg}</div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {[
                  { label: "Name", name: "name", type: "text", placeholder: "Enter your name" },
                  { label: "Email", name: "email", type: "email", placeholder: "Enter your email" },
                  { label: "Phone Number", name: "phone", type: "tel", placeholder: "Enter your phone number" },
                  { label: "Password", name: "password", type: "password", placeholder: "Create a password" },
                ].map(f => (
                  <div key={f.name} className="flex flex-col gap-1">
                    <label className="text-[12px] font-semibold text-gray-700">{f.label}<span className="text-red-500 ml-0.5">*</span></label>
                    <input type={f.type} name={f.name} placeholder={f.placeholder}
                      value={formData[f.name as keyof typeof formData]} onChange={handleChange}
                      required minLength={f.name === "password" ? 8 : undefined}
                      className="px-3 py-2 border border-gray-300 rounded-[7px] text-[13px] text-[#111] outline-none focus:border-black transition-colors" />
                  </div>
                ))}
                <button type="submit" disabled={loading}
                  className="mt-2 py-2.5 bg-[#111] hover:bg-[#333] disabled:opacity-60 text-white rounded-lg text-[13.5px] font-semibold transition-colors w-full">
                  {loading ? "Creating…" : "Sign up"}
                </button>
              </form>

              <p className="mt-4 text-[12px] text-gray-500 text-center">
                Already have an account?{" "}
                <Link href="/login/student" className="text-[#111] font-semibold hover:underline">Log in</Link>
              </p>
              <p className="mt-2.5 text-[11px] text-gray-400 text-center">
                By creating an account, you agree to our{" "}
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
