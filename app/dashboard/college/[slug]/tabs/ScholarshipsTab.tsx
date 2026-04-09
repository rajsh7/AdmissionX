"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props {
  college: CollegeUser;
}

interface Scholarship {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// -- Skeleton row --------------------------------------------------------------
function SkeletonRow() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/5" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
        <div className="flex gap-2 shrink-0">
          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// -- Inline form (add or edit) -------------------------------------------------
function ScholarshipForm({
  initial,
  slug,
  onSaved,
  onCancel,
}: {
  initial: Scholarship | null;
  slug: string;
  onSaved: (s: Scholarship) => void;
  onCancel: () => void;
}) {
  const isEdit = !!initial;
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) { setError("Title is required."); return; }
    setSaving(true);
    setError("");

    const body = { title: t, description: description.trim() || undefined };

    const url = isEdit
      ? `/api/college/dashboard/${slug}/scholarships?scholarshipId=${initial!.id}`
      : `/api/college/dashboard/${slug}/scholarships`;

    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed.");
      onSaved(data.scholarship as Scholarship);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-primary/30 shadow-sm shadow-primary/10 p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <span
            className="material-symbols-rounded text-primary text-base"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" }}
          >
            {isEdit ? "edit" : "add_circle"}
          </span>
        </div>
        <h3 className="font-bold text-slate-800 dark:text-white text-sm">
          {isEdit ? "Edit Scholarship" : "Add New Scholarship"}
        </h3>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setError(""); }}
          placeholder="e.g. Merit Scholarship for Top Students"
          autoFocus
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Eligibility criteria, amount, selection process…"
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <span
            className="material-symbols-rounded text-red-500 text-base"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            error
          </span>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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
              {isEdit ? "Save Changes" : "Add Scholarship"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// -- Delete Confirm -------------------------------------------------------------
function DeleteConfirm({
  scholarship,
  slug,
  onClose,
  onDeleted,
}: {
  scholarship: Scholarship;
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
        `/api/college/dashboard/${slug}/scholarships?scholarshipId=${scholarship.id}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed.");
      onDeleted(scholarship.id);
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
            Delete Scholarship?
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              &ldquo;{scholarship.title}&rdquo;
            </span>{" "}
            will be permanently deleted.
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

// -- Scholarship Row ------------------------------------------------------------
function ScholarshipRow({
  scholarship,
  onEdit,
  onDelete,
}: {
  scholarship: Scholarship;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-primary/30 hover:shadow-sm transition-all duration-200 p-5">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 mt-0.5">
          <span
            className="material-symbols-rounded text-xl text-amber-600 dark:text-amber-400"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}
          >
            workspace_premium
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm leading-snug">
            {scholarship.title}
          </h3>
          {scholarship.description ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
              {scholarship.description}
            </p>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-600 mt-1 italic">
              No description provided
            </p>
          )}
          <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-2 flex items-center gap-1">
            <span
              className="material-symbols-rounded text-[12px]"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              schedule
            </span>
            Added{" "}
            {new Date(scholarship.created_at).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Actions — visible on hover */}
        <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={onEdit}
            title="Edit scholarship"
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
            title="Delete scholarship"
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

// ------------------------------------------------------------------------------
export default function ScholarshipsTab({ college }: Props) {
  const slug = college.slug;

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state: null = hidden, undefined = add new, Scholarship = edit
  const [formTarget, setFormTarget] = useState<Scholarship | null | undefined>(
    undefined,
  );
  const [deleteTarget, setDeleteTarget] = useState<Scholarship | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [search, setSearch] = useState("");

  const showFormAdd = formTarget === null; // null means "show form for new"

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  // -- Load ------------------------------------------------------------------
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/scholarships`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load.");
      setScholarships(data.scholarships ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load scholarships.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  // -- Handlers --------------------------------------------------------------
  function handleSaved(s: Scholarship) {
    setScholarships((prev) => {
      const idx = prev.findIndex((x) => x.id === s.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = s;
        return next;
      }
      return [...prev, s];
    });
    setFormTarget(undefined); // hide form
    showToast(
      formTarget === null
        ? "Scholarship added successfully!"
        : "Scholarship updated successfully!",
    );
  }

  function handleDeleted(id: number) {
    setScholarships((prev) => prev.filter((s) => s.id !== id));
    setDeleteTarget(null);
    showToast("Scholarship deleted.", true);
  }

  const filtered = scholarships.filter(
    (s) =>
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.description ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* -- Toast ------------------------------------------------------------ */}
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

      {/* -- Header ----------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Scholarships
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {scholarships.length} scholarship
            {scholarships.length !== 1 ? "s" : ""} listed
          </p>
        </div>
        {formTarget === undefined && (
          <button
            onClick={() => setFormTarget(null)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
          >
            <span
              className="material-symbols-rounded text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              add
            </span>
            Add Scholarship
          </button>
        )}
      </div>

      {/* -- Error ------------------------------------------------------------ */}
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

      {/* -- Add form (shown at top when adding new) --------------------------- */}
      {showFormAdd && (
        <ScholarshipForm
          initial={null}
          slug={slug}
          onSaved={handleSaved}
          onCancel={() => setFormTarget(undefined)}
        />
      )}

      {/* -- Search ----------------------------------------------------------- */}
      {!loading && scholarships.length > 3 && (
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-xl pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Search scholarships…"
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
      )}

      {/* -- List ------------------------------------------------------------- */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : filtered.length === 0 && !showFormAdd ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span
            className="material-symbols-rounded text-6xl text-slate-300 dark:text-slate-600 mb-4"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            workspace_premium
          </span>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {search
              ? "No scholarships match your search."
              : "No scholarships added yet."}
          </p>
          {!search && (
            <button
              onClick={() => setFormTarget(null)}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all"
            >
              <span
                className="material-symbols-rounded text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                add
              </span>
              Add First Scholarship
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) =>
            // Show edit form inline in place of the row being edited
            formTarget && (formTarget as Scholarship).id === s.id ? (
              <ScholarshipForm
                key={s.id}
                initial={s}
                slug={slug}
                onSaved={handleSaved}
                onCancel={() => setFormTarget(undefined)}
              />
            ) : (
              <ScholarshipRow
                key={s.id}
                scholarship={s}
                onEdit={() => setFormTarget(s)}
                onDelete={() => setDeleteTarget(s)}
              />
            ),
          )}
        </div>
      )}

      {/* -- Bottom Add button (when list has items and form is hidden) --------- */}
      {!loading && scholarships.length > 0 && formTarget === undefined && (
        <button
          onClick={() => setFormTarget(null)}
          className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-400 dark:text-slate-500 hover:border-primary/40 hover:text-primary dark:hover:text-primary transition-all flex items-center justify-center gap-2"
        >
          <span
            className="material-symbols-rounded text-lg"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            add_circle
          </span>
          Add another scholarship
        </button>
      )}

      {/* -- Delete Confirm Modal ---------------------------------------------- */}
      {deleteTarget && (
        <DeleteConfirm
          scholarship={deleteTarget}
          slug={slug}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
