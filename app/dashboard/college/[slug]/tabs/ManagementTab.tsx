"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";
import Image from "next/image";

interface Props {
  college: CollegeUser;
}

interface ManagementMember {
  id: number;
  suffix: string | null;
  name: string;
  designation: string | null;
  gender: string | null;
  picture: string | null;
  picture_url: string | null;
  about: string | null;
  emailaddress: string | null;
  phoneno: string | null;
  landlineNo: string | null;
  created_at: string;
}

const EMPTY_FORM = {
  name: "",
  suffix: "",
  designation: "",
  gender: "",
  about: "",
  emailaddress: "",
  phoneno: "",
  landlineNo: "",
};

const SUFFIX_OPTIONS = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "Er.", "Shri", "Smt."];
const GENDER_OPTIONS = ["Male", "Female", "Other"];

// ── Reusable Legend Input Component ──────────────────────────────────────────
function LegendInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  isSelect = false,
  options = [],
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  isSelect?: boolean;
  options?: string[];
}) {
  return (
    <div className="relative mt-4">
      <label className="absolute -top-2.5 left-6 px-2 bg-white text-[13px] font-black text-slate-500 z-10 tracking-tight">
        {label}
      </label>
      <div className="relative">
        {isSelect ? (
          <select
            disabled={disabled}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-[5px] px-6 py-4 text-[14px] font-bold text-slate-700 focus:ring-1 focus:ring-red-900 focus:border-red-900 transition-all appearance-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
          >
             <option value="">{placeholder}</option>
             {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-white border border-slate-200 rounded-[5px] px-6 py-4 text-[14px] font-bold text-slate-800 focus:ring-1 focus:ring-red-900 focus:border-red-900 transition-all placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-400"
          />
        )}
        {isSelect && (
          <span className="absolute right-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">
            expand_more
          </span>
        )}
      </div>
    </div>
  );
}

// ── Custom Photo Picker ──────────────────────────────────────────────────────
function LegendPhotoPicker({
  label,
  currentUrl,
  onChange,
}: {
  label: string;
  currentUrl: string | null;
  onChange: (file: File | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("No file chosen");

  function handleFile(f: File | null) {
    if (!f) return;
    setFileName(f.name);
    onChange(f);
  }

  return (
    <div className="relative mt-4">
      <label className="absolute -top-2.5 left-6 px-2 bg-white text-[13px] font-black text-slate-500 z-10 tracking-tight">
        {label}
      </label>
      <div className="flex items-center gap-3 w-full bg-white border border-slate-200 rounded-[5px] px-4 py-3 placeholder:text-slate-300">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="bg-slate-100 px-4 py-1 rounded text-[12px] font-bold text-slate-600 hover:bg-slate-200 transition-colors"
        >
          Choose File
        </button>
        <span className="text-[13px] font-bold text-slate-400 truncate flex-1">
          {fileName}
        </span>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}

export default function ManagementTab({ college }: Props) {
  const slug = college.slug;

  const [members, setMembers] = useState<ManagementMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/management`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load.");
      setMembers(data.management ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load management.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const set = (k: keyof typeof EMPTY_FORM, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Contact person name is required.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== "") fd.append(k, v);
      });
      if (photoFile) fd.append("file", photoFile);

      const url = editingId
        ? `/api/college/dashboard/${slug}/management?memberId=${editingId}`
        : `/api/college/dashboard/${slug}/management`;

      const res = await fetch(url, { 
        method: editingId ? "PUT" : "POST", 
        body: fd 
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Failed to save.");

      setSuccess(editingId ? "Member updated successfully!" : "Member added successfully!");
      setForm(EMPTY_FORM);
      setPhotoFile(null);
      setEditingId(null);
      load();
      setTimeout(() => setSuccess(""), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  const startEdit = (m: ManagementMember) => {
    setEditingId(m.id);
    setForm({
      name: m.name,
      suffix: m.suffix ?? "",
      designation: m.designation ?? "",
      gender: m.gender ?? "",
      about: m.about ?? "",
      emailaddress: m.emailaddress ?? "",
      phoneno: m.phoneno ?? "",
      landlineNo: m.landlineNo ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPhotoFile(null);
  };

  if (loading) return <div className="p-12 text-center text-slate-400 font-bold">Loading management...</div>;

  return (
    <div className="space-y-6 pb-24">
      {/* ── Inline Form (Exact Design Match) ──────────────────────────────── */}
      <div className="bg-white rounded-b-[5px] border border-slate-100 shadow-md p-4 md:p-10 border-t-0">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-10">
            {/* Row 1 */}
            <div className="md:col-span-1">
              <LegendInput 
                label="Select Title" 
                value={form.suffix} 
                onChange={v => set("suffix", v)} 
                placeholder="Please select suffix" 
                isSelect 
                options={SUFFIX_OPTIONS} 
              />
            </div>
            <div className="md:col-span-2">
              <LegendInput 
                label="Contact Person Name" 
                value={form.name} 
                onChange={v => set("name", v)} 
                placeholder="Enter contact person name here" 
              />
            </div>

            {/* Row 2 */}
            <div className="md:col-span-1">
              <LegendInput 
                label="Designation" 
                value={form.designation} 
                onChange={v => set("designation", v)} 
                placeholder="Enter designation" 
              />
            </div>
            <div className="md:col-span-1">
              <LegendInput 
                label="Gender" 
                value={form.gender} 
                onChange={v => set("gender", v)} 
                placeholder="-- Select an option --" 
                isSelect 
                options={GENDER_OPTIONS} 
              />
            </div>
            <div className="md:col-span-1">
              <LegendPhotoPicker 
                label="Profile Picture" 
                currentUrl={null} 
                onChange={setPhotoFile} 
              />
            </div>

            {/* Row 3 */}
            <div className="md:col-span-1">
              <LegendInput 
                label="Email" 
                value={form.emailaddress} 
                onChange={v => set("emailaddress", v)} 
                placeholder="Enter email address" 
                type="email" 
              />
            </div>
            <div className="md:col-span-1">
              <LegendInput 
                label="Mobile Number" 
                value={form.phoneno} 
                onChange={v => set("phoneno", v)} 
                placeholder="Enter phone number" 
                type="tel" 
              />
            </div>
            <div className="md:col-span-1">
              <LegendInput 
                label="Office No" 
                value={form.landlineNo} 
                onChange={v => set("landlineNo", v)} 
                placeholder="Enter office landing no here" 
                isSelect // Design shows a select arrow, but label says enter
                options={["011-22334455", "External"]}
              />
            </div>
          </div>

          {/* Feedback */}
          {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
          {success && <p className="text-emerald-500 text-sm font-bold">{success}</p>}

          {/* Buttons */}
          <div className="flex items-center justify-between pt-4">
             <button
               type="submit"
               disabled={saving}
               className="bg-[#D10000] text-white px-12 py-3 rounded-[5px] font-black text-[16px] uppercase tracking-wider hover:opacity-90 transition-all shadow-lg active:scale-95 disabled:opacity-50"
             >
               {saving ? "..." : "Submit"}
             </button>

             <button
               type="button"
               onClick={cancelEdit}
               style={{ backgroundColor: '#8B3D3D' }}
               className="text-white px-8 py-3 rounded-[5px] font-bold text-[14px] hover:opacity-90 transition-all flex items-center gap-2"
             >
               <span className="material-symbols-outlined text-[18px]">add</span>
               + Add new management Details
             </button>
          </div>
        </form>
      </div>

      {/* ── List of Members (Reference below) ────────────────────────────── */}
      {members.length > 0 && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map(m => (
               <div key={m.id} className="bg-white p-6 rounded-[10px] border border-slate-100 shadow-sm relative group overflow-hidden">
                  <div className="flex items-center gap-4">
                     <div className="relative w-16 h-16 rounded-full overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                        {m.picture_url ? (
                           <Image src={m.picture_url} alt={m.name} fill className="object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                              <span className="material-symbols-outlined">person</span>
                           </div>
                        )}
                     </div>
                     <div className="min-w-0">
                        <h4 className="font-black text-slate-800 text-[15px] truncate">{m.suffix} {m.name}</h4>
                        <p className="text-slate-400 text-[12px] font-bold">{m.designation}</p>
                     </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                     <div className="space-y-1">
                        <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                           <span className="material-symbols-outlined text-[14px]">mail</span> {m.emailaddress}
                        </p>
                        <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                           <span className="material-symbols-outlined text-[14px]">call</span> {m.phoneno}
                        </p>
                     </div>
                     <div className="flex items-center gap-2">
                        <button onClick={() => startEdit(m)} className="p-2 hover:bg-slate-50 rounded-full text-blue-500 transition-all">
                           <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      )}
    </div>
  );
}
