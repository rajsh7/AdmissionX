"use client";

import { useState } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props {
  college: CollegeUser;
}

// ── Legend Input helper ────────────────────────────────────────────────────────
function LegendInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative mt-4">
      <label className="absolute -top-2.5 left-6 px-2 bg-white text-[13px] font-black text-slate-500 z-10 tracking-tight">
        {label}
      </label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-slate-200 rounded-[5px] px-6 py-4 text-[14px] font-bold text-slate-800 focus:ring-1 focus:ring-red-900 focus:border-red-900 transition-all placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-400"
      />
    </div>
  );
}

// ── Password strength helpers ──────────────────────────────────────────────────
interface StrengthResult {
  score: number;
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
  const score = pw.length === 0 ? 0 : passed <= 2 ? 1 : passed === 3 ? 2 : passed === 4 ? 3 : 4;
  const labels  = ["", "Weak", "Fair", "Good", "Strong"];
  const colors  = ["", "text-red-500", "text-amber-500", "text-blue-500", "text-emerald-500"];
  const barClrs = ["", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"];
  return { score, label: labels[score] ?? "", color: colors[score] ?? "", barColor: barClrs[score] ?? "", checks };
}

// ── Password field helper ──────────────────────────────────────────────────────
function PasswordField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "••••••••"}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[5px] text-[13px] font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-900 transition-all"
        />
        <button
          type="button"
          onClick={() => setShow(p => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <span className="material-symbols-outlined text-[18px]">{show ? "visibility_off" : "visibility"}</span>
        </button>
      </div>
    </div>
  );
}

export default function SettingsTab({ college }: Props) {
  const slug = college.slug;

  // ── Account State ──────────────────────────────────────────────────────────
  const [name,  setName]  = useState(college.name);
  const [email, setEmail] = useState(college.email);
  const [phone, setPhone] = useState(""); // Defaulting to empty if not in college prop

  // ── Password change state ──────────────────────────────────────────────────
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");

  const strength = analysePassword(newPw);

  async function handleUpdateAccount(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/settings`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "update_account", name, email, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update account.");
      setSuccess("Account details updated successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!currentPw || !newPw) { setError("Please fill all password fields."); return; }
    if (newPw !== confirmPw) { setError("Passwords do not match."); return; }

    setSaving(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/settings`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "change_password", currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to change password.");
      setSuccess("Password updated successfully!");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => { setSuccess(""); setShowPasswordSection(false); }, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 pb-24">
      {/* ── Inline Account Form (Joined) ─────────────────────────────────── */}
      <div className="bg-white rounded-b-[5px] border border-slate-100 shadow-md p-4 md:p-10 space-y-10 border-t-0">
        <form onSubmit={handleUpdateAccount} className="space-y-8">
          <LegendInput 
            label="College Name" 
            value={name} 
            onChange={setName} 
            placeholder="Enter your college name" 
          />
          <LegendInput 
            label="Email Address" 
            value={email} 
            onChange={setEmail} 
            placeholder="Enter your address" 
            type="email"
          />
          <LegendInput 
            label="Registered Contact Number" 
            value={phone} 
            onChange={setPhone} 
            placeholder="Enter your phone number" 
            type="tel"
          />

          {/* Messages */}
          {error && !showPasswordSection && <p className="text-red-500 text-[13px] font-black">{error}</p>}
          {success && !showPasswordSection && <p className="text-emerald-500 text-[13px] font-black">{success}</p>}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
               type="submit"
               disabled={saving}
               className="bg-[#D10000] text-white px-12 py-3 rounded-[5px] font-black text-[16px] uppercase tracking-wider hover:opacity-90 transition-all shadow-lg active:scale-95 disabled:opacity-50"
             >
               {saving && !showPasswordSection ? "..." : "Update"}
             </button>

             <button
               type="button"
               onClick={() => setShowPasswordSection(!showPasswordSection)}
               style={{ backgroundColor: '#8B3D3D' }}
               className="text-white px-8 py-3 rounded-[5px] font-bold text-[14px] hover:opacity-90 transition-all flex items-center gap-2"
             >
               Change Password
             </button>
          </div>
        </form>

        {/* ── Password Change Section (Togglable) ─────────────────────────── */}
        {showPasswordSection && (
          <div className="pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-[16px] font-black text-slate-800 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">lock</span>
              Security Update
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
              <PasswordField label="Current Password" value={currentPw} onChange={setCurrentPw} />
              <PasswordField label="New Password" value={newPw} onChange={setNewPw} />
              
              {/* Strength indicator */}
              {newPw && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`flex-1 h-1 rounded-full ${i <= strength.score ? strength.barColor : "bg-slate-100"}`} />
                    ))}
                  </div>
                  <p className={`text-[10px] font-black ${strength.color}`}>{strength.label}</p>
                </div>
              )}

              <PasswordField label="Confirm New Password" value={confirmPw} onChange={setConfirmPw} />

              {error && showPasswordSection && <p className="text-red-500 text-[12px] font-bold">{error}</p>}
              {success && showPasswordSection && <p className="text-emerald-500 text-[12px] font-bold">{success}</p>}

              <button
                type="submit"
                disabled={saving || strength.score < 2}
                className="w-full bg-[#8B3D3D] text-white py-3 rounded-[5px] font-black text-[14px] hover:opacity-90 transition-all disabled:opacity-50"
              >
                {saving ? "Updating..." : "Confirm Password Change"}
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
