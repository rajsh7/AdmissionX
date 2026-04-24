"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "../../../components/Header";
import { AuthBackgroundSlider } from "../../../components/AuthBackgroundSlider";
import Footer from "../../../components/Footer";

export default function StudentSignupSuccessPage() {
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const handleResendMail = async () => {
    setResendLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setResendLoading(false);
    setResendSent(true);
    setTimeout(() => setResendSent(false), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col font-display relative text-slate-900 dark:text-slate-100">
      <AuthBackgroundSlider />
      <Header />

      {/* ── Main ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center p-6 pt-48 pb-44">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-primary/5 border border-primary/5 overflow-hidden">
          {/* Card Body */}
          <div className="flex flex-col items-center text-center p-8">
            {/* ── Illustration ─────────────────────────────────── */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150 pointer-events-none" />
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary to-rose-400 opacity-10 rounded-full animate-pulse" />
                <div className="relative z-10 flex flex-col items-center justify-center gap-2">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border-4 border-primary/20">
                    <span className="material-symbols-outlined text-primary"
                      style={{ fontSize: "3rem", fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}>
                      school
                    </span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 border-2 border-white dark:border-slate-900">
                    <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <h1 className="text-slate-900 dark:text-slate-100 text-2xl font-bold tracking-tight">
                Thank you for registering in{" "}
                <span className="text-primary">AdmissionX!</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                Your journey towards academic excellence begins here. You will receive a confirmation mail in your registered mail&nbsp;ID shortly.
              </p>
              <div className="inline-flex items-center justify-center gap-2 py-1.5 px-3 bg-primary/5 rounded-full border border-primary/10 mx-auto">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: "1rem" }}>verified_user</span>
                <span className="text-xs font-medium text-primary">Please verify your email address</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link href="/"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl h-11 px-5 bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined">home</span>
                <span>Go to Homepage</span>
              </Link>

              <button onClick={handleResendMail} disabled={resendLoading || resendSent}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl h-11 px-5 bg-primary/5 hover:bg-primary/10 text-primary text-sm font-bold transition-all border border-primary/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {resendLoading ? (
                  <>
                    <span
                      className="material-symbols-outlined animate-spin"
                      style={{ fontSize: "1.2rem" }}
                    >
                      progress_activity
                    </span>
                    <span>Sending…</span>
                  </>
                ) : resendSent ? (
                  <>
                    <span
                      className="material-symbols-outlined text-green-500"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      Mail Sent!
                    </span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">
                      forward_to_inbox
                    </span>
                    <span>Resend Mail</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── Support Footer Strip ──────────────────────────────── */}
          <div className="bg-primary/5 px-6 py-5 border-t border-primary/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-primary shadow-sm shrink-0">
                <span className="material-symbols-outlined text-xl">help</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Need help?{" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Contact our support team
                </span>
              </p>
            </div>

            <div className="flex gap-4">
              <a
                href="mailto:help@admissionx.edu"
                aria-label="Email support"
                className="text-slate-400 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">mail</span>
              </a>
              <a
                href="#"
                aria-label="Live chat support"
                className="text-slate-400 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">support_agent</span>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}




