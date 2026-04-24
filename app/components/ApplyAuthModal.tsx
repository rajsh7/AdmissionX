"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPortal } from "react-dom";

interface Props {
  redirectTo: string;
  onClose: () => void;
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

export default function ApplyAuthModal({ redirectTo, onClose }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<"signup" | "login">("signup");

  useEffect(() => { setMounted(true); }, []);

  // Signup
  const [signupData, setSignupData] = useState({ name: "", email: "", phone: "", password: "" });
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setSignupError("");
    setSignupLoading(true);
    try {
      const res = await fetch("/api/signup/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...signupData, captchaOk: true }),
      });
      const data = await res.json();
      if (!res.ok) { setSignupError(data.error || "Signup failed."); return; }
      onClose();
      router.push(redirectTo);
    } catch {
      setSignupError("Network error. Please try again.");
    } finally {
      setSignupLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/login/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        onClose();
        router.push(redirectTo);
      } else if (res.status === 403) {
        setLoginError(data.error || "Please verify your email before logging in.");
        setUnverifiedEmail(loginEmail);
      } else {
        setLoginError(data.error || "Login failed. Please check your credentials.");
      }
    } catch {
      setLoginError("Network error. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  }

  // Google OAuth — store redirect in sessionStorage so callback can use it
  function handleGoogle() {
    sessionStorage.setItem("apply_redirect", redirectTo);
    window.location.href = "/api/auth/google";
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      style={{ zIndex: 999999 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] px-8 py-8 max-h-[95vh] overflow-y-auto">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px] text-gray-500">close</span>
        </button>

        {/* ── SIGNUP ── */}
        {tab === "signup" && (
          <>
            <h1 className="text-[24px] font-bold text-[#111] mb-1">Student Signup</h1>
            <p className="text-[13px] text-gray-500 mb-5">Create your free student account today.</p>

            <button
              onClick={handleGoogle}
              className="flex items-center justify-center gap-2.5 w-full py-2.5 border border-gray-300 rounded-lg text-[13px] font-medium text-[#111] bg-white hover:border-gray-400 transition-colors mb-4"
            >
              <GoogleIcon /> Sign up with Google
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[11px] text-gray-400 font-semibold tracking-wider">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {signupError && (
              <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{signupError}</div>
            )}

            <form onSubmit={handleSignup} className="flex flex-col gap-3">
              {[
                { label: "Name", key: "name", type: "text", placeholder: "Enter your name" },
                { label: "Email", key: "email", type: "email", placeholder: "Enter your email" },
                { label: "Phone Number", key: "phone", type: "tel", placeholder: "Enter your phone number" },
                { label: "Password", key: "password", type: "password", placeholder: "Create a password" },
              ].map(f => (
                <div key={f.key} className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-gray-700">
                    {f.label}<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    type={f.type} required
                    placeholder={f.placeholder}
                    value={signupData[f.key as keyof typeof signupData]}
                    onChange={e => setSignupData(p => ({ ...p, [f.key]: e.target.value }))}
                    minLength={f.key === "password" ? 8 : undefined}
                    className="px-3 py-2 border border-gray-300 rounded-[7px] text-[13px] text-[#111] bg-[#f3f4f6] outline-none focus:border-black focus:bg-white transition-colors"
                  />
                </div>
              ))}
              <button
                type="submit" disabled={signupLoading}
                className="mt-2 py-2.5 bg-[#111] hover:bg-[#333] disabled:opacity-60 text-white rounded-lg text-[13.5px] font-semibold transition-colors w-full"
              >
                {signupLoading ? "Creating…" : "Sign up"}
              </button>
            </form>

            <p className="mt-4 text-[12px] text-gray-500 text-center">
              Already have an account?{" "}
              <button onClick={() => { setTab("login"); setSignupError(""); }} className="text-[#111] font-bold hover:underline">
                Log in
              </button>
            </p>
            <p className="mt-2.5 text-[11px] text-gray-400 text-center">
              By creating an account, you agree to our{" "}
              <Link href="/terms-and-conditions" className="text-gray-500 underline" target="_blank">terms of use</Link>.
            </p>
          </>
        )}

        {/* ── LOGIN ── */}
        {tab === "login" && (
          <>
            <h1 className="text-[24px] font-bold text-[#111] mb-1">Student Login</h1>
            <p className="text-[13px] text-gray-500 mb-5">Sign in to your AdmissionX account.</p>

            <button
              onClick={handleGoogle}
              className="flex items-center justify-center gap-2.5 w-full py-2.5 border border-gray-300 rounded-lg text-[13px] font-medium text-[#111] bg-white hover:border-gray-400 transition-colors mb-4"
            >
              <GoogleIcon /> Sign in with Google
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[11px] text-gray-400 font-semibold tracking-wider">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {loginError && (
              <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
                <p>{loginError}</p>
                {unverifiedEmail && (
                  <div className="mt-2 pt-2 border-t border-red-200">
                    <p className="text-red-500 mb-1">Didn&apos;t receive the email?</p>
                    <button
                      type="button" disabled={resendLoading || resendSent}
                      onClick={async () => {
                        setResendLoading(true);
                        try {
                          await fetch("/api/auth/resend-activation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: unverifiedEmail }) });
                          setResendSent(true);
                        } finally { setResendLoading(false); }
                      }}
                      className="font-semibold text-red-600 hover:underline disabled:opacity-60"
                    >
                      {resendSent ? "Activation email sent!" : resendLoading ? "Sending…" : "Resend activation email"}
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-gray-700">Email<span className="text-red-500 ml-0.5">*</span></label>
                <input
                  type="email" required placeholder="Enter your email"
                  value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-[7px] text-[13px] text-[#111] bg-[#f3f4f6] outline-none focus:border-black focus:bg-white transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-[12px] font-semibold text-gray-700">Password<span className="text-red-500 ml-0.5">*</span></label>
                  <Link href="/forgot-password" className="text-[11px] text-gray-500 hover:text-black hover:underline" target="_blank">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} required placeholder="Enter your password"
                    value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-[7px] text-[13px] text-[#111] bg-[#f3f4f6] outline-none focus:border-black focus:bg-white transition-colors"
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowPassword(p => !p)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <span className="material-symbols-outlined text-[17px]">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>
              <button
                type="submit" disabled={loginLoading}
                className="mt-2 py-2.5 bg-[#111] hover:bg-[#333] disabled:opacity-60 text-white rounded-lg text-[13.5px] font-semibold transition-colors w-full"
              >
                {loginLoading ? "Signing in…" : "Log in"}
              </button>
            </form>

            <p className="mt-4 text-[12px] text-gray-500 text-center">
              Don&apos;t have an account?{" "}
              <button onClick={() => { setTab("signup"); setLoginError(""); }} className="text-[#111] font-bold hover:underline">
                Sign up
              </button>
            </p>
            <p className="mt-2.5 text-[11px] text-gray-400 text-center">
              By logging in, you agree to our{" "}
              <Link href="/terms-and-conditions" className="text-gray-500 underline" target="_blank">terms of use</Link>.
            </p>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
