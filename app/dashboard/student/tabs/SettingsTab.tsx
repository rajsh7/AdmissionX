"use client";

import { useState } from "react";

interface Props {
  user: { id: string | number; name: string; email: string } | null;
}

// ── Shared Tab Navigation ─────────────────────────────────────────────────────
function ProfileTabs({ active = "settings" }: { active?: string }) {
  const tabs = [
    { id: "profile", label: "Profile", icon: "person" },
    { id: "address", label: "Address", icon: "location_on" },
    { id: "academic", label: "Academic Certificates", icon: "workspace_premium" },
    { id: "projects", label: "Projects", icon: "work" },
    { id: "settings", label: "Account Settings", icon: "settings" },
  ];

  return (
    <div className="flex border-b border-gray-200 mb-10 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`flex items-center gap-2 px-6 py-4 text-[13px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border-b-2 ${
            active === tab.id 
              ? "border-[#e31e24] text-[#e31e24]" 
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ── Premium Input Field ──────────────────────────────────────────────────────
function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  icon,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  icon?: string;
}) {
  return (
    <div className="relative pt-2">
      <label className="absolute left-4 -top-0.5 px-1.5 bg-white text-[11px] font-semibold text-gray-400 uppercase tracking-widest z-10">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-white border-2 border-gray-100 rounded-[8px] px-4 py-3.5 text-[14px] font-medium text-[#333] placeholder:text-gray-300 focus:border-[#e31e24]/30 focus:ring-4 focus:ring-[#e31e24]/5 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
        />
        {icon && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-300 text-[20px]">
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}

export default function SettingsTab({ user }: Props) {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) return alert("Passwords don't match");
    setPwSaving(true);
    try {
      const res = await fetch(`/api/student/${user?.id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_password", currentPassword: currentPw, newPassword: newPw }),
      });
      if (res.ok) {
        setPwSuccess(true);
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
        setTimeout(() => setPwSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-[26px] font-bold text-[#222]">Account Settings</h2>
        <p className="text-gray-400 font-semibold uppercase text-[12px] tracking-widest mt-1">Manage your security preferences</p>
      </div>

      <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
        <ProfileTabs active="settings" />
        
        <div className="p-10 space-y-12">
           {/* Account Info */}
           <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-black/5 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#222] text-[18px]">manage_accounts</span>
                 </div>
                 <h3 className="text-[18px] font-bold text-[#333]">Basic Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <InputField label="Student ID" value={`ADX-${String(user?.id ?? 0).padStart(5, "0")}`} disabled icon="badge" />
                 <InputField label="Email Address" value={user?.email ?? ""} disabled icon="mail" />
              </div>
           </div>

           <div className="h-px bg-gray-100" />

           {/* Security */}
           <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#e31e24] text-[18px]">lock</span>
                 </div>
                 <h3 className="text-[18px] font-bold text-[#333]">Update Password</h3>
              </div>
              
              <form onSubmit={handleChangePassword} className="space-y-8 max-w-2xl">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputField label="Current Password" type="password" value={currentPw} onChange={setCurrentPw} icon="visibility_off" />
                    <div />
                    <InputField label="New Password" type="password" value={newPw} onChange={setNewPw} icon="visibility_off" />
                    <InputField label="Confirm Password" type="password" value={confirmPw} onChange={setConfirmPw} icon="visibility_off" />
                 </div>

                 <div className="flex items-center justify-between pt-4">
                    {pwSuccess && (
                       <span className="flex items-center gap-1.5 text-green-600 text-[13px] font-semibold">
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          Password updated!
                       </span>
                    )}
                    <button 
                      type="submit" disabled={pwSaving || !newPw}
                      className="ml-auto px-10 py-3 bg-[#e31e24] text-white text-[13px] font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-red-100 hover:bg-[#c0191e] transition-all disabled:opacity-50"
                    >
                      {pwSaving ? "Updating..." : "Update Password"}
                    </button>
                 </div>
              </form>
           </div>

           <div className="h-px bg-gray-100" />

           {/* Danger Zone */}
           <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-gray-400 text-[18px]">warning</span>
                 </div>
                 <h3 className="text-[18px] font-bold text-[#333]">Danger Zone</h3>
              </div>
              <div className="p-6 border-2 border-red-50 rounded-xl flex items-center justify-between">
                 <div>
                    <h4 className="text-[14px] font-bold text-[#333]">Permanently Delete Account</h4>
                    <p className="text-[12px] font-medium text-gray-400">Once deleted, your account cannot be recovered.</p>
                 </div>
                 <button className="px-6 py-2.5 border-2 border-red-100 text-red-500 text-[12px] font-bold uppercase tracking-widest rounded-lg hover:bg-red-50 transition-all">
                    Delete Now
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
