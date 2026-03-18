"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthBackgroundSlider } from "../../components/AuthBackgroundSlider";
import Header from "../../components/Header";
import Link from "next/link";

function CollegeLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || null;

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = {
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || ""),
    };

    try {
      const res = await fetch("/api/login/college", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect to the specific college dashboard or fallback
        const slug = data.user?.slug;
        const id = data.user?.id;
        const destination = redirectTo || `/dashboard/college/${slug ?? id}`;
        router.push(destination);
        router.refresh();
      } else {
        setError(data.error || "Login failed. Please check your credentials.");
      }
    } catch {
      setError("Network error. Please try again.");
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
          <span className="material-symbols-outlined text-9xl">apartment</span>
        </div>
        <div className="absolute bottom-24 right-10 opacity-10 pointer-events-none select-none">
          <span className="material-symbols-outlined text-9xl">groups</span>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none p-8 md:p-12 relative z-10 border border-slate-100 dark:border-slate-800">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">
              <span
                className="material-symbols-outlined text-primary text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                apartment
              </span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              College Login
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Sign in to manage your college profile, courses, and student
              applications.
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
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Official Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  mail
                </span>
                <input
                  name="email"
                  type="email"
                  placeholder="admissions@yourcollege.com"
                  required
                  autoComplete="email"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  lock
                </span>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="remember-college"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor="remember-college"
                className="text-sm text-slate-600 dark:text-slate-400"
              >
                Keep me signed in
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all transform active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
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
                  Signing in…
                </>
              ) : (
                <>
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    login
                  </span>
                  Sign in as College
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Sign up CTA */}
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm">
            Not registered yet?{" "}
            <Link
              href="/signup/college"
              className="text-primary font-bold hover:underline"
            >
              Register your college
            </Link>
          </p>
        </div>

        {/* Bottom floating info cards */}
        <div className="hidden lg:flex fixed bottom-12 left-12 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 items-center gap-3 z-10">
          <div className="bg-primary/10 text-primary p-2 rounded-lg">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              school
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              500+ Colleges & Universities
            </p>
            <p className="text-[10px] text-slate-500">
              Partner with AdmissionX today
            </p>
          </div>
        </div>

        <div className="hidden lg:flex fixed bottom-12 right-12 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 items-center gap-3 z-10">
          <div className="bg-green-100 text-green-600 p-2 rounded-lg">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              support_agent
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              Need help?
            </p>
            <p className="text-[10px] text-slate-500">
              colleges@admissionx.com
            </p>
          </div>
        </div>
      </main>
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
