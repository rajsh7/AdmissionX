"use client";

import { useState } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props {
  college: CollegeUser;
}

// -- Password strength helpers --------------------------------------------------
interface StrengthResult {
  score: number;       // 0–4
  label: string;
  color: string;
  barColor: string;
  checks: {
    length: boolean;
    upper: boolean;
    lower: boolean;
    number: boolean;
    special: boolean;
  };
}

function analysePassword(pw: string): StrengthResult {
  const checks = {
    length:  pw.length >= 8,
    upper:   /[A-Z]/.test(pw),
    lower:   /[a-z]/.test(pw),
    number:  /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };

  const passed = Object.values(checks).filter(Boolean).length;

  const score =
    pw.length === 0 ? 0 :
    passed <= 2      ? 1 :
    passed === 3     ? 2 :
    passed === 4     ? 3 : 4;

  const labels  = ["", "Weak", "Fair", "Good", "Strong"];
  const colors  = ["", "text-red-500", "text-amber-500", "text-blue-500", "text-emerald-500"];
  const barClrs = ["", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"];

  return {
    score,
    label:    labels[score]  ?? "",
    color:    colors[score]  ?? "",
    barColor: barClrs[score] ?? "",
    checks,
  };
}

// -- Strength bar ---------------------------------------------------------------
function StrengthBar({ strength }: { strength: StrengthResult }) {
  if (strength.score === 0) return null;

  return (
    <div className="space-y-2 mt-2">
      {/* Bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
              i <= strength.score
                ? strength.barColor
                : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>

      {/* Label */}
      <p className={`text-xs font-bold ${strength.color}`}>
        {strength.label}
      </p>

      {/* Requirement checklist */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 pt-1">
        {(
          [
            { key: "length",  label: "Min. 8 characters" },
            { key: "upper",   label: "Uppercase letter"  },
            { key: "lower",   label: "Lowercase letter"  },
            { key: "number",  label: "Number (0–9)"      },
            { key: "special", label: "Special character" },
          ] as const
        ).map(({ key, label }) => {
          const ok = strength.checks[key];
          return (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className={`material-symbols-rounded text-[14px] transition-colors ${
                  ok ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"
                }`}
                style={{ fontVariationSettings: ok ? "'FILL' 1" : "'FILL' 0" }}
              >
                {ok ? "check_circle" : "radio_button_unchecked"}
              </span>
              <span
                className={`text-[11px] font-medium transition-colors ${
                  ok
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -- Password field -------------------------------------------------------------
function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "••••••••"}
          autoComplete={autoComplete}
          className="w-full px-4 py-2.5 pr-11 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
        >
          <span
            className="material-symbols-rounded text-xl"
            style={{ fontVariationSettings: show ? "'FILL' 1" : "'FILL' 0" }}
          >
            {show ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------
export default function SettingsTab({ college }: Props) {
  const slug = college.slug;

  // -- Password change state -------------------------------------------------
  const [currentPw, setCurrentPw] = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving,    setSaving]    = useState(false);
  const [pwError,   setPwError]   = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const strength = analysePassword(newPw);

  const confirmMismatch = confirmPw.length > 0 && confirmPw !== newPw;
  const confirmMatch    = confirmPw.length > 0 && confirmPw === newPw;

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (!currentPw)        { setPwError("Current password is required.");        return; }
    if (!newPw)            { setPwError("New password is required.");             return; }
    if (newPw.length < 8)  { setPwError("New password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { setPwError("Passwords do not match.");             return; }
    if (newPw === currentPw) { setPwError("New password must differ from the current one."); return; }

    setSaving(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/settings`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          action:          "change_password",
          currentPassword: currentPw,
          newPassword:     newPw,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to change password.");

      setPwSuccess(data.message ?? "Password changed successfully.");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* -- Page header ------------------------------------------------------ */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          Settings
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your account preferences and security
        </p>
      </div>

      {/* -- Account info card ------------------------------------------------ */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xl font-black text-primary">
              {college.name
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0]?.toUpperCase() ?? "")
                .join("")}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 dark:text-white text-lg leading-snug truncate">
              {college.name}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
              {college.email}
            </p>
            <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
              <span
                className="material-symbols-rounded text-[11px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              College Account
            </span>
          </div>
        </div>
      </div>

      {/* -- Change Password card ---------------------------------------------- */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">

        {/* Card header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <span
              className="material-symbols-rounded text-xl text-amber-600 dark:text-amber-400"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              lock
            </span>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm leading-tight">
              Change Password
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update your login password below
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="p-6 space-y-5">

          {/* Current password */}
          <PasswordField
            label="Current Password"
            value={currentPw}
            onChange={(v) => { setCurrentPw(v); setPwError(""); setPwSuccess(""); }}
            placeholder="Enter your current password"
            autoComplete="current-password"
          />

          <div className="border-t border-slate-100 dark:border-slate-700" />

          {/* New password + strength */}
          <div className="space-y-1">
            <PasswordField
              label="New Password"
              value={newPw}
              onChange={(v) => { setNewPw(v); setPwError(""); setPwSuccess(""); }}
              placeholder="Create a strong new password"
              autoComplete="new-password"
            />
            <StrengthBar strength={strength} />
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Confirm New Password
            </label>
            <div className="relative">
              <PasswordField
                label=""
                value={confirmPw}
                onChange={(v) => { setConfirmPw(v); setPwError(""); setPwSuccess(""); }}
                placeholder="Repeat your new password"
                autoComplete="new-password"
              />
              {/* Match indicator */}
              {confirmPw.length > 0 && (
                <div className={`mt-1.5 flex items-center gap-1.5 text-xs font-semibold ${
                  confirmMatch
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-500"
                }`}>
                  <span
                    className="material-symbols-rounded text-[14px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {confirmMatch ? "check_circle" : "cancel"}
                  </span>
                  {confirmMatch ? "Passwords match" : "Passwords do not match"}
                </div>
              )}
            </div>
          </div>

          {/* Error banner */}
          {pwError && (
            <div className="flex items-start gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <span
                className="material-symbols-rounded text-red-500 text-lg mt-0.5 shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                error
              </span>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                {pwError}
              </p>
            </div>
          )}

          {/* Success banner */}
          {pwSuccess && (
            <div className="flex items-start gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <span
                className="material-symbols-rounded text-emerald-500 text-lg mt-0.5 shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                {pwSuccess}
              </p>
            </div>
          )}

          {/* Submit */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={
                saving ||
                !currentPw ||
                !newPw ||
                newPw !== confirmPw ||
                strength.score < 2
              }
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-95 transition-all"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating…
                </>
              ) : (
                <>
                  <span
                    className="material-symbols-rounded text-base"
                    style={{ fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 20" }}
                  >
                    lock_reset
                  </span>
                  Update Password
                </>
              )}
            </button>

            {strength.score < 2 && newPw.length > 0 && (
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                Password must be at least &ldquo;Fair&rdquo; strength to continue.
              </p>
            )}
          </div>
        </form>
      </div>

      {/* -- Security tips ----------------------------------------------------- */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <span
            className="material-symbols-rounded text-xl text-blue-500 dark:text-blue-400 mt-0.5 shrink-0"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}
          >
            shield
          </span>
          <div>
            <p className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-1">
              Security Tips
            </p>
            <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
              <li>Use a unique password that you don&apos;t use elsewhere</li>
              <li>Mix uppercase, lowercase, numbers and special characters</li>
              <li>Avoid using personal information like names or dates</li>
              <li>Change your password regularly — at least once every 6 months</li>
            </ul>
          </div>
        </div>
      </div>

      {/* -- Account info (read-only) ------------------------------------------ */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
            <span
              className="material-symbols-rounded text-xl text-slate-500 dark:text-slate-400"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              info
            </span>
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">
            Account Information
          </h3>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {[
            { label: "College Name", value: college.name,  icon: "school"       },
            { label: "Email Address", value: college.email, icon: "mail"         },
            { label: "Profile Slug",  value: college.slug,  icon: "link"         },
          ].map(({ label, value, icon }) => (
            <div key={label} className="flex items-center gap-4 px-6 py-4">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                <span
                  className="material-symbols-rounded text-base text-slate-500 dark:text-slate-400"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  {icon}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {label}
                </p>
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                  {value}
                </p>
              </div>
              <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 font-medium shrink-0">
                Read only
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
