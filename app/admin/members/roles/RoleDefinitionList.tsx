"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import AdminModal from "@/app/admin/_components/AdminModal";
import { NAV_GROUPS } from "@/app/admin/_components/nav-config";
import type { RoleDefinition } from "./page";

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

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

// Flatten all paths from nav config (parent + sub-items)
const ALL_NAV_PATHS: { group: string; label: string; href: string }[] = [];
for (const group of NAV_GROUPS) {
  for (const item of group.items) {
    ALL_NAV_PATHS.push({ group: group.label ?? "Other", label: item.label, href: item.href });
    for (const sub of item.subItems ?? []) {
      ALL_NAV_PATHS.push({ group: group.label ?? "Other", label: `${item.label} › ${sub.label}`, href: sub.href });
    }
  }
}

// Group by nav section label
const PATH_GROUPS = NAV_GROUPS.map(g => ({
  label: g.label ?? "Other",
  paths: g.items.flatMap(item => [
    { label: item.label, href: item.href },
    ...(item.subItems ?? []).map(sub => ({ label: `  ${sub.label}`, href: sub.href })),
  ]),
}));

// ── Path Checkbox Picker ───────────────────────────────────────────────────────

function PathPicker({
  name,
  selected,
  onChange,
}: {
  name: string;
  selected: string[];
  onChange: (paths: string[]) => void;
}) {
  const [search, setSearch] = useState("");

  function toggle(href: string) {
    onChange(selected.includes(href) ? selected.filter(p => p !== href) : [...selected, href]);
  }

  function toggleGroup(paths: { href: string }[], checked: boolean) {
    const hrefs = paths.map(p => p.href);
    if (checked) onChange([...new Set([...selected, ...hrefs])]);
    else         onChange(selected.filter(p => !hrefs.includes(p)));
  }

  const filtered = search
    ? PATH_GROUPS.map(g => ({ ...g, paths: g.paths.filter(p => p.label.toLowerCase().includes(search.toLowerCase()) || p.href.includes(search)) })).filter(g => g.paths.length > 0)
    : PATH_GROUPS;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
      {/* Search */}
      <div className="p-2 border-b border-slate-200 bg-white">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[16px]" style={ICO}>search</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search pages..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Hidden inputs to submit selected paths */}
      {selected.map(p => <input key={p} type="hidden" name={name} value={p} />)}
      {selected.length === 0 && <input type="hidden" name={name} value="" />}

      {/* Groups */}
      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
        {filtered.map(group => {
          const allChecked = group.paths.every(p => selected.includes(p.href));
          const someChecked = group.paths.some(p => selected.includes(p.href));
          return (
            <div key={group.label}>
              {/* Group header with select-all */}
              <label className="flex items-center gap-2.5 px-3 py-2 bg-slate-100 cursor-pointer hover:bg-slate-200 transition-colors">
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={el => { if (el) el.indeterminate = someChecked && !allChecked; }}
                  onChange={e => toggleGroup(group.paths, e.target.checked)}
                  className="accent-emerald-600 w-3.5 h-3.5"
                />
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{group.label}</span>
                <span className="ml-auto text-[10px] text-slate-400">{group.paths.filter(p => selected.includes(p.href)).length}/{group.paths.length}</span>
              </label>
              {/* Paths */}
              {group.paths.map(path => (
                <label key={path.href} className="flex items-center gap-2.5 px-4 py-1.5 cursor-pointer hover:bg-white transition-colors">
                  <input
                    type="checkbox"
                    checked={selected.includes(path.href)}
                    onChange={() => toggle(path.href)}
                    className="accent-emerald-600 w-3.5 h-3.5 flex-shrink-0"
                  />
                  <span className="text-xs text-slate-700 flex-1 truncate">{path.label.trim()}</span>
                  <code className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">{path.href}</code>
                </label>
              ))}
            </div>
          );
        })}
      </div>

      {/* Footer count */}
      <div className="px-3 py-1.5 bg-white border-t border-slate-200 text-[11px] text-slate-400">
        {selected.filter(p => p !== "").length} path{selected.filter(p => p !== "").length !== 1 ? "s" : ""} selected
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface Props {
  roles: RoleDefinition[];
  createRole: (f: FormData) => Promise<void>;
  updateRole:  (f: FormData) => Promise<void>;
  deleteRole:  (id: string) => Promise<void>;
}

export default function RoleDefinitionList({ roles, createRole, updateRole, deleteRole }: Props) {
  const [isOpen,     setIsOpen]     = useState(false);
  const [editing,    setEditing]    = useState<RoleDefinition | null>(null);
  const [pending,    setPending]    = useState(false);
  const [error,      setError]      = useState("");
  const [expanded,   setExpanded]   = useState<string | null>(null);
  const [accessMode, setAccessMode] = useState<"blacklist" | "whitelist">("blacklist");
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);

  function openCreate() {
    setEditing(null); setError(""); setAccessMode("blacklist"); setSelectedPaths([]); setIsOpen(true);
  }
  function openEdit(r: RoleDefinition) {
    setEditing(r); setError(""); setAccessMode(r.accessMode);
    setSelectedPaths(r.accessMode === "whitelist" ? r.allowedPaths : r.blockedPaths);
    setIsOpen(true);
  }

  function handleAccessModeChange(mode: "blacklist" | "whitelist") {
    // When switching mode, load the relevant paths from editing role (if any)
    setAccessMode(mode);
    if (editing) setSelectedPaths(mode === "whitelist" ? editing.allowedPaths : editing.blockedPaths);
    else setSelectedPaths([]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const fd = new FormData(e.currentTarget);
      if (editing) await updateRole(fd);
      else         await createRole(fd);
      setIsOpen(false);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{roles.length} role{roles.length !== 1 ? "s" : ""} defined</p>
        <Link href="/admin/members/roles/create-role" className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm">
          <span className="material-symbols-rounded text-[20px]">add</span>
          Add New Role
        </Link>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-blue-700 mb-4">
        <span className="material-symbols-rounded text-[20px] flex-shrink-0 mt-0.5" style={ICO}>info</span>
        <div>
          <p className="font-semibold">How roles work</p>
          <p className="text-xs text-blue-600 mt-0.5">
            <strong>Blacklist</strong> — access everything <em>except</em> selected pages. &nbsp;
            <strong>Whitelist</strong> — access <em>only</em> selected pages.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {roles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-100 mb-4 block" style={ICO_FILL}>shield_with_heart</span>
            <p className="text-slate-500 font-medium">No roles defined yet.</p>
            <p className="text-xs text-slate-400 mt-1">Click "Add New Role" to create your first role.</p>
          </div>
        ) : (
          roles.map(role => (
            <div key={role.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 px-5 py-4">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${role.badgeColor}`}>
                  <span className="material-symbols-rounded text-[11px]" style={ICO_FILL}>shield</span>
                  {role.label}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-700">{role.label}</p>
                    <code className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">{role.value}</code>
                    {role.is_system && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">SYSTEM</span>}
                  </div>
                  {role.desc && <p className="text-xs text-slate-400 mt-0.5 truncate">{role.desc}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${role.accessMode === "whitelist" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"}`}>
                    {role.accessMode === "whitelist" ? "Whitelist" : "Blacklist"}
                  </span>
                  <button onClick={() => setExpanded(expanded === role.id ? null : role.id)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                    <span className={`material-symbols-rounded text-[18px] transition-transform ${expanded === role.id ? "rotate-180" : ""}`} style={ICO}>expand_more</span>
                  </button>
                  {!role.is_system && (
                    <>
                      <button onClick={() => openEdit(role)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors">
                        <span className="material-symbols-rounded text-[18px]">edit</span>
                      </button>
                      <DeleteButton action={deleteRole.bind(null, role.id)} size="sm" label="" />
                    </>
                  )}
                </div>
              </div>

              {expanded === role.id && (
                <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {role.accessMode === "whitelist" ? "Allowed Pages" : "Blocked Pages"}
                  </p>
                  {(role.accessMode === "whitelist" ? role.allowedPaths : role.blockedPaths).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">None configured</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {(role.accessMode === "whitelist" ? role.allowedPaths : role.blockedPaths).map((p, i) => {
                        const nav = ALL_NAV_PATHS.find(n => n.href === p);
                        return (
                          <span key={i} className="inline-flex items-center gap-1 text-[11px] bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-600 font-mono">
                            {nav ? <span className="font-sans text-slate-500">{nav.label.trim()}</span> : null}
                            <span className="text-slate-400">{p}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <AdminModal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? "Edit Role" : "Create New Role"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          {/* Hidden field for the unused path mode */}
          <input type="hidden" name={accessMode === "whitelist" ? "blockedPaths" : "allowedPaths"} value="" />

          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          {!editing && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Role Key <span className="normal-case font-normal text-slate-400">(unique, no spaces)</span></label>
              <input name="value" required placeholder="e.g. role_editor"
                pattern="^[a-z][a-z0-9_]*$" title="Lowercase letters, numbers and underscores only"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              <p className="text-[11px] text-slate-400">Lowercase + underscores only. e.g. <code>role_editor</code></p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Display Label</label>
            <input name="label" defaultValue={editing?.label ?? ""} required placeholder="e.g. Editor"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
            <input name="desc" defaultValue={editing?.desc ?? ""} placeholder="e.g. Can manage blogs and news only"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Badge Color</label>
            <div className="grid grid-cols-4 gap-2">
              {BADGE_OPTIONS.map(opt => (
                <label key={opt.value} className="cursor-pointer">
                  <input type="radio" name="badgeColor" value={opt.value} defaultChecked={(editing?.badgeColor ?? BADGE_OPTIONS[0].value) === opt.value} className="sr-only peer" />
                  <div className={`px-2 py-1.5 rounded-lg text-[11px] font-bold text-center border-2 transition-all peer-checked:border-slate-800 border-transparent ${opt.value}`}>
                    {opt.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Access Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { v: "blacklist", label: "Blacklist", desc: "Block selected pages" },
                { v: "whitelist", label: "Whitelist", desc: "Allow only selected pages" },
              ] as const).map(opt => (
                <label key={opt.v} className="flex items-start gap-2 p-3 rounded-xl border cursor-pointer transition-all border-slate-200 bg-slate-50 hover:border-emerald-300 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
                  <input type="radio" name="accessMode" value={opt.v} checked={accessMode === opt.v} onChange={() => handleAccessModeChange(opt.v)} className="mt-0.5 accent-emerald-600" />
                  <div>
                    <p className="text-sm font-bold text-slate-700">{opt.label}</p>
                    <p className="text-xs text-slate-400">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">
              {accessMode === "whitelist" ? "Allowed Pages" : "Blocked Pages"}
            </label>
            <PathPicker
              name={accessMode === "whitelist" ? "allowedPaths" : "blockedPaths"}
              selected={selectedPaths}
              onChange={setSelectedPaths}
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={() => setIsOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={pending} className="flex-1 px-4 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50">
              {pending ? "Saving..." : editing ? "Update Role" : "Create Role"}
            </button>
          </div>
        </form>
      </AdminModal>
    </>
  );
}
