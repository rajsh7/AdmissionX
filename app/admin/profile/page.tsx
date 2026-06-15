"use client";

import { useEffect, useState } from "react";
import { ICO } from "../_components/Sidebar";

const AVATAR_PRESETS = [
  { id: "crimson", name: "Crimson Shield", color: "#EF4444", bgClass: "bg-red-500", lightBg: "bg-red-50", ringClass: "ring-red-400" },
  { id: "ocean", name: "Ocean Pearl", color: "#3B82F6", bgClass: "bg-blue-500", lightBg: "bg-blue-50", ringClass: "ring-blue-400" },
  { id: "emerald", name: "Emerald Crest", color: "#10B981", bgClass: "bg-emerald-500", lightBg: "bg-emerald-50", ringClass: "ring-emerald-400" },
  { id: "amber", name: "Amber Crown", color: "#F59E0B", bgClass: "bg-amber-500", lightBg: "bg-amber-50", ringClass: "ring-amber-400" },
  { id: "indigo", name: "Indigo Star", color: "#6366F1", bgClass: "bg-indigo-500", lightBg: "bg-indigo-50", ringClass: "ring-indigo-400" },
  { id: "slate", name: "Slate Wall", color: "#64748B", bgClass: "bg-slate-500", lightBg: "bg-slate-50", ringClass: "ring-slate-400" },
];

export default function AdminProfilePage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    avatar: "crimson",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "security">("details");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/profile")
      .then((r) => r.json())
      .then((data) => {
        setForm((f) => ({
          ...f,
          name: data.name ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          designation: data.designation ?? "",
          avatar: data.avatar ?? "crimson",
        }));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading profile:", err);
        setLoading(false);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (activeTab === "security" && form.newPassword && form.newPassword !== form.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          designation: form.designation,
          avatar: form.avatar,
          currentPassword: form.currentPassword || undefined,
          newPassword: form.newPassword || undefined,
        }),
      });
      const data = await res.json();
      setSaving(false);
      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully." });
        setForm((f) => ({ ...f, currentPassword: "", newPassword: "", confirmPassword: "" }));
      } else {
        setMessage({ type: "error", text: data.error ?? "Something went wrong." });
      }
    } catch {
      setSaving(false);
      setMessage({ type: "error", text: "Network error. Please try again." });
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#8B3D3D]"></div>
          <p className="text-sm font-medium text-slate-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const selectedPreset = AVATAR_PRESETS.find((p) => p.id === form.avatar) || AVATAR_PRESETS[0];
  const adminInitials = (form.name || "A").trim().split(/\s+/).map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your administrator details, security credentials, and profile settings.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Side: Summary Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              {/* Avatar Initial Badge */}
              <div className={`relative flex h-24 w-24 items-center justify-center rounded-full text-white text-3xl font-bold transition-all duration-300 ${selectedPreset.bgClass}`}>
                {adminInitials}
                <span className="absolute bottom-1 right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 border-white bg-green-500">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white opacity-75"></span>
                </span>
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-800">{form.name || "Administrator"}</h2>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                {form.designation || "System Administrator"}
              </p>

              {/* Status Badge */}
              <div className="mt-3 flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Active Administrator
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Administrator Role</span>
                <span className="font-bold text-slate-700">Super Admin</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Email Account</span>
                <span className="font-bold text-slate-700 truncate max-w-[170px]">{form.email}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Contact Phone</span>
                <span className="font-bold text-slate-700">{form.phone || "Not Set"}</span>
              </div>
            </div>
          </div>

          {/* Color Preset Selector */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avatar Color Theme</h3>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, avatar: preset.id }))}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${preset.bgClass} ${
                    form.avatar === preset.id
                      ? "border-slate-800 scale-110 shadow-md ring-2 ring-slate-400"
                      : "border-transparent hover:scale-105"
                  }`}
                  title={preset.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed Forms */}
        <div className="lg:col-span-8">
          <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            {/* Header Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("details");
                  setMessage(null);
                }}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === "details"
                    ? "border-b-[#8B3D3D] text-[#8B3D3D] bg-white"
                    : "border-b-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <span className="material-symbols-rounded text-[18px]" style={ICO}>manage_accounts</span>
                Personal Details
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("security");
                  setMessage(null);
                }}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === "security"
                    ? "border-b-[#8B3D3D] text-[#8B3D3D] bg-white"
                    : "border-b-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <span className="material-symbols-rounded text-[18px]" style={ICO}>shield</span>
                Security & Passwords
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {activeTab === "details" ? (
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Basic Information</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
                        required
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
                        required
                        placeholder="admin@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Job Designation</label>
                      <input
                        type="text"
                        value={form.designation}
                        onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
                        placeholder="e.g. Lead Coordinator"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/[^\d+-\s]/g, "") }))}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
                        placeholder="e.g. +91 99999-88888"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Current Password</label>
                      <input
                        type="password"
                        value={form.currentPassword}
                        onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">New Password</label>
                        <input
                          type="password"
                          value={form.newPassword}
                          onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                        <input
                          type="password"
                          value={form.confirmPassword}
                          onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Message and Footer Actions */}
              <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {message && (
                    <div className={`flex items-center gap-2 text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
                      <span className="material-symbols-rounded text-[18px]">
                        {message.type === "success" ? "check_circle" : "error"}
                      </span>
                      {message.text}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#8B3D3D] hover:bg-[#6B2424] text-white text-sm font-semibold px-6 py-2.5 transition-all duration-150 disabled:opacity-60 shadow-sm"
                >
                  <span className="material-symbols-rounded text-[18px]" style={ICO}>save</span>
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
