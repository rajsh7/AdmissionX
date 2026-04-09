"use client";

import { useState } from "react";

interface Props {
  user: { id: string | number; name: string; email: string } | null;
}

interface Project {
  id: number;
  title: string;
  description: string;
  tech: string;
  link: string;
  status: "completed" | "ongoing" | "planned";
  from_date: string;
  to_date: string;
}

const EMPTY_FORM = {
  title: "", description: "", tech: "", link: "",
  status: "completed" as Project["status"],
  from_date: "", to_date: "",
};

// ── Shared Tab Navigation ─────────────────────────────────────────────────────
function ProfileTabs({ active = "projects" }: { active?: string }) {
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

export default function ProjectsTab({ user }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ ...EMPTY_FORM });
  const [editId, setEditId]     = useState<number | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (editId !== null) {
      setProjects((prev) => prev.map((p) => (p.id === editId ? { ...p, ...form } : p)));
      setEditId(null);
    } else {
      setProjects((prev) => [{ id: Date.now(), ...form }, ...prev]);
    }
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
  }

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-[26px] font-bold text-[#222]">Projects Showcase</h2>
          <p className="text-gray-400 font-semibold uppercase text-[12px] tracking-widest mt-1">Display your portfolio</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-[#e31e24] text-white text-[13px] font-semibold uppercase tracking-wider rounded-lg shadow-lg shadow-red-100 hover:bg-[#c0191e] transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Project
          </button>
        )}
      </div>

      <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
        <ProfileTabs active="projects" />
        
        <div className="p-10">
          {showForm ? (
            <div className="max-w-2xl mx-auto py-6 animate-in fade-in zoom-in-95 duration-300">
              <form onSubmit={handleSubmit} className="space-y-8">
                <InputField label="Project Title" value={form.title} onChange={v => setForm(f => ({...f, title: v}))} icon="title" />
                
                <div className="relative pt-2">
                  <label className="absolute left-4 -top-0.5 px-1.5 bg-white text-[11px] font-semibold text-gray-400 uppercase tracking-widest z-10">Description</label>
                  <textarea 
                    value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                    placeholder="Briefly describe your project..."
                    className="w-full bg-white border-2 border-gray-100 rounded-[8px] px-4 py-3.5 text-[14px] font-medium text-[#333] outline-none transition-all focus:border-[#e31e24]/30 min-h-[120px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputField label="Technologies Used" value={form.tech} onChange={v => setForm(f => ({...f, tech: v}))} icon="code" />
                  <InputField label="Project Link" value={form.link} onChange={v => setForm(f => ({...f, link: v}))} icon="link" />
                  
                  <div className="relative pt-2">
                    <label className="absolute left-4 -top-0.5 px-1.5 bg-white text-[11px] font-semibold text-gray-400 uppercase tracking-widest z-10">Status</label>
                    <select 
                      value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value as any}))}
                      className="w-full bg-white border-2 border-gray-100 rounded-[8px] px-4 py-3.5 text-[14px] font-medium text-[#333] outline-none transition-all appearance-none"
                    >
                      <option value="completed">Completed</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="planned">Planned</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-3 bg-gray-50 text-gray-500 text-[13px] font-semibold uppercase tracking-wider rounded-lg hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-[#e31e24] text-white text-[13px] font-semibold uppercase tracking-wider rounded-lg shadow-lg shadow-red-100 hover:bg-[#c0191e] transition-all"
                  >
                    {editId !== null ? "Update Project" : "Save Project"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
             <div className="space-y-6">
               {projects.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map(p => (
                      <div key={p.id} className="bg-white rounded-xl border-2 border-gray-50 p-6 hover:border-[#e31e24]/20 transition-all group relative">
                         <div className="flex justify-between items-start mb-4">
                            <h3 className="text-[18px] font-bold text-[#333]">{p.title}</h3>
                            <button 
                              onClick={() => setProjects(prev => prev.filter(x => x.id !== p.id))}
                              className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                               <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                         </div>
                         <p className="text-[13px] font-medium text-gray-500 line-clamp-2 mb-4">{p.description}</p>
                         <div className="flex flex-wrap gap-2">
                            {p.tech.split(",").map(t => (
                               <span key={t} className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-semibold uppercase tracking-widest rounded-full">{t.trim()}</span>
                            ))}
                         </div>
                      </div>
                    ))}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-200">
                       <span className="material-symbols-outlined text-[40px]">architecture</span>
                    </div>
                    <h3 className="text-[18px] font-bold text-[#333]">No Projects Added</h3>
                    <p className="text-[13px] font-semibold text-gray-400 max-w-[280px] mt-1">Showcase your portfolio by adding your latest projects here.</p>
                    <button 
                      onClick={() => setShowForm(true)}
                      className="mt-6 px-8 py-3 border-2 border-gray-100 text-[#333] text-[12px] font-semibold uppercase tracking-widest rounded-lg hover:bg-gray-50 transition-all"
                    >
                      Add Project
                    </button>
                 </div>
               )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
