"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthBackgroundSlider } from "../components/AuthBackgroundSlider";
import Header from "../components/Header";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();

      if (res.ok) {
        setSent(true);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 font-display relative overflow-hidden">
      <AuthBackgroundSlider />
      <Header />

      <main className="relative flex-1 flex flex-col items-center justify-center px-4 pt-40 pb-12 md:pb-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-16 left-8 opacity-10 pointer-events-none select-none">
          <span className="material-symbols-outlined text-9xl">lock_reset</span>
        </div>
        <div className="absolute bottom-24 right-10 opacity-10 pointer-events-none select-none">
          <span className="material-symbols-outlined text-9xl">mail_lock</span>
        </div>

        <div className="w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none p-8 md:p-12 relative z-10 border border-slate-100 dark:border-slate-800">

          {/* ── Sent State ── */}
          {sent ? (
            <div className="text-center space-y-6">
              {/* Success icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mx-auto">
                <span
                  className="material-symbols-outlined text-emerald-500 text-5xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  mark_email_read
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Check your inbox
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  If an account exists for{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {email.trim().toLowerCase()}
                  </span>
                  , a password reset link has been sent. The link expires in{" "}
                  <strong>15 minutes</strong>.
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-left">
                <div className="flex items-start gap-2">
                  <span
                    className="material-symbols-outlined text-amber-500 text-[18px] shrink-0 mt-0.5"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    tips_and_updates
                  </span>
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    Don&apos;t see the email? Check your spam / junk folder. If
                    you still haven&apos;t received it after a few minutes, you
                    can request another link below.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setSent(false);
                    setEmail("");
                  }}
                  className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3 rounded-xl transition-all text-sm"
                >
                  Try a different email
                </button>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <Link
                    href="/login/student"
                    className="text-primary font-semibold hover:underline"
                  >
                    Student Login
                  </Link>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <Link
                    href="/login/college"
                    className="text-primary font-semibold hover:underline"
                  >
                    College Login
                  </Link>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <Link
                    href="/login"
                    className="text-primary font-semibold hover:underline"
                  >
                    Admin Login
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* ── Form State ── */
            <>
              {/* Header */}
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">
                  <span
                    className="material-symbols-outlined text-primary text-3xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    lock_reset
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  Forgot Password?
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Enter the email address linked to your account — student,
                  college, or admin — and we&apos;ll send you a secure reset
                  link.
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-5 flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                  <span
                    className="material-symbols-outlined text-red-500 text-[20px] mt-0.5 shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    error
                  </span>
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                    {error}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="forgot-email"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                      mail
                    </span>
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      required
                      autoComplete="email"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Sending reset link…
                    </>
                  ) : (
                    <>
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        send
                      </span>
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>

              {/* Back links */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-3">
                  Remember your password? Sign in as:
                </p>
                <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
                  <Link
                    href="/login/student"
                    className="flex items-center gap-1 text-primary font-semibold hover:underline"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      school
                    </span>
                    Student
                  </Link>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <Link
                    href="/login/college"
                    className="flex items-center gap-1 text-primary font-semibold hover:underline"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      apartment
                    </span>
                    College
                  </Link>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <Link
                    href="/login"
                    className="flex items-center gap-1 text-primary font-semibold hover:underline"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      admin_panel_settings
                    </span>
                    Admin
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}




