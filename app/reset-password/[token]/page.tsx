"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthBackgroundSlider } from "../../components/AuthBackgroundSlider";
import Header from "../../components/Header";

interface PageProps {
  params: Promise<{ token: string }>;
}

type TokenState = "verifying" | "valid" | "invalid";

const LOGIN_PATHS: Record<string, string> = {
  student: "/login/student",
  college: "/login/college",
  admin: "/login",
};

const ROLE_LABELS: Record<string, string> = {
  student: "Student",
  college: "College",
  admin: "Admin",
};

export default function ResetPasswordPage({ params }: PageProps) {
  const { token } = use(params);
  const router = useRouter();

  // Token verification state
  const [tokenState, setTokenState] = useState<TokenState>("verifying");
  const [tokenError, setTokenError] = useState("");
  const [role, setRole] = useState<string>("");

  // Form state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password strength
  const strength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][
    strength
  ];
  const strengthColor = [
    "",
    "bg-red-500",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-emerald-400",
    "bg-emerald-500",
  ][strength];

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setTokenState("invalid");
      setTokenError("No reset token provided.");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(
          `/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`,
        );
        const data = await res.json();

        if (res.ok && data.valid) {
          setRole(data.role ?? "student");
          setTokenState("valid");
        } else {
          setTokenError(data.error || "This reset link is invalid or expired.");
          setTokenState("invalid");
        }
      } catch {
        setTokenError("Network error. Please check your connection.");
        setTokenState("invalid");
      }
    }

    verify();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        // Auto-redirect to the correct login page after 3 seconds
        setTimeout(() => {
          router.push(LOGIN_PATHS[data.role ?? role] ?? "/login/student");
        }, 3000);
      } else {
        setFormError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setFormError("Network error. Please try again.");
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
          <span className="material-symbols-outlined text-9xl">lock_open</span>
        </div>
        <div className="absolute bottom-24 right-10 opacity-10 pointer-events-none select-none">
          <span className="material-symbols-outlined text-9xl">
            password
          </span>
        </div>

        <div className="w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none p-8 md:p-12 relative z-10 border border-slate-100 dark:border-slate-800">

          {/* -- Verifying State -- */}
          {tokenState === "verifying" && (
            <div className="flex flex-col items-center justify-center py-10 gap-5">
              <svg
                className="animate-spin h-12 w-12 text-primary"
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
              <div className="text-center">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Verifying your reset link…
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  This will only take a moment.
                </p>
              </div>
            </div>
          )}

          {/* -- Invalid Token State -- */}
          {tokenState === "invalid" && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto">
                <span
                  className="material-symbols-outlined text-red-500 text-5xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  link_off
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Link Invalid or Expired
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  {tokenError}
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
                    Reset links expire after <strong>15 minutes</strong> and
                    can only be used once. Please request a new one.
                  </p>
                </div>
              </div>

              <Link
                href="/forgot-password"
                className="w-full bg-primary hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  refresh
                </span>
                Request a New Link
              </Link>

              <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
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
              </div>
            </div>
          )}

          {/* -- Success State -- */}
          {tokenState === "valid" && success && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mx-auto">
                <span
                  className="material-symbols-outlined text-emerald-500 text-5xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Password Updated!
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Your password has been changed successfully. You will be
                  redirected to the{" "}
                  <strong>{ROLE_LABELS[role] ?? "login"}</strong> page in a
                  moment…
                </p>
              </div>

              {/* Animated redirect indicator */}
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                <svg
                  className="animate-spin h-4 w-4"
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
                Redirecting…
              </div>

              <Link
                href={LOGIN_PATHS[role] ?? "/login/student"}
                className="w-full bg-primary hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  login
                </span>
                Go to {ROLE_LABELS[role] ?? "Student"} Login
              </Link>
            </div>
          )}

          {/* -- Form State -- */}
          {tokenState === "valid" && !success && (
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
                  Set New Password
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Choose a strong password for your{" "}
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {ROLE_LABELS[role] ?? ""}
                  </span>{" "}
                  account.
                </p>
              </div>

              {/* Error Banner */}
              {formError && (
                <div className="mb-5 flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                  <span
                    className="material-symbols-outlined text-red-500 text-[20px] mt-0.5 shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    error
                  </span>
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                    {formError}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                      lock
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
                      autoComplete="new-password"
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

                  {/* Strength meter */}
                  {password.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              i <= strength
                                ? strengthColor
                                : "bg-slate-200 dark:bg-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                      <p
                        className={`text-xs font-medium ${
                          strength <= 1
                            ? "text-red-500"
                            : strength <= 2
                              ? "text-orange-500"
                              : strength <= 3
                                ? "text-yellow-600"
                                : "text-emerald-600"
                        }`}
                      >
                        {strengthLabel}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                      lock_reset
                    </span>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all ${
                        confirmPassword.length > 0
                          ? password === confirmPassword
                            ? "border-emerald-400 focus:border-emerald-400"
                            : "border-red-400 focus:border-red-400"
                          : "border-slate-200 dark:border-slate-700 focus:border-primary"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((p) => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      tabIndex={-1}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showConfirm ? "visibility" : "visibility_off"}
                      </span>
                    </button>

                    {/* Match indicator */}
                    {confirmPassword.length > 0 && (
                      <span
                        className={`material-symbols-outlined absolute right-12 top-1/2 -translate-y-1/2 text-[20px] ${
                          password === confirmPassword
                            ? "text-emerald-500"
                            : "text-red-400"
                        }`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {password === confirmPassword ? "check_circle" : "cancel"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Requirements hint */}
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 space-y-1.5">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    Password requirements:
                  </p>
                  {[
                    { label: "At least 8 characters", ok: password.length >= 8 },
                    { label: "Uppercase letter (A–Z)", ok: /[A-Z]/.test(password) },
                    { label: "Number (0–9)", ok: /[0-9]/.test(password) },
                  ].map((req) => (
                    <div key={req.label} className="flex items-center gap-2">
                      <span
                        className={`material-symbols-outlined text-[16px] ${
                          req.ok ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"
                        }`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {req.ok ? "check_circle" : "radio_button_unchecked"}
                      </span>
                      <span
                        className={`text-xs ${
                          req.ok
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-400"
                        }`}
                      >
                        {req.label}
                      </span>
                    </div>
                  ))}
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
                      Updating password…
                    </>
                  ) : (
                    <>
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        lock_open
                      </span>
                      Update Password
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
