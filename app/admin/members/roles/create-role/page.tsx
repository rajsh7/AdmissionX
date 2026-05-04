"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NAV_GROUPS } from "@/app/admin/_components/nav-config";

const BADGE_OPTIONS = [
  { label: "Purple", value: "bg-purple-100 text-purple-700" },
  { label: "Blue",   value: "bg-blue-100 text-blue-700" },
  { label: "Green",  value: "bg-emerald-100 text-emerald-700" },
  { label: "Orange", value: "bg-orange-100 text-orange-700" },
  { label: "Red",    value: "bg-red-100 text-red-700" },
  { label: "Pink",   value: "bg-pink-100 text-pink-700" },
  { label: "Indigo", value: "bg-indigo-100 text-indigo-700" },
  { label: "Slate",  value: "bg-slate-100 text-slate-600" },
];

// Only show specific paths as per requirement
const PATH_GROUPS = [
  {
    label: "Main Menu",
    paths: [
      { label: "Home", href: "/admin/dashboard" },
      { label: "Profile Information", href: "/admin/colleges/profile" },
      { label: "Student Profile", href: "/admin/students" },
      { label: "Profile Information (Student)", href: "/admin/students/profile" },
    ],
  },
  {
    label: "Examination Management",
    paths: [
      { label: "AIEA Exam", href: "/admin/exams/aiea" },
    ],
  },
  {
    label: "Queries & User Interaction",
    paths: [
      { label: "Query", href: "/admin/queries" },
    ],
  },
  {
    label: "Account",
    paths: [
      { label: "My Profile", href: "/admin/profile" },
    ],
  },
];

const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

const inputCls = "w-full h-11 px-4 border border-slate-200 rounded-[5px] text-sm font-medium bg-white focus:outline-none focus:border-[#FF3C3C] focus:ring-2 focus:ring-[#FF3C3C]/10 transition-all placeholder:text-slate-300 text-slate-700";
const labelCls = "block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5";

function PathPicker({ name, selected, onChange }: { name: string; selected: string[]; onChange: (p: string[]) => void }) {
  const [search, setSearch] = useState("");

  function toggle(href: string) {
    onChange(selected.includes(href) ? selected.filter(p => p !== href) : [...selected, href]);
  }

  function toggleGroup(paths: { href: string }[], checked: boolean) {
    const hrefs = paths.map(p => p.href);
    if (checked) onChange([...new Set([...selected, ...hrefs])]);
    else onChange(selected.filter(p => !hrefs.includes(p)));
  }

  const filtered = search
    ? PATH_GROUPS.map(g => ({ ...g, paths: g.paths.filter(p => p.label.toLowerCase().includes(search.toLowerCase()) || p.href.includes(search)) })).filter(g => g.paths.length > 0)
    : PATH_GROUPS;

  return (
    <div className="border border-slate-200 rounded-[5px] overflow-hidden bg-slate-50">
      <div className="p-2 border-b border-slate-200 bg-white">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[16px]" style={ICO}>search</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pages..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
        </div>
      </div>
      {selected.map(p => <input key={p} type="hidden" name={name} value={p} />)}
      {selected.length === 0 && <input type="hidden" name={name} value="" />}
      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
        {filtered.map(group => {
          const allChecked = group.paths.every(p => selected.includes(p.href));
          const someChecked = group.paths.some(p => selected.includes(p.href));
          return (
            <div key={group.label}>
              <label className="flex items-center gap-2.5 px-3 py-2 bg-slate-100 cursor-pointer hover:bg-slate-200 transition-colors">
                <input type="checkbox" checked={allChecked}
                  ref={el => { if (el) el.indeterminate = someChecked && !allChecked; }}
                  onChange={e => toggleGroup(group.paths, e.target.checked)}
                  className="accent-emerald-600 w-3.5 h-3.5" />
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{group.label}</span>
                <span className="ml-auto text-[10px] text-slate-400">{group.paths.filter(p => selected.includes(p.href)).length}/{group.paths.length}</span>
              </label>
              {group.paths.map(path => (
                <label key={path.href} className="flex items-center gap-2.5 px-4 py-1.5 cursor-pointer hover:bg-white transition-colors">
                  <input type="checkbox" checked={selected.includes(path.href)} onChange={() => toggle(path.href)} className="accent-emerald-600 w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-xs text-slate-700 flex-1 truncate">{path.label.trim()}</span>
                  <code className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">{path.href}</code>
                </label>
              ))}
            </div>
          );
        })}
      </div>
      <div className="px-3 py-1.5 bg-white border-t border-slate-200 text-[11px] text-slate-400">
        {selected.filter(p => p !== "").length} path{selected.filter(p => p !== "").length !== 1 ? "s" : ""} selected
      </div>
    </div>
  );
}

