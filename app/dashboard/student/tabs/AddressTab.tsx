"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  user: { id: string | number; name: string; email: string } | null;
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

// -- Shared Tab Navigation (Matching ProfileTab) --------------------------------
function ProfileTabs({ active = "address" }: { active?: string }) {
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

export default function AddressTab({ user }: Props) {
  const [city,    setCity]    = useState("");
  const [state,   setState]   = useState("");
  const [country, setCountry] = useState("India");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res  = await fetch(`/api/student/${user.id}/profile`);
      const data = await res.json();
      setCity(data.city    ?? "");
      setState(data.state  ?? "");
      setCountry(data.country ?? "India");
      setPincode(data.pincode ?? "");
      setAddress(data.address ?? "");
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
        body: JSON.stringify({ city, state, country, pincode, address }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (e) {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="animate-pulse space-y-8 bg-white p-8 rounded-xl border border-gray-100">
    <div className="h-10 bg-gray-100 rounded w-1/4" />
    <div className="space-y-6">
       {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-50 rounded" />)}
    </div>
  </div>;

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-[26px] font-bold text-[#222]">Student Address</h2>
        <p className="text-gray-400 font-semibold uppercase text-[12px] tracking-widest mt-1">Update your delivery and permanent address</p>
      </div>

      <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 overflow-hidden">
        <ProfileTabs active="address" />
        
        <form onSubmit={handleSave} className="p-10 space-y-10">
          <div className="space-y-8">
            <div className="relative pt-2">
              <label className="absolute left-4 -top-0.5 px-1.5 bg-white text-[11px] font-semibold text-gray-400 uppercase tracking-widest z-10">
                Full Street Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House No., Building, Area, Street Name"
                className="w-full bg-white border-2 border-gray-100 rounded-[8px] px-4 py-3.5 text-[14px] font-medium text-[#333] placeholder:text-gray-300 focus:border-[#e31e24]/30 focus:ring-4 focus:ring-[#e31e24]/5 outline-none transition-all min-h-[100px] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <InputField label="City / Town" value={city} onChange={setCity} icon="location_city" />
              <InputField label="Pincode" value={pincode} onChange={setPincode} icon="pin_drop" />
              
              <div className="relative pt-2">
                <label className="absolute left-4 -top-0.5 px-1.5 bg-white text-[11px] font-semibold text-gray-400 uppercase tracking-widest z-10">
                  State
                </label>
                <select 
                  value={state} 
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-white border-2 border-gray-100 rounded-[8px] px-4 py-3.5 text-[14px] font-medium text-[#333] focus:border-[#e31e24]/30 outline-none transition-all appearance-none"
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-300 pointer-events-none">expand_more</span>
              </div>

              <InputField label="Country" value={country} onChange={setCountry} icon="public" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-50">
            <div className="flex items-center gap-3">
              {success && (
                <span className="flex items-center gap-1.5 text-green-600 text-[13px] font-semibold">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Address saved!
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
                {saving ? "Saving..." : "Save Address"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
