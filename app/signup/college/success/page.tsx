"use client";

import Link from "next/link";
import Header from "../../../components/Header";
import { AuthBackgroundSlider } from "../../../components/AuthBackgroundSlider";

interface Step {
  icon: string;
  title: string;
  description: string;
  status: string;
  active: boolean;
}

const steps: Step[] = [
  {
    icon: "rule",
    title: "Verification Phase",
    description:
      "Our compliance team is currently reviewing your institutional credentials. This process typically takes 24–48 business hours.",
    status: "In Progress",
    active: true,
  },
  {
    icon: "settings_suggest",
    title: "Profile Setup",
    description:
      "Once approved, you'll gain access to customize your university profile, add branding assets, and configure admission windows.",
    status: "Upcoming",
    active: false,
  },
  {
    icon: "list_alt",
    title: "Course Listing",
    description:
      "The final step is to list your courses and programs. Our AI matching system will then begin connecting you with prospective students.",
    status: "Upcoming",
    active: false,
  },
];

export default function CollegeSignupSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col font-display relative text-slate-900 dark:text-slate-100 antialiased">
      <AuthBackgroundSlider />
      <Header onLoginClick={() => {}} onRegisterClick={() => {}} />

      {/* ── Main ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center py-12 px-6 pt-32">
        <div className="max-w-4xl w-full space-y-8">
          {/* ── Hero Card ────────────────────────────────────────── */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl shadow-primary/5 border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Left — Text Content */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                {/* Success pill */}
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold mb-6 w-fit">
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "1rem",
                      fontVariationSettings: "'FILL' 1",
                    }}
                  >
                    verified
                  </span>
                  Registration Successful
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight mb-4">
                  Thank you for registering with&nbsp;AdmissionX!
                </h1>

                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8">
                  We&apos;re excited to have you on board. Please wait for admin
                  approval to access your dashboard and start managing
                  admissions.
                </p>

                <div className="flex flex-wrap gap-4">
                  <a
                    href="mailto:help@admissionx.edu"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined">
                      support_agent
                    </span>
                    Contact Support
                  </a>

                  <Link
                    href="/faq"
                    className="inline-flex items-center gap-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 px-8 rounded-lg transition-all active:scale-[0.98]"
                  >
                    View FAQ
                  </Link>
                </div>
              </div>

              {/* Right — Illustration */}
              <div className="bg-primary/5 relative min-h-[300px] flex items-center justify-center p-8">
                {/* Dot-grid pattern */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "radial-gradient(#dc2626 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />

                <div className="relative z-10 flex flex-col items-center text-center gap-4">
                  <div className="w-44 h-44 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-2xl shadow-primary/20 border-4 border-primary/10">
                    <span
                      className="material-symbols-outlined text-primary"
                      style={{
                        fontSize: "5rem",
                        fontVariationSettings:
                          "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48",
                      }}
                    >
                      handshake
                    </span>
                  </div>
                  <p className="text-primary font-bold text-xl">
                    Stronger Together
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[200px] leading-relaxed">
                    Empowering institutions through digital growth.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Next Steps Timeline ───────────────────────────────── */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">
                analytics
              </span>
              What Happens Next?
            </h2>

            <div>
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className={`relative pl-14 ${
                    index < steps.length - 1 ? "pb-10 step-line" : "pb-0"
                  }`}
                >
                  {/* Step icon circle */}
                  <div
                    className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                      step.active
                        ? "bg-primary text-white shadow-md shadow-primary/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "1.2rem" }}
                    >
                      {step.icon}
                    </span>
                  </div>

                  {/* Step content */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {step.description}
                    </p>

                    {step.active ? (
                      <span className="inline-block mt-3 px-2.5 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded text-xs font-bold uppercase tracking-wider">
                        {step.status}
                      </span>
                    ) : (
                      <span className="inline-block mt-3 px-2.5 py-0.5 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500 rounded text-xs font-bold uppercase tracking-wider">
                        {step.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Support Contact Strip ─────────────────────────────── */}
          <div className="text-center bg-slate-100 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Need immediate assistance with your application?
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-4">
              <a
                href="mailto:help@admissionx.edu"
                className="text-primary hover:underline font-bold flex items-center gap-1.5 transition-colors"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1rem" }}
                >
                  mail
                </span>
                help@admissionx.edu
              </a>

              <span className="hidden sm:block text-slate-300 dark:text-slate-600">
                |
              </span>

              <a
                href="tel:18002634890"
                className="text-primary hover:underline font-bold flex items-center gap-1.5 transition-colors"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1rem" }}
                >
                  call
                </span>
                1-800-ADMIT-X
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
