"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props {
  college: CollegeUser;
}

interface PlacementData {
  id: number | null;
  numberofrecruitingcompany: string;
  numberofplacementlastyear: string;
  ctchighest: string;
  ctclowest: string;
  ctcaverage: string;
  placementinfo: string;
}

const EMPTY: PlacementData = {
  id: null,
  numberofrecruitingcompany: "",
  numberofplacementlastyear: "",
  ctchighest: "",
  ctclowest: "",
  ctcaverage: "",
  placementinfo: "",
};

// ── Completeness ring ─────────────────────────────────────────────────────────
function CompletenessRing({ pct }: { pct: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 80 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg width="96" height="96" className="-rotate-90">
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="7"
        />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-black text-slate-800 dark:text-white leading-none">
          {pct}%
        </span>
        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
          filled
        </span>
      </div>
    </div>
  );
}

// ── Field component ───────────────────────────────────────────────────────────
function Field({
  label,
  hint,
  icon,
  value,
  onChange,
  type = "text",
  placeholder,
  multiline,
  rows,
}: {
  label: string;
  hint?: string;
  icon: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const base =
    "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
        <span
          className="material-symbols-rounded text-sm text-slate-400"
          style={{
            fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
          }}
        >
          {icon}
        </span>
        {label}
      </label>
      {hint && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 -mt-0.5">
          {hint}
        </p>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows ?? 4}
          className={`${base} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={base}
        />
      )}
    </div>
  );
}

// ── Stat card (read-only display when saved) ──────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  accent: string;
}) {
  const isEmpty = !value;
  return (
    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}
      >
        <span
          className="material-symbols-rounded text-xl"
          style={{
            fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24",
          }}
        >
          {icon}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {label}
        </p>
        <p
          className={`text-base font-black truncate ${isEmpty ? "text-slate-300 dark:text-slate-600" : "text-slate-800 dark:text-white"}`}
        >
          {isEmpty ? "—" : value}
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function PlacementTab({ college }: Props) {
  const [form, setForm] = useState<PlacementData>(EMPTY);
  const [completeness, setCompleteness] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [dirty, setDirty] = useState(false);

  const slug = college.slug;

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/placement`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setForm(data.placement as PlacementData);
      setCompleteness(data.placementComplete ?? 0);
    } catch (e) {
      showToast(
        "error",
        e instanceof Error ? e.message : "Failed to load placement data",
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Toast ─────────────────────────────────────────────────────────────────
  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  // ── Field updater ─────────────────────────────────────────────────────────
  function update(field: keyof PlacementData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        numberofrecruitingcompany: form.numberofrecruitingcompany,
        numberofplacementlastyear: form.numberofplacementlastyear,
        ctchighest: form.ctchighest,
        ctclowest: form.ctclowest,
        ctcaverage: form.ctcaverage,
        placementinfo: form.placementinfo,
      };

      const res = await fetch(`/api/college/dashboard/${slug}/placement`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");

      showToast("success", data.message ?? "Placement data saved.");
      setDirty(false);
      // Recompute completeness locally
      const statFields = [
        form.numberofrecruitingcompany,
        form.numberofplacementlastyear,
        form.ctchighest,
        form.ctclowest,
        form.ctcaverage,
      ];
      const filled = statFields.filter((v) => v.trim() !== "").length;
      setCompleteness(Math.round((filled / 5) * 100));
    } catch (e) {
      showToast("error", e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-64" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl"
            />
          ))}
        </div>
        <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-32" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold transition-all
            ${
              toast.type === "success"
                ? "bg-emerald-500 text-white"
                : "bg-red-500 text-white"
            }`}
        >
          <span
            className="material-symbols-rounded text-lg"
            style={{
              fontVariationSettings:
                "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24",
            }}
          >
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          {toast.msg}
        </div>
      )}

      {/* ── Header + ring ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
        <CompletenessRing pct={completeness} />
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-black text-slate-800 dark:text-white">
            Placement Statistics
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Keep your placement record up to date. Complete all 5 stat fields
            for maximum visibility.
          </p>
          <div className="mt-3 h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${completeness}%`,
                background:
                  completeness >= 80
                    ? "#22c55e"
                    : completeness >= 40
                      ? "#f59e0b"
                      : "#ef4444",
              }}
            />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
            {completeness}% of placement stats filled
          </p>
        </div>
      </div>

      {/* ── Snapshot cards ── */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Current Snapshot
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard
            icon="business"
            label="Recruiting Companies"
            value={form.numberofrecruitingcompany}
            accent="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
          />
          <StatCard
            icon="groups"
            label="Placed Last Year"
            value={form.numberofplacementlastyear}
            accent="bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400"
          />
          <StatCard
            icon="arrow_upward"
            label="Highest CTC"
            value={form.ctchighest}
            accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
          />
          <StatCard
            icon="arrow_downward"
            label="Lowest CTC"
            value={form.ctclowest}
            accent="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
          />
          <StatCard
            icon="bar_chart"
            label="Average CTC"
            value={form.ctcaverage}
            accent="bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400"
          />
        </div>
      </div>

      {/* ── Form ── */}
      <form
        onSubmit={handleSave}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-5"
      >
        <h3 className="text-sm font-black text-slate-800 dark:text-white">
          Edit Placement Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label="Recruiting Companies"
            icon="business"
            hint="Number of companies that visited for placements"
            value={form.numberofrecruitingcompany}
            onChange={(v) => update("numberofrecruitingcompany", v)}
            placeholder="e.g. 120"
          />
          <Field
            label="Students Placed"
            icon="groups"
            hint="Total students placed in the last academic year"
            value={form.numberofplacementlastyear}
            onChange={(v) => update("numberofplacementlastyear", v)}
            placeholder="e.g. 450"
          />
          <Field
            label="Highest CTC"
            icon="arrow_upward"
            hint="Highest salary package offered (e.g. 42 LPA)"
            value={form.ctchighest}
            onChange={(v) => update("ctchighest", v)}
            placeholder="e.g. 42 LPA"
          />
          <Field
            label="Lowest CTC"
            icon="arrow_downward"
            hint="Lowest salary package offered"
            value={form.ctclowest}
            onChange={(v) => update("ctclowest", v)}
            placeholder="e.g. 3.5 LPA"
          />
          <Field
            label="Average CTC"
            icon="bar_chart"
            hint="Average salary package (e.g. 8.2 LPA)"
            value={form.ctcaverage}
            onChange={(v) => update("ctcaverage", v)}
            placeholder="e.g. 8.2 LPA"
          />
        </div>

        {/* Placement info — full width */}
        <Field
          label="Placement Info"
          icon="info"
          hint="Additional context, notable recruiters, or placement highlights"
          value={form.placementinfo}
          onChange={(v) => update("placementinfo", v)}
          placeholder="Describe your college's placement achievements, top recruiters, initiatives..."
          multiline
          rows={5}
        />

        {/* Action row */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
          <button
            type="submit"
            disabled={saving || !dirty}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-95 transition-all"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <span
                  className="material-symbols-rounded text-base"
                  style={{
                    fontVariationSettings:
                      "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 20",
                  }}
                >
                  save
                </span>
                Save Changes
              </>
            )}
          </button>

          {!dirty && !saving && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <span
                className="material-symbols-rounded text-sm"
                style={{
                  fontVariationSettings:
                    "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 20",
                }}
              >
                check_circle
              </span>
              Up to date
            </span>
          )}
          {dirty && (
            <span className="text-xs text-amber-500 dark:text-amber-400 font-semibold flex items-center gap-1">
              <span
                className="material-symbols-rounded text-sm"
                style={{
                  fontVariationSettings:
                    "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 20",
                }}
              >
                edit
              </span>
              Unsaved changes
            </span>
          )}
        </div>
      </form>

      {/* ── Tips ── */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <span
            className="material-symbols-rounded text-xl text-blue-500 dark:text-blue-400 mt-0.5 shrink-0"
            style={{
              fontVariationSettings:
                "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24",
            }}
          >
            lightbulb
          </span>
          <div>
            <p className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-1">
              Tips
            </p>
            <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
              <li>
                Use common formats for CTC — e.g. <strong>12 LPA</strong> or{" "}
                <strong>12,00,000</strong>
              </li>
              <li>
                Accurate placement stats increase your profile&apos;s
                credibility with students
              </li>
              <li>Update figures every academic year to stay relevant</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
