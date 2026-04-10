"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props {
  college: CollegeUser;
}

interface Option {
  id: number;
  name: string;
}

interface Options {
  degrees: Option[];
  courses: Option[];
  streams: Option[];
}

interface Cutoff {
  id: number;
  title: string;
  description: string | null;
  degree_id: number | null;
  course_id: number | null;
  functionalarea_id: number | null;
  degree_name: string | null;
  course_name: string | null;
  stream_name: string | null;
  created_at: string;
  updated_at: string;
}

const EMPTY_FORM = {
  title: "",
  description: "",
  degree_id: "",
  course_id: "",
  functionalarea_id: "",
};

// ── Skeleton row ───────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2.5">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-2/5" />
          <div className="flex gap-2">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-28" />
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-24" />
          </div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        </div>
        <div className="flex gap-2 shrink-0">
          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────────
function Badge({
  icon,
  label,
  cls,
}: {
  icon: string;
  label: string;
  cls: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${cls}`}
    >
      <span
        className="material-symbols-rounded text-[12px]"
        style={{
          fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 20",
        }}
      >
        {icon}
      </span>
      {label}
    </span>
  );
}

// ── Select helper ──────────────────────────────────────────────────────────────
function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
      >
        <option value="">{placeholder ?? `— Select ${label} —`}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Add / Edit Modal ───────────────────────────────────────────────────────────
function CutoffModal({
  cutoff,
  options,
  slug,
  onClose,
  onSaved,
}: {
  cutoff: Cutoff | null;
  options: Options;
  slug: string;
  onClose: () => void;
  onSaved: (c: Cutoff) => void;
}) {
  const isEdit = !!cutoff;

  const [form, setForm] = useState({
    ...EMPTY_FORM,
    ...(cutoff
      ? {
          title: cutoff.title,
          description: cutoff.description ?? "",
          degree_id: cutoff.degree_id ? String(cutoff.degree_id) : "",
          course_id: cutoff.course_id ? String(cutoff.course_id) : "",
          functionalarea_id: cutoff.functionalarea_id
            ? String(cutoff.functionalarea_id)
            : "",
        }
      : {}),
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(k: keyof typeof EMPTY_FORM, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = form.title.trim();
    if (!t) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError("");

    const body = {
      title: t,
      description: form.description.trim() || undefined,
      degree_id: form.degree_id ? Number(form.degree_id) : null,
      course_id: form.course_id ? Number(form.course_id) : null,
      functionalarea_id: form.functionalarea_id
        ? Number(form.functionalarea_id)
        : null,
    };

    const url = isEdit
      ? `/api/college/dashboard/${slug}/cutoffs?cutoffId=${cutoff!.id}`
      : `/api/college/dashboard/${slug}/cutoffs`;

    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed.");
      onSaved(data.cutoff as Cutoff);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span
                className="material-symbols-rounded text-primary text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                content_cut
              </span>
            </div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-white text-lg leading-tight">
                {isEdit ? "Edit Cut-off Entry" : "Add Cut-off Entry"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEdit
                  ? "Update the details below"
                  : "Fill in the cut-off details"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <span
              className="material-symbols-rounded text-slate-600 dark:text-slate-300 text-xl"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              close
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. B.Tech CSE 2024 Cut-off"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SelectField
              label="Degree"
              value={form.degree_id}
              onChange={(v) => set("degree_id", v)}
              options={options.degrees}
              placeholder="Any Degree"
            />
            <SelectField
              label="Course"
              value={form.course_id}
              onChange={(v) => set("course_id", v)}
              options={options.courses}
              placeholder="Any Course"
            />
            <SelectField
              label="Stream"
              value={form.functionalarea_id}
              onChange={(v) => set("functionalarea_id", v)}
              options={options.streams}
              placeholder="Any Stream"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
              Description
              <span className="ml-1 font-normal text-slate-400 normal-case tracking-normal">
                (optional)
              </span>
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Add cut-off marks, percentiles, rank ranges, or any other relevant details…"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <span
                className="material-symbols-rounded text-red-500 text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                error
              </span>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-2xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <span
                    className="material-symbols-rounded text-base"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {isEdit ? "save" : "add"}
                  </span>
                  {isEdit ? "Save Changes" : "Add Cut-off"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm ─────────────────────────────────────────────────────────────
function DeleteConfirm({
  cutoff,
  slug,
  onClose,
  onDeleted,
}: {
  cutoff: Cutoff;
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
        `/api/college/dashboard/${slug}/cutoffs?cutoffId=${cutoff.id}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed.");
      onDeleted(cutoff.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
      setDeleting(false);
    }
  }

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
        <div className="text-center space-y-1">
          <h3 className="font-bold text-slate-800 dark:text-white text-lg">
            Delete Cut-off?
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              &ldquo;{cutoff.title}&rdquo;
            </span>{" "}
            will be permanently deleted.
          </p>
        </div>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
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
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Cutoff Row ─────────────────────────────────────────────────────────────────
function CutoffRow({
  cutoff,
  onEdit,
  onDelete,
}: {
  cutoff: Cutoff;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-primary/30 hover:shadow-sm transition-all duration-200 p-5">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <span
            className="material-symbols-rounded text-xl text-primary"
            style={{
              fontVariationSettings:
                "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24",
            }}
          >
            content_cut
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm leading-snug">
            {cutoff.title}
          </h3>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {cutoff.degree_name && (
              <Badge
                icon="school"
                label={cutoff.degree_name}
                cls="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              />
            )}
            {cutoff.course_name && (
              <Badge
                icon="menu_book"
                label={cutoff.course_name}
                cls="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
              />
            )}
            {cutoff.stream_name && (
              <Badge
                icon="category"
                label={cutoff.stream_name}
                cls="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              />
            )}
            {!cutoff.degree_name &&
              !cutoff.course_name &&
              !cutoff.stream_name && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                  No degree/course/stream specified
                </span>
              )}
          </div>

          {/* Description */}
          {cutoff.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">
              {cutoff.description}
            </p>
          )}

          {/* Date */}
          <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-2 flex items-center gap-1">
            <span
              className="material-symbols-rounded text-[12px]"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              schedule
            </span>
            Added{" "}
            {new Date(cutoff.created_at).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={onEdit}
            title="Edit"
            className="w-8 h-8 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
          >
            <span
              className="material-symbols-rounded text-primary text-base"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              edit
            </span>
          </button>
          <button
            onClick={onDelete}
            title="Delete"
            className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center justify-center transition-colors"
          >
            <span
              className="material-symbols-rounded text-red-500 text-base"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              delete
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function CutoffsTab({ college }: Props) {
  const slug = college.slug;

  const [cutoffs, setCutoffs] = useState<Cutoff[]>([]);
  const [options, setOptions] = useState<Options>({
    degrees: [],
    courses: [],
    streams: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Cutoff | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cutoff | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/cutoffs`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load.");
      setCutoffs(data.cutoffs ?? []);
      setOptions(data.options ?? { degrees: [], courses: [], streams: [] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load cut-offs.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSaved(c: Cutoff) {
    setCutoffs((prev) => {
      const idx = prev.findIndex((x) => x.id === c.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = c;
        return next;
      }
      return [...prev, c];
    });
    setShowModal(false);
    setEditing(null);
    showToast(editing ? "Cut-off updated!" : "Cut-off added!");
  }

  function handleDeleted(id: number) {
    setCutoffs((prev) => prev.filter((c) => c.id !== id));
    setDeleteTarget(null);
    showToast("Cut-off deleted.");
  }

  function openAdd() {
    setEditing(null);
    setShowModal(true);
  }

  function openEdit(c: Cutoff) {
    setEditing(c);
    setShowModal(true);
  }

  const filtered = cutoffs.filter(
    (c) =>
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.degree_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.course_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.stream_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.description ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50
            flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold
            transition-all animate-in fade-in slide-in-from-bottom-4 duration-300
            ${toast.ok ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Cut-offs
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {cutoffs.length} entr{cutoffs.length !== 1 ? "ies" : "y"} · help
            students understand admission thresholds
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
        >
          <span
            className="material-symbols-rounded text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            add
          </span>
          Add Cut-off
        </button>
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

      {/* ── Search ─────────────────────────────────────────────────────────── */}
      {!loading && cutoffs.length > 3 && (
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-xl pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Search by title, course, degree or stream…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
      )}

      {/* ── Legend pills ───────────────────────────────────────────────────── */}
      {!loading && cutoffs.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium mr-1">
            Tags:
          </span>
          <Badge
            icon="school"
            label="Degree"
            cls="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
          />
          <Badge
            icon="menu_book"
            label="Course"
            cls="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
          />
          <Badge
            icon="category"
            label="Stream"
            cls="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
          />
        </div>
      )}

      {/* ── List ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span
            className="material-symbols-rounded text-6xl text-slate-300 dark:text-slate-600 mb-4"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            content_cut
          </span>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {search
              ? "No cut-offs match your search."
              : "No cut-off entries added yet."}
          </p>
          {!search && (
            <button
              onClick={openAdd}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all"
            >
              <span
                className="material-symbols-rounded text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                add
              </span>
              Add First Cut-off
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <CutoffRow
              key={c.id}
              cutoff={c}
              onEdit={() => openEdit(c)}
              onDelete={() => setDeleteTarget(c)}
            />
          ))}
        </div>
      )}

      {/* ── Bottom Add button ──────────────────────────────────────────────── */}
      {!loading && cutoffs.length > 0 && (
        <button
          onClick={openAdd}
          className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-400 dark:text-slate-500 hover:border-primary/40 hover:text-primary dark:hover:text-primary transition-all flex items-center justify-center gap-2"
        >
          <span
            className="material-symbols-rounded text-lg"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            add_circle
          </span>
          Add another cut-off entry
        </button>
      )}

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {showModal && (
        <CutoffModal
          cutoff={editing}
          options={options}
          slug={slug}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          cutoff={deleteTarget}
          slug={slug}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
