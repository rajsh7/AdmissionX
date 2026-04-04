"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  user: { id: string | number; name: string; email: string } | null;
}

interface Marks {
  class10_board: string;
  class10_school: string;
  class10_year: string;
  class10_percent: string;
  class12_board: string;
  class12_school: string;
  class12_year: string;
  class12_percent: string;
  class12_stream: string;
  grad_university: string;
  grad_program: string;
  grad_year: string;
  grad_percent: string;
}

const EMPTY_MARKS: Marks = {
  class10_board: "", class10_school: "", class10_year: "", class10_percent: "",
  class12_board: "", class12_school: "", class12_year: "", class12_percent: "", class12_stream: "",
  grad_university: "", grad_program: "", grad_year: "", grad_percent: "",
};

const BOARDS = ["CBSE", "ICSE", "State Board", "IB", "IGCSE", "NIOS", "Other"];
const STREAMS_12 = ["Science (PCM)", "Science (PCB)", "Commerce", "Arts", "Vocational", "Other"];
const YEAR_OPTIONS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));

// ── Shared Tab Navigation ─────────────────────────────────────────────────────
function ProfileTabs({ active = "academic" }: { active?: string }) {
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

function SelectField({
  label,
  value,
  onChange,
  options,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  icon: string;
}) {
  return (
    <div className="relative pt-2">
      <label className="absolute left-4 -top-0.5 px-1.5 bg-white text-[11px] font-semibold text-gray-400 uppercase tracking-widest z-10">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border-2 border-gray-100 rounded-[8px] px-4 py-3.5 text-[14px] font-medium text-[#333] focus:border-[#e31e24]/30 outline-none transition-all appearance-none"
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-300 pointer-events-none">
          {icon}
        </span>
      </div>
    </div>
  );
}

export default function MarksTab({ user }: Props) {
  const [marks, setMarks] = useState<Marks>({ ...EMPTY_MARKS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/student/${user.id}/marks`);
      const data = await res.json();
      setMarks({ ...EMPTY_MARKS, ...(data.marks ?? {}) });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const update = (key: keyof Marks, val: string) => setMarks(p => ({ ...p, [key]: val }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/student/${user?.id}/marks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(marks),
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

  if (loading) return <div className="space-y-8 bg-white p-8 rounded-xl animate-pulse">
    <div className="h-10 bg-gray-100 rounded w-1/3" />
    <div className="grid grid-cols-2 gap-8">
      {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-14 bg-gray-50 rounded" />)}
    </div>
  </div>;

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-[26px] font-bold text-[#222]">Academic Records</h2>
        <p className="text-gray-400 font-semibold uppercase text-[12px] tracking-widest mt-1">Manage your education history</p>
      </div>

      <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 overflow-hidden">
        <ProfileTabs active="academic" />
        
        <form onSubmit={handleSave} className="p-10 space-y-12">
          {/* Class 10th Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#e31e24] text-[18px]">school</span>
               </div>
               <h3 className="text-[18px] font-bold text-[#333]">Class 10th Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <SelectField label="10th Board" value={marks.class10_board} onChange={v => update("class10_board", v)} options={BOARDS} icon="expand_more" />
              <InputField label="10th School Name" value={marks.class10_school} onChange={v => update("class10_school", v)} icon="apartment" />
              <SelectField label="Passing Year" value={marks.class10_year} onChange={v => update("class10_year", v)} options={YEAR_OPTIONS} icon="expand_more" />
              <InputField label="Percentage / CGPA" value={marks.class10_percent} onChange={v => update("class10_percent", v)} icon="percent" />
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Class 12th Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-black/5 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#222] text-[18px]">workspace_premium</span>
               </div>
               <h3 className="text-[18px] font-bold text-[#333]">Class 12th Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <SelectField label="12th Board" value={marks.class12_board} onChange={v => update("class12_board", v)} options={BOARDS} icon="expand_more" />
              <InputField label="12th School Name" value={marks.class12_school} onChange={v => update("class12_school", v)} icon="apartment" />
              <SelectField label="Passing Year" value={marks.class12_year} onChange={v => update("class12_year", v)} options={YEAR_OPTIONS} icon="expand_more" />
              <SelectField label="Stream" value={marks.class12_stream} onChange={v => update("class12_stream", v)} options={STREAMS_12} icon="expand_more" />
              <InputField label="Percentage / CGPA" value={marks.class12_percent} onChange={v => update("class12_percent", v)} icon="percent" />
            </div>
          </div>

          {/* Save Area */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-50">
            <div className="flex items-center gap-3">
              {success && (
                <span className="flex items-center gap-1.5 text-green-600 text-[13px] font-semibold">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Records updated!
                </span>
              )}
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
                {saving ? "Saving..." : "Save Academic Details"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