export default function CreateRolePage() {
  const router = useRouter();
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const fd = new FormData(e.currentTarget);
      const res = await fetch("/api/admin/roles", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      router.push("/admin/members/roles");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
      setPending(false);
    }
  }

  return (
    <div className="p-6 max-w-[700px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/members/roles"
          className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-[5px] text-sm font-semibold hover:bg-slate-50 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900 leading-none">Create New Role</h1>
          <p className="text-sm text-slate-500 mt-1">Define a new admin role with access permissions.</p>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-[5px] text-sm text-blue-700 mb-6">
        <span className="material-symbols-rounded text-[20px] flex-shrink-0 mt-0.5" style={ICO}>info</span>
        <div>
          <p className="font-semibold">How roles work</p>
          <p className="text-xs text-blue-600 mt-0.5">
            <strong>Blacklist</strong> — access everything <em>except</em> selected pages.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[5px] border border-slate-200 shadow-sm p-6 space-y-5">
        <input type="hidden" name="allowedPaths" value="" />

        {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-[5px]">{error}</p>}

        {/* Role Key */}
        <div>
          <label className={labelCls}>Role Key <span className="normal-case font-normal text-slate-400">(unique, no spaces)</span></label>
          <input name="value" required placeholder="e.g. role_editor"
            pattern="^[a-z][a-z0-9_]*$" title="Lowercase letters, numbers and underscores only"
            className={`${inputCls} font-mono`} />
          <p className="text-[11px] text-slate-400 mt-1">Lowercase + underscores only. e.g. <code>role_editor</code></p>
        </div>

        {/* Display Label */}
        <div>
          <label className={labelCls}>Display Label</label>
          <input name="label" required placeholder="e.g. Editor" className={inputCls} />
        </div>

        {/* Description */}
        <div>
          <label className={labelCls}>Description</label>
          <input name="desc" placeholder="e.g. Can manage blogs and news only" className={inputCls} />
        </div>

        {/* Badge Color */}
        <div>
          <label className={labelCls}>Badge Color</label>
          <div className="grid grid-cols-4 gap-2">
            {BADGE_OPTIONS.map((opt, i) => (
              <label key={opt.value} className="cursor-pointer">
                <input type="radio" name="badgeColor" value={opt.value} defaultChecked={i === 0} className="sr-only peer" />
                <div className={`px-2 py-1.5 rounded-[5px] text-[11px] font-bold text-center border-2 transition-all peer-checked:border-slate-800 border-transparent ${opt.value}`}>
                  {opt.label}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Access Mode - Blacklist only */}
        <input type="hidden" name="accessMode" value="blacklist" />
        <div>
          <label className={labelCls}>Access Mode</label>
          <label className="flex items-start gap-2 p-3 rounded-[5px] border border-emerald-500 bg-emerald-50 cursor-pointer">
            <input type="radio" name="accessMode" value="blacklist" defaultChecked className="mt-0.5 accent-emerald-600" />
            <div>
              <p className="text-sm font-bold text-slate-700">Blacklist</p>
              <p className="text-xs text-slate-400">Block selected pages — access everything except selected pages</p>
            </div>
          </label>
        </div>

        {/* Path Picker */}
        <div>
          <label className={labelCls}>Blocked Pages</label>
          <PathPicker
            name="blockedPaths"
            selected={selectedPaths}
            onChange={setSelectedPaths}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Link href="/admin/members/roles"
            className="flex-1 h-11 flex items-center justify-center border border-slate-200 text-slate-600 text-sm font-bold rounded-[5px] hover:bg-slate-50 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={pending}
            className="flex-1 h-11 bg-emerald-600 text-white text-sm font-bold rounded-[5px] hover:bg-emerald-700 transition-colors disabled:opacity-50">
            {pending ? "Creating..." : "Create Role"}
          </button>
        </div>
      </form>
    </div>
  );
}
