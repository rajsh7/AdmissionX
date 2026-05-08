"use client";

import { useState } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props { college: CollegeUser; }

export default function SettingsTab({ college }: Props) {
  const slug = college.slug;

  const [name,    setName]    = useState(college.name);
  const [email,   setEmail]   = useState(college.email);
  const [phone,   setPhone]   = useState("");
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    setSaving(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_account", name, email, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update.");
      setSuccess("Account updated successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-start justify-center py-12 px-4 mt-20">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
        <h2 className="text-[20px] font-bold text-slate-800 mb-6">Account Settings</h2>

        <form onSubmit={handleUpdate} className="space-y-5">
          <Field label="College Name" value={name} onChange={setName} placeholder="Enter college name" />
          <Field label="Email Address" value={email} onChange={setEmail} placeholder="Enter email address" type="email" />
          <Field label="Registered Contact Number" value={phone} onChange={setPhone} placeholder="Enter your phone number" type="tel" />

          {error   && <p className="text-red-500 text-[13px] font-semibold">{error}</p>}
          {success && <p className="text-emerald-600 text-[13px] font-semibold">{success}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#FF3C3C] hover:bg-[#e63535] text-white font-bold text-[15px] py-3 rounded-[6px] transition-all disabled:opacity-50 mt-2"
          >
            {saving ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold text-slate-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-slate-200 rounded-[6px] text-[14px] text-slate-800 focus:outline-none focus:border-[#FF3C3C] focus:ring-1 focus:ring-[#FF3C3C]/20 transition-all placeholder:text-slate-300"
      />
    </div>
  );
}
