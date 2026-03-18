"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import { AuthBackgroundSlider } from "../../components/AuthBackgroundSlider";
import Link from "next/link";

export default function CollegeSignupPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");
    const captchaOk = formData.get("captcha") === "on";

    // Client-side validation
    if (!collegeName || !email || !contactName || !phone || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
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
        body: JSON.stringify({
          collegeName,
          email,
          contactName,
          phone,
          password,
          captchaOk,
        }),
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

      <main className="relative flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-12 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 opacity-10 pointer-events-none select-none">
          <span className="material-symbols-outlined text-9xl">apartment</span>
        </div>
        <div className="absolute bottom-10 right-10 opacity-10 pointer-events-none select-none">
          <span className="material-symbols-outlined text-[12rem]">
            workspace_premium
          </span>
        </div>

        {/* Signup Card */}
        <div className="w-full max-w-[520px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-primary/5 p-8 md:p-10 border border-slate-100 dark:border-slate-800 z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">
              <span
                className="material-symbols-outlined text-primary text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                apartment
              </span>
            </div>
            <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-bold mb-2">
              College Signup
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Register your institution to receive verified leads and manage
              applications on AdmissionX.
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
            {/* College Name */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                College / University Name{" "}
                <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  corporate_fare
                </span>
                <input
                  name="collegeName"
                  type="text"
                  placeholder="e.g. Delhi Institute of Technology"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Official Email */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                Official Email <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  mail
                </span>
                <input
                  name="email"
                  type="email"
                  placeholder="admissions@yourcollege.com"
                  required
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Contact Person */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                Contact Person Name <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  person
                </span>
                <input
                  name="contactName"
                  type="text"
                  placeholder="Admissions Head / Principal"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                Phone Number <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  call
                </span>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  required
                  autoComplete="tel"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                Password <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  lock
                </span>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                Confirm Password <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  lock_reset
                </span>
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirm ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            {/* Captcha checkbox */}
            <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
              <input
                id="college-captcha"
                name="captcha"
                type="checkbox"
                className="h-4 w-4 mt-0.5 rounded border-slate-300 text-primary focus:ring-primary shrink-0"
              />
              <label
                htmlFor="college-captcha"
                className="text-sm text-slate-600 dark:text-slate-400 leading-snug"
              >
                I confirm that the information provided is accurate and I am
                authorised to register this institution on AdmissionX.
              </label>
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
                  Submitting…
                </>
              ) : (
                <>
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    how_to_reg
                  </span>
                  Submit College Request
                </>
              )}
            </button>
          </form>

          {/* Info note */}
          <div className="mt-5 flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl px-4 py-3">
            <span
              className="material-symbols-outlined text-blue-500 text-[18px] shrink-0 mt-0.5"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              info
            </span>
            <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
              Your account will be reviewed and activated within{" "}
              <strong>1–2 business days</strong>. You will receive an email
              confirmation once approved.
            </p>
          </div>

          {/* Login link */}
          <p className="mt-6 text-center text-slate-600 dark:text-slate-400 text-sm">
            Already registered?{" "}
            <Link
              href="/login/college"
              className="text-primary font-bold hover:underline"
            >
              College Login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
