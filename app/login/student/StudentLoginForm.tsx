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

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

export default function StudentLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard/student";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
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
      const res = await fetch("/api/login/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        // Full page reload so cookie is read fresh by SSR
        window.location.href = data.user?.id ? `/dashboard/student/${data.user.id}` : redirectTo;
      } else if (res.status === 403) {
        setError(data.error || "Please verify your email before logging in.");
        setUnverifiedEmail(email);
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
      <main className="relative flex-1 flex items-center justify-center px-4 sm:px-6 py-24 md:py-32 lg:py-48 z-10">
        <div className="flex flex-col md:flex-row w-full max-w-[920px] rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden" style={{ minHeight: "520px" }}>

          {/* LEFT: Slider */}
          <div className="hidden md:block w-[38%] relative flex-shrink-0" style={{ minHeight: "520px" }}>
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
          <div className="flex-1 bg-[#f3f4f6] flex items-center justify-center px-4 sm:px-8 py-10">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-md px-6 sm:px-8 py-8">
              <h1 className="text-[20px] md:text-[24px] font-bold text-[#111] mb-1">Student Login</h1>
              <p className="text-[12px] md:text-[13px] text-gray-500 mb-6">Sign in to your AdmissionX account.</p>

              <a href="/api/auth/google"
                className="flex items-center justify-center gap-2.5 w-full py-2 md:py-2.5 border border-gray-300 rounded-lg text-[12px] md:text-[13px] font-medium text-[#111] bg-white hover:border-gray-400 transition-colors mb-4">
                <GoogleIcon />Sign in with Google
              </a>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[11px] text-gray-400 font-semibold tracking-wider">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {error && (
                <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
                  <p>{error}</p>
                  {unverifiedEmail && (
                    <div className="mt-2 pt-2 border-t border-red-200">
                      <p className="text-red-500 mb-1">Didn&apos;t receive the email?</p>
                      <button type="button" disabled={resendLoading || resendSent}
                        onClick={async () => {
                          setResendLoading(true);
                          try {
                            await fetch("/api/auth/resend-activation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: unverifiedEmail }) });
                            setResendSent(true);
                          } finally { setResendLoading(false); }
                        }}
                        className="font-semibold text-red-600 hover:underline disabled:opacity-60">
                        {resendSent ? "Activation email sent!" : resendLoading ? "Sending…" : "Resend activation email"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] md:text-[12px] font-semibold text-gray-700">Email<span className="text-red-500 ml-0.5">*</span></label>
                  <input type="email" placeholder="Enter your email" required
                    value={email} onChange={e => setEmail(e.target.value)} suppressHydrationWarning
                    className="px-3 py-2 border border-gray-300 rounded-[7px] text-[12px] md:text-[13px] placeholder:text-[11px] md:placeholder:text-[12px] text-[#111] outline-none focus:border-black transition-colors" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] md:text-[12px] font-semibold text-gray-700">Password<span className="text-red-500 ml-0.5">*</span></label>
                    <Link href="/forgot-password" className="text-[10px] md:text-[11px] text-gray-500 hover:text-black hover:underline">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} placeholder="Enter your password" required
                      value={password} onChange={e => setPassword(e.target.value)} suppressHydrationWarning
                      className="w-full px-3 py-2 border border-gray-300 rounded-[7px] text-[12px] md:text-[13px] placeholder:text-[11px] md:placeholder:text-[12px] text-[#111] outline-none focus:border-black transition-colors pr-9" />
                    <button type="button" tabIndex={-1} onClick={() => setShowPassword(p => !p)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <span className="material-symbols-outlined text-[17px]">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="mt-2 py-2 md:py-2.5 bg-[#111] hover:bg-[#333] disabled:opacity-60 text-white rounded-lg text-[13px] md:text-[13.5px] font-semibold transition-colors w-full">
                  {loading ? "Signing in…" : "Log in"}
                </button>
              </form>

              <p className="mt-4 text-[11px] md:text-[12px] text-gray-500 text-center">
                Don&apos;t have an account?{" "}
                <Link href="/signup/student" className="text-[#111] font-semibold hover:underline">Sign up</Link>
              </p>
              <p className="mt-2.5 text-[10px] md:text-[11px] text-gray-400 text-center">
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
