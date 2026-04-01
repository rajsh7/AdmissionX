"use client";

import { useState } from "react";

interface Props {
  user: { id: string | number; name: string; email: string } | null;
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters",     pass: password.length >= 8        },
    { label: "Uppercase letter",  pass: /[A-Z]/.test(password)      },
    { label: "Lowercase letter",  pass: /[a-z]/.test(password)      },
    { label: "Number",            pass: /\d/.test(password)         },
    { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const pct   = (score / checks.length) * 100;

  const color =
    score <= 1 ? "bg-red-500"
    : score <= 2 ? "bg-amber-500"
    : score <= 3 ? "bg-yellow-400"
    : score <= 4 ? "bg-blue-500"
    : "bg-emerald-500";

  const label =
    score <= 1 ? "Very Weak"
    : score <= 2 ? "Weak"
    : score <= 3 ? "Fair"
    : score <= 4 ? "Strong"
    : "Very Strong";

  if (!password) return null;

  return (
    <div className="mt-3 space-y-2">
      {/* Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
        <div
          className={`${color} h-full rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {checks.map((c) => (
            <span
              key={c.label}
              className={`flex items-center gap-1 text-[10px] font-semibold ${
                c.pass ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              <span className="material-symbols-outlined text-[11px]">
                {c.pass ? "check_circle" : "radio_button_unchecked"}
              </span>
              {c.label}
            </span>
          ))}
        </div>
        <span
          className={`text-[10px] font-black uppercase tracking-wider ml-4 shrink-0 ${
            score <= 2
              ? "text-red-500"
              : score <= 3
                ? "text-amber-500"
                : "text-emerald-600"
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

export default function SettingsTab({ user }: Props) {
  // ── Password Change ────────────────────────────────────────────────────────
  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSaving, setPwSaving]     = useState(false);
  const [pwError, setPwError]       = useState<string | null>(null);
  const [pwSuccess, setPwSuccess]   = useState(false);

  // ── Notification prefs (local state only — no DB yet) ─────────────────────
  const [notifEmail, setNotifEmail]   = useState(true);
  const [notifSMS, setNotifSMS]       = useState(false);
  const [notifDeadline, setNotifDeadline] = useState(true);
  const [notifUpdates, setNotifUpdates]   = useState(true);
  const [notifPromo, setNotifPromo]       = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);

    if (!currentPw || !newPw || !confirmPw) {
      setPwError("Please fill in all password fields.");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("New password and confirmation do not match.");
      return;
    }
    if (newPw.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (newPw === currentPw) {
      setPwError("New password must be different from your current password.");
      return;
    }

    setPwSaving(true);
    try {
      const res = await fetch(`/api/student/${user?.id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action:          "change_password",
          currentPassword: currentPw,
          newPassword:     newPw,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error ?? "Failed to change password. Please try again.");
        return;
      }
      setPwSuccess(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setTimeout(() => setPwSuccess(false), 5000);
    } catch {
      setPwError("Network error. Please check your connection and try again.");
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="pb-24 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          Account Settings
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your security and notification preferences.
        </p>
      </div>

      {/* ── Account Overview Card ───────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-8">
        <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary text-xl">
            manage_accounts
          </span>
          Account Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Student ID */}
          <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Student ID
            </p>
            <p className="text-2xl font-black text-primary">
              ADX-{String(user?.id ?? 0).padStart(5, "0")}
            </p>
          </div>

          {/* Display Name */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Display Name
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
              {user?.name ?? "—"}
            </p>
          </div>

          {/* Email */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5 sm:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Email Address
            </p>
            <div className="flex items-center justify-between gap-4">
              <p className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                {user?.email ?? "—"}
              </p>
              <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full shrink-0">
                <span
                  className="material-symbols-outlined text-[12px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              To change your email address, please contact support.
            </p>
          </div>
        </div>
      </div>

      {/* ── Change Password Card ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-8">
        <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary text-xl">
            lock
          </span>
          Change Password
        </h2>
        <p className="text-sm text-slate-500 mb-8">
          Use a strong password with a mix of letters, numbers and symbols.
          We recommend updating your password every 6 months.
        </p>

        <form onSubmit={handleChangePassword} className="space-y-5">
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Enter current password"
                autoComplete="current-password"
                required
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-12 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showCurrent ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
                required
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-12 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showNew ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            <PasswordStrength password={newPw} />
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Re-enter new password"
                autoComplete="new-password"
                required
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-12 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showConfirm ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {/* Match indicator */}
            {confirmPw && (
              <p
                className={`text-[11px] font-semibold flex items-center gap-1 mt-1 ${
                  confirmPw === newPw ? "text-emerald-600" : "text-red-500"
                }`}
              >
                <span className="material-symbols-outlined text-[12px]">
                  {confirmPw === newPw ? "check_circle" : "cancel"}
                </span>
                {confirmPw === newPw ? "Passwords match" : "Passwords do not match"}
              </p>
            )}
          </div>

          {/* Feedback */}
          {pwError && (
            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <span className="material-symbols-outlined text-red-500 shrink-0 mt-0.5 text-[18px]">
                error
              </span>
              <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                {pwError}
              </p>
            </div>
          )}

          {pwSuccess && (
            <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4">
              <span
                className="material-symbols-outlined text-emerald-500 text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <p className="text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
                Password changed successfully. Please use your new password next time you log in.
              </p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={pwSaving || !currentPw || !newPw || !confirmPw}
              className="px-8 py-3 bg-primary text-white rounded-xl font-black text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {pwSaving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">
                    progress_activity
                  </span>
                  Updating…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">lock_reset</span>
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Notification Preferences ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-8">
        <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary text-xl">
            notifications
          </span>
          Notification Preferences
        </h2>
        <p className="text-sm text-slate-500 mb-8">
          Choose how and when AdmissionX notifies you.
        </p>

        <div className="space-y-1">
          {[
            {
              label:   "Email Notifications",
              desc:    "Receive updates and alerts via email",
              icon:    "mail",
              value:   notifEmail,
              toggle:  setNotifEmail,
            },
            {
              label:   "SMS / WhatsApp Notifications",
              desc:    "Receive urgent alerts via SMS or WhatsApp",
              icon:    "sms",
              value:   notifSMS,
              toggle:  setNotifSMS,
            },
            {
              label:   "Deadline Reminders",
              desc:    "Get reminded 7 days and 1 day before application deadlines",
              icon:    "event_upcoming",
              value:   notifDeadline,
              toggle:  setNotifDeadline,
            },
            {
              label:   "Application Status Updates",
              desc:    "Be notified when your application status changes",
              icon:    "description",
              value:   notifUpdates,
              toggle:  setNotifUpdates,
            },
            {
              label:   "Promotions & Newsletters",
              desc:    "Occasional news about new colleges, scholarships, and features",
              icon:    "campaign",
              value:   notifPromo,
              toggle:  setNotifPromo,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-start justify-between gap-4 py-5 border-b border-slate-100 dark:border-slate-700 last:border-0"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    {item.icon}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => item.toggle((v) => !v)}
                role="switch"
                aria-checked={item.value}
                className={`relative shrink-0 w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40 mt-1 ${
                  item.value
                    ? "bg-primary shadow-inner shadow-primary/30"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 flex items-center justify-center ${
                    item.value ? "translate-x-6" : "translate-x-0"
                  }`}
                >
                  {item.value && (
                    <span
                      className="material-symbols-outlined text-primary text-[10px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check
                    </span>
                  )}
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* Save prefs button */}
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={() => {
              // In production: POST to /api/student/[id]/settings with notification prefs
              alert("Notification preferences saved! (Demo — no DB persistence yet)");
            }}
            className="px-8 py-3 bg-primary text-white rounded-xl font-black text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            Save Preferences
          </button>
        </div>
      </div>

      {/* ── Danger Zone ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-red-200 dark:border-red-900/50 shadow-sm p-8">
        <h2 className="text-lg font-black text-red-600 flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-xl">
            warning
          </span>
          Danger Zone
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          These actions are irreversible. Please proceed with caution.
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
          <div>
            <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Delete Account
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Permanently delete your AdmissionX account and all associated data.
              This cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              alert(
                "Account deletion requires contacting support at support@admissionx.in",
              )
            }
            className="shrink-0 px-5 py-2.5 border-2 border-red-400 text-red-600 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}




