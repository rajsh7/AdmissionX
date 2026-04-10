"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props {
  college: CollegeUser;
}

interface Facility {
  id: number;
  name: string;
  iconname: string | null;
  enabled: boolean;
  custom_name: string | null;
  description: string | null;
}

// Common Material Symbols icon name map for facilities
function FacilityIcon({ iconname, name }: { iconname: string | null; name: string }) {
  const icon = iconname?.trim() || guessIcon(name);
  return (
    <span
      className="material-symbols-rounded text-[28px] leading-none select-none"
      style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
    >
      {icon}
    </span>
  );
}

function guessIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("wifi") || n.includes("internet"))  return "wifi";
  if (n.includes("library"))                          return "local_library";
  if (n.includes("lab") || n.includes("laboratory"))  return "science";
  if (n.includes("hostel") || n.includes("dormitory")) return "hotel";
  if (n.includes("canteen") || n.includes("cafeteria")) return "restaurant";
  if (n.includes("gym") || n.includes("fitness"))     return "fitness_center";
  if (n.includes("sport") || n.includes("ground"))    return "sports";
  if (n.includes("park") || n.includes("transport"))  return "directions_bus";
  if (n.includes("medical") || n.includes("health"))  return "local_hospital";
  if (n.includes("auditorium") || n.includes("hall")) return "theater_comedy";
  if (n.includes("seminar") || n.includes("conference")) return "meeting_room";
  if (n.includes("pool") || n.includes("swimming"))   return "pool";
  if (n.includes("bank") || n.includes("atm"))        return "account_balance";
  if (n.includes("store") || n.includes("shop"))      return "shopping_bag";
  if (n.includes("power") || n.includes("generator")) return "bolt";
  if (n.includes("security"))                         return "security";
  if (n.includes("camera") || n.includes("cctv"))     return "videocam";
  if (n.includes("court") || n.includes("basket"))    return "sports_basketball";
  if (n.includes("garden") || n.includes("park"))     return "park";
  if (n.includes("ac") || n.includes("air"))          return "ac_unit";
  return "domain";
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
        <div className="w-11 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
        ${checked ? "bg-primary" : "bg-slate-200 dark:bg-slate-600"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md
          transform transition-transform duration-200 ease-in-out
          ${checked ? "translate-x-5" : "translate-x-0"}
        `}
      />
    </button>
  );
}

export default function FacilitiesTab({ college }: Props) {
  const slug = college.slug;

  const [facilities, setFacilities]   = useState<Facility[]>([]);
  const [pending, setPending]         = useState<Map<number, boolean>>(new Map()); // id → new enabled state
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [toast, setToast]             = useState<{ msg: string; ok: boolean } | null>(null);
  const [search, setSearch]           = useState("");
  const [filter, setFilter]           = useState<"all" | "enabled" | "disabled">("all");

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/college/dashboard/${slug}/facilities`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load facilities.");
      setFacilities(data.facilities ?? []);
      setPending(new Map());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  // Effective enabled state: pending overrides server state
  function isEnabled(f: Facility): boolean {
    return pending.has(f.id) ? pending.get(f.id)! : f.enabled;
  }

  function handleToggle(f: Facility) {
    const next = !isEnabled(f);
    // If reverting to original state, remove from pending
    if (next === f.enabled) {
      setPending((prev) => {
        const m = new Map(prev);
        m.delete(f.id);
        return m;
      });
    } else {
      setPending((prev) => new Map(prev).set(f.id, next));
    }
  }

  const hasPending = pending.size > 0;

  async function handleSave() {
    if (!hasPending) return;
    setSaving(true);
    try {
      const updates = Array.from(pending.entries()).map(([facilities_id, enabled]) => ({
        facilities_id,
        enabled,
      }));

      const res  = await fetch(`/api/college/dashboard/${slug}/facilities`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed.");

      // Commit pending into facilities list
      setFacilities((prev) =>
        prev.map((f) =>
          pending.has(f.id) ? { ...f, enabled: pending.get(f.id)! } : f
        )
      );
      setPending(new Map());
      showToast(`${updates.length} facility update(s) saved!`, true);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Save failed.", false);
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    setPending(new Map());
  }

  // Filtered + searched list
  const visible = facilities.filter((f) => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "enabled"  && !isEnabled(f)) return false;
    if (filter === "disabled" &&  isEnabled(f)) return false;
    return true;
  });

  const enabledCount = facilities.filter((f) => isEnabled(f)).length;
  const pendingCount = pending.size;

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Facilities
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Toggle the facilities available at your campus
          </p>
        </div>

        {/* Stats pill */}
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold">
          <span
            className="material-symbols-rounded text-base"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 20" }}
          >
            check_circle
          </span>
          {enabledCount} / {facilities.length} enabled
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-5 py-4 text-red-700 dark:text-red-400">
          <span className="material-symbols-rounded text-xl">error</span>
          <span className="text-sm font-medium">{error}</span>
          <button
            onClick={load}
            className="ml-auto text-xs font-bold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Pending-changes banner ──────────────────────────────────────────── */}
      {hasPending && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <span className="material-symbols-rounded text-xl">pending</span>
            <span className="text-sm font-semibold">
              {pendingCount} unsaved change{pendingCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscard}
              disabled={saving}
              className="px-4 py-1.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-1.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <span className="material-symbols-rounded text-base" style={{ fontVariationSettings: "'FILL' 1" }}>save</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Search + Filter ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-xl pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Search facilities…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <span className="material-symbols-rounded text-lg">close</span>
            </button>
          )}
        </div>

        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {(["all", "enabled", "disabled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                filter === f
                  ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="material-symbols-rounded text-6xl text-slate-300 dark:text-slate-600 mb-4"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            apartment
          </span>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {search || filter !== "all" ? "No facilities match your filter." : "No facilities found."}
          </p>
          {(search || filter !== "all") && (
            <button
              onClick={() => { setSearch(""); setFilter("all"); }}
              className="mt-3 text-sm text-primary font-semibold hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map((f) => {
            const on      = isEnabled(f);
            const changed = pending.has(f.id);
            return (
              <div
                key={f.id}
                onClick={() => handleToggle(f)}
                className={`
                  group relative bg-white dark:bg-slate-800 rounded-2xl border-2 p-4
                  cursor-pointer transition-all duration-200 select-none
                  ${on
                    ? "border-primary/30 bg-primary/5 dark:bg-primary/10 shadow-sm shadow-primary/10"
                    : "border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600"
                  }
                  ${changed ? "ring-2 ring-amber-400/50" : ""}
                `}
              >
                {/* Changed indicator dot */}
                {changed && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400" />
                )}

                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div
                    className={`
                      flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                      ${on
                        ? "bg-primary/15 text-primary"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
                      }
                    `}
                  >
                    <FacilityIcon iconname={f.iconname} name={f.name} />
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate transition-colors ${
                      on ? "text-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400"
                    }`}>
                      {f.name}
                    </p>
                    {on && (
                      <p className="text-xs text-primary font-semibold mt-0.5">Active</p>
                    )}
                  </div>

                  {/* Toggle */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <Toggle checked={on} onChange={() => handleToggle(f)} disabled={saving} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Summary footer ─────────────────────────────────────────────────── */}
      {!loading && facilities.length > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Showing {visible.length} of {facilities.length} facilities
          </p>
          {hasPending && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs font-bold text-primary hover:underline disabled:opacity-50"
            >
              Save {pendingCount} change{pendingCount !== 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`
            fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50
            flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold
            transition-all animate-in fade-in slide-in-from-bottom-4 duration-300
            ${toast.ok
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
            }
          `}
        >
          <span className="material-symbols-rounded text-base"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {toast.ok ? "check_circle" : "error"}
          </span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
