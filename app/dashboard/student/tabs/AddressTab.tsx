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
      if (!res.ok) throw new Error("Failed to load address");
      const data = await res.json();
      setCity(data.city    ?? "");
      setState(data.state  ?? "");
      setCountry(data.country ?? "India");
      setPincode(data.pincode ?? "");
      setAddress(data.address ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`/api/student/${user.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, state, country, pincode, address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-green-50 rounded-2xl animate-pulse w-1/3" />
        <div className="bg-white rounded-2xl p-6 border border-green-50 shadow-sm space-y-5">
          {[1,2,3,4].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-green-50 rounded w-1/4 animate-pulse" />
              <div className="h-10 bg-green-50 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-green-600 text-[22px]">location_on</span>
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800">Address</h1>
          <p className="text-xs text-slate-400 font-medium">Your current residential address details</p>
        </div>
      </div>

      {/* Alert banner */}
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <span className="material-symbols-outlined text-green-500 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <p className="text-green-700 text-sm font-semibold">Address saved successfully!</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span className="material-symbols-outlined text-red-400 text-[20px]">error_outline</span>
          <p className="text-red-600 text-sm font-semibold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">

        {/* Map placeholder */}
        <div className="bg-white rounded-2xl border border-green-50 shadow-sm overflow-hidden">
          <div className="h-40 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col items-center justify-center gap-2 relative">
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, #16a34a 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              </div>
              {city || state ? (
                <p className="text-sm font-bold text-slate-700 bg-white/80 px-3 py-1 rounded-full shadow-sm">
                  {[city, state, country].filter(Boolean).join(", ")}
                </p>
              ) : (
                <p className="text-xs text-slate-400 font-medium">Fill in your address below</p>
              )}
            </div>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-green-50 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
            <span className="material-symbols-outlined text-green-600 text-[18px]">home</span>
            <h2 className="font-black text-slate-800 text-sm">Residential Details</h2>
          </div>

          {/* Address line */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Full Address / Street
            </label>
            <textarea
              rows={3}
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="House No., Street, Area, Landmark..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all resize-none bg-slate-50/50"
            />
          </div>

          {/* City + Pincode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                City / Town <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Mumbai"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                PIN Code
              </label>
              <input
                type="text"
                value={pincode}
                onChange={e => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="e.g. 400001"
                maxLength={6}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-slate-50/50"
              />
            </div>
          </div>

          {/* State + Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                State <span className="text-red-400">*</span>
              </label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-slate-50/50 appearance-none"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Country <span className="text-red-400">*</span>
              </label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-slate-50/50 appearance-none"
              >
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Current location display */}
          {(city || state) && (
            <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-100 rounded-xl">
              <span className="material-symbols-outlined text-green-600 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                location_on
              </span>
              <p className="text-xs font-semibold text-green-700">
                {[address, city, state, pincode, country].filter(Boolean).join(", ")}
              </p>
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">
            <span className="text-red-400">*</span> Required fields
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={load}
              disabled={saving}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving || !city || !state}
              className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-black hover:bg-green-700 transition-colors shadow-md shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Save Address
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
