"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Props {
  user: { id: string | number; name: string; email: string } | null;
}

interface ProfileData {
  id: number;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  city: string;
  state: string;
  country: string;
  photo: string;
  hobbies: string;
  interest: string;
  about: string;
  member_since: string;
  profile_complete: number;
}

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli",
  "Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

// -- Tab Navigation Component --------------------------------------------------
function ProfileTabs({ active = "profile" }: { active?: string }) {
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
          className={`flex items-center gap-2 px-6 py-4 text-[13px] font-semibold uppercase tracking-wider transition-all whitespace-nowrap border-b-2 ${
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

// -- Premium Input Field ------------------------------------------------------
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

export default function ProfileTab({ user }: Props) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [dob, setDob]         = useState("");
  const [gender, setGender]   = useState("");
  const [city, setCity]       = useState("");
  const [state, setState]     = useState("");
  const [country, setCountry] = useState("India");

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/student/${user.id}/profile`);
      const data: ProfileData = await res.json();
      setProfile(data);
      setName(data.name ?? "");
      setPhone(data.phone ?? "");
      setDob(data.dob ? data.dob.slice(0, 10) : "");
      setGender(data.gender ?? "");
      setCity(data.city ?? "");
      setState(data.state ?? "");
      setCountry(data.country ?? "India");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch(`/api/student/${user?.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, dob, gender, city, state, country }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (e) {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="animate-pulse space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
    <div className="h-10 bg-gray-100 rounded w-1/4" />
    <div className="grid grid-cols-2 gap-8">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-gray-50 rounded" />)}
    </div>
  </div>;

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-[26px] font-bold text-[#222]">Student Details</h2>
        <p className="text-gray-400 font-semibold uppercase text-[12px] tracking-widest mt-1">Manage your records</p>
      </div>

      <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 overflow-hidden">
        <ProfileTabs active="profile" />
        
        <form onSubmit={handleSave} className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <InputField label="Student Name" value={name} onChange={setName} icon="person" />
            <InputField label="Email Address" value={user?.email ?? ""} disabled icon="mail" />
            <InputField label="Phone Number" value={phone} onChange={setPhone} type="tel" icon="call" />
            <InputField label="Alt Phone Number" value="" placeholder="Optional" icon="call" />
            
            <div className="relative pt-2">
              <label className="absolute left-4 -top-0.5 px-1.5 bg-white text-[11px] font-semibold text-gray-400 uppercase tracking-widest z-10">
                Gender
              </label>
              <select 
                value={gender} 
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-white border-2 border-gray-100 rounded-[8px] px-4 py-3.5 text-[14px] font-medium text-[#333] focus:border-[#e31e24]/30 outline-none transition-all appearance-none"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-300 pointer-events-none">expand_more</span>
            </div>

            <InputField label="Date of Birth" value={dob} onChange={setDob} type="date" icon="calendar_today" />
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-50">
            <div className="flex items-center gap-3">
              {success && (
                <span className="flex items-center gap-1.5 text-green-600 text-[13px] font-semibold">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Changes saved!
                </span>
              )}
              {error && <span className="text-red-500 text-[13px] font-semibold">{error}</span>}
            </div>
            
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={load}
                className="px-6 py-3 bg-gray-50 text-gray-500 text-[13px] font-semibold uppercase tracking-wider rounded-lg hover:bg-gray-100 transition-all"
              >
                Reset
              </button>
              <button 
                type="submit"
                disabled={saving}
                className="px-10 py-3 bg-[#e31e24] text-white text-[13px] font-semibold uppercase tracking-wider rounded-lg shadow-lg shadow-red-100 hover:bg-[#c0191e] transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
