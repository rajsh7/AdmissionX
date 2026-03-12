"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props {
  college: CollegeUser;
}

interface Activity {
  id: number;
  typeOfActivity: string;
  name: string;
  created_at: string;
  updated_at: string;
}

type Grouped = Record<string, Activity[]>;

const ACTIVITY_TYPES = ["Sports", "Cultural", "Technical", "Other"] as const;
type ActivityType = (typeof ACTIVITY_TYPES)[number];

const TYPE_META: Record<
  ActivityType,
  { icon: string; accent: string; bg: string; border: string; chip: string }
> = {
  Sports: {
    icon: "sports",
    accent: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800/50",
    chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  Cultural: {
    icon: "theater_comedy",
    accent: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    border: "border-violet-200 dark:border-violet-800/50",
    chip: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border-violet-200 dark:border-violet-800",
  },
  Technical: {
    icon: "precision_manufacturing",
    accent: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800/50",
    chip: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  Other: {
    icon: "category",
    accent: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800/50",
    chip: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
};

// ── Delete Confirm ─────────────────────────────────────────────────────────────
function DeleteConfirm({
  activity,
  slug,
  onClose,
  onDeleted,
}: {
  activity: Activity;
  slug: string;
  onClose: () => void;
  onDeleted: (id: number) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(
        `/api/college/dashboard/${slug}/sports?activityId=${activity.id}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed.");
      onDeleted(activity.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
      setDeleting(false);
    }
  }

  const meta = TYPE_META[activity.typeOfActivity as ActivityType] ?? TYPE_META.Other;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
          <span
            className="material-symbols-rounded text-3xl text-red-500"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            delete
          </span>
        </div>
        <div className="text-center">
          <h3 className="font-bold text-slate-800 dark:text-white text-lg">
            Remove Activity?
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              &ldquo;{activity.name}&rdquo;
            </span>{" "}
            will be permanently removed from{" "}
            <span className={`font-semibold ${meta.accent}`}>
              {activity.typeOfActivity}
            </span>
            .
          </p>
        </div>
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Removing…
              </>
            ) : (
              "Remove"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Inline add input ───────────────────────────────────────────────────────────
function AddActivityInput({
  type,
  slug,
  onAdded,
  onCancel,
}: {
  type: ActivityType;
  slug: string;
  onAdded: (a: Activity) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n) {
      setError("Activity name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/sports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, typeOfActivity: type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add.");
      onAdded(data.activity as Activity);
      setName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add.");
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onCancel();
  }

  const meta = TYPE_META[type];

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-3">
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          onKeyDown={handleKeyDown}
          placeholder={`New ${type} activity…`}
          maxLength={100}
          className={`
            w-full px-4 py-2 rounded-xl border-2 text-sm font-medium
            bg-white dark:bg-slate-900/60
            text-slate-800 dark:text-white placeholder-slate-400
            focus:outline-none transition-all
            ${error
              ? "border-red-400 focus:border-red-500"
              : `border-slate-200 dark:border-slate-700 focus:${meta.border}`
            }
          `}
        />
        {error && (
          <p className="absolute top-full left-0 mt-1 text-xs text-red-500 whitespace-nowrap font-medium">
            {error}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={saving || !name.trim()}
        className={`
          flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all
          disabled:opacity-50 disabled:cursor-not-allowed shrink-0
          ${meta.chip} border
        `}
      >
        {saving ? (
          <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        ) : (
          <span
            className="material-symbols-rounded text-base"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            add
          </span>
        )}
        Add
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shrink-0"
      >
        <span
          className="material-symbols-rounded text-slate-500 text-lg"
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          close
        </span>
      </button>
    </form>
  );
}

// ── Activity chip ──────────────────────────────────────────────────────────────
function ActivityChip({
  activity,
  chipCls,
  onDelete,
}: {
  activity: Activity;
  chipCls: string;
  onDelete: () => void;
}) {
  return (
    <span
      className={`
        group/chip inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5
        rounded-xl border text-sm font-semibold transition-all
        ${chipCls}
      `}
    >
      {activity.name}
      <button
        onClick={onDelete}
        title="Remove"
        className="w-5 h-5 rounded-lg bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center transition-colors shrink-0 ml-0.5"
      >
        <span
          className="material-symbols-rounded text-[13px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          close
        </span>
      </button>
    </span>
  );
}

// ── Section skeleton ───────────────────────────────────────────────────────────
function SectionSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-1.5">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16" />
          </div>
        </div>
        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl"
            style={{ width: `${60 + i * 20}px` }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Type section ───────────────────────────────────────────────────────────────
function TypeSection({
  type,
  activities,
  slug,
  onAdded,
  onDeleteRequest,
}: {
  type: ActivityType;
  activities: Activity[];
  slug: string;
  onAdded: (a: Activity) => void;
  onDeleteRequest: (a: Activity) => void;
}) {
  const [showInput, setShowInput] = useState(false);
  const meta = TYPE_META[type];

  function handleAdded(a: Activity) {
    onAdded(a);
    setShowInput(false);
  }

  return (
    <div
      className={`rounded-2xl border p-5 space-y-4 transition-all ${meta.bg} ${meta.border}`}
    >
      {/* Section header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl bg-white/70 dark:bg-black/20 flex items-center justify-center shadow-sm`}
          >
            <span
              className={`material-symbols-rounded text-xl ${meta.accent}`}
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}
            >
              {meta.icon}
            </span>
          </div>
          <div>
            <h3 className="font-black text-slate-800 dark:text-white text-base leading-tight">
              {type}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {activities.length} activit{activities.length !== 1 ? "ies" : "y"}
            </p>
          </div>
        </div>

        {!showInput && (
          <button
            onClick={() => setShowInput(true)}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold
              border transition-all active:scale-95
              ${meta.chip}
            `}
          >
            <span
              className="material-symbols-rounded text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              add
            </span>
            Add
          </button>
        )}
      </div>

      {/* Activity chips */}
      {activities.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {activities.map((a) => (
            <ActivityChip
              key={a.id}
              activity={a}
              chipCls={meta.chip}
              onDelete={() => onDeleteRequest(a)}
            />
          ))}
        </div>
      ) : (
        !showInput && (
          <div className="flex items-center gap-2 py-2">
            <span
              className={`material-symbols-rounded text-base opacity-40 ${meta.accent}`}
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              add_circle
            </span>
            <p className="text-sm text-slate-400 dark:text-slate-500 italic">
              No {type.toLowerCase()} activities added yet
            </p>
          </div>
        )
      )}

      {/* Inline add input */}
      {showInput && (
        <AddActivityInput
          type={type}
          slug={slug}
          onAdded={handleAdded}
          onCancel={() => setShowInput(false)}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function SportsTab({ college }: Props) {
  const slug = college.slug;

  const [grouped, setGrouped] = useState<Grouped>({
    Sports: [],
    Cultural: [],
    Technical: [],
    Other: [],
  });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/sports`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load.");
      setGrouped(
        data.grouped ?? {
          Sports: [],
          Cultural: [],
          Technical: [],
          Other: [],
        },
      );
      setTotal(data.total ?? 0);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load sports & activities.",
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  function handleAdded(a: Activity) {
    const type = a.typeOfActivity as ActivityType;
    setGrouped((prev) => ({
      ...prev,
      [type]: [...(prev[type] ?? []), a].sort((x, y) =>
        x.name.localeCompare(y.name),
      ),
    }));
    setTotal((t) => t + 1);
    showToast(`"${a.name}" added to ${type}!`);
  }

  function handleDeleteRequest(a: Activity) {
    setDeleteTarget(a);
  }

  function handleDeleted(id: number) {
    let deletedType = "";
    setGrouped((prev) => {
      const next = { ...prev };
      for (const type of ACTIVITY_TYPES) {
        const before = next[type] ?? [];
        const after = before.filter((a) => a.id !== id);
        if (after.length !== before.length) {
          deletedType = type;
          next[type] = after;
        }
      }
      return next;
    });
    setTotal((t) => Math.max(0, t - 1));
    setDeleteTarget(null);
    showToast(
      `Activity removed from ${deletedType || "the list"}.`,
      true,
    );
  }

  // ── Summary stats for header ───────────────────────────────────────────────
  const groupCounts = ACTIVITY_TYPES.map((t) => ({
    type: t,
    count: (grouped[t] ?? []).length,
  }));

  return (
    <div className="space-y-6">
      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`
            fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50
            flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold
            transition-all animate-in fade-in slide-in-from-bottom-4 duration-300
            ${toast.ok ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}
          `}
        >
          <span
            className="material-symbols-rounded text-base"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {toast.ok ? "check_circle" : "error"}
          </span>
          {toast.msg}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Sports &amp; Activities
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {total} activit{total !== 1 ? "ies" : "y"} across{" "}
            {groupCounts.filter((g) => g.count > 0).length} categor
            {groupCounts.filter((g) => g.count > 0).length !== 1
              ? "ies"
              : "y"}
          </p>
        </div>

        {/* Summary pills */}
        {!loading && total > 0 && (
          <div className="flex flex-wrap gap-2">
            {groupCounts
              .filter((g) => g.count > 0)
              .map(({ type, count }) => {
                const meta = TYPE_META[type];
                return (
                  <span
                    key={type}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${meta.chip}`}
                  >
                    <span
                      className="material-symbols-rounded text-sm"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {meta.icon}
                    </span>
                    {type}: {count}
                  </span>
                );
              })}
          </div>
        )}
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

      {/* ── Sections ───────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {ACTIVITY_TYPES.map((t) => (
            <SectionSkeleton key={t} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {ACTIVITY_TYPES.map((type) => (
            <TypeSection
              key={type}
              type={type}
              activities={grouped[type] ?? []}
              slug={slug}
              onAdded={handleAdded}
              onDeleteRequest={handleDeleteRequest}
            />
          ))}
        </div>
      )}

      {/* ── Tips ───────────────────────────────────────────────────────────── */}
      {!loading && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <span
              className="material-symbols-rounded text-xl text-blue-500 dark:text-blue-400 mt-0.5 shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              lightbulb
            </span>
            <div>
              <p className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-1">
                Tips
              </p>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                <li>
                  <strong>Sports</strong> — inter-college games, tournaments,
                  fitness programs
                </li>
                <li>
                  <strong>Cultural</strong> — fests, drama, music, dance, art
                  events
                </li>
                <li>
                  <strong>Technical</strong> — hackathons, coding contests,
                  robotics, tech-fests
                </li>
                <li>
                  <strong>Other</strong> — anything that doesn&apos;t fit above
                  (NSS, NCC, social clubs…)
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ──────────────────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteConfirm
          activity={deleteTarget}
          slug={slug}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
