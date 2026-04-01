"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

interface Props {
  user: { id: string | number; name: string; email: string } | null;
}

interface StudentDocument {
  id: number;
  name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  file_size_kb: string | null;
  category: string;
  category_label: string;
  is_image: boolean;
  created_at: string;
  uploaded_on: string | null;
}

interface DocumentsData {
  documents: StudentDocument[];
  grouped: Record<string, StudentDocument[]>;
  counts: {
    total: number;
    grouped: Record<string, number>;
  };
  categories: Record<string, string>;
}

const CATEGORY_ORDER = [
  "marksheet_10",
  "marksheet_12",
  "marksheet_grad",
  "id_proof",
  "photo",
  "caste_cert",
  "income_cert",
  "migration",
  "other",
];

const CATEGORY_ICONS: Record<string, string> = {
  marksheet_10: "grade",
  marksheet_12: "grade",
  marksheet_grad: "school",
  id_proof: "badge",
  photo: "portrait",
  caste_cert: "description",
  income_cert: "account_balance_wallet",
  migration: "moving",
  other: "folder_open",
};

const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  marksheet_10: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600",
    border: "border-blue-200 dark:border-blue-800",
  },
  marksheet_12: {
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    text: "text-indigo-600",
    border: "border-indigo-200 dark:border-indigo-800",
  },
  marksheet_grad: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-600",
    border: "border-purple-200 dark:border-purple-800",
  },
  id_proof: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-600",
    border: "border-amber-200 dark:border-amber-800",
  },
  photo: {
    bg: "bg-pink-50 dark:bg-pink-900/20",
    text: "text-pink-600",
    border: "border-pink-200 dark:border-pink-800",
  },
  caste_cert: {
    bg: "bg-teal-50 dark:bg-teal-900/20",
    text: "text-teal-600",
    border: "border-teal-200 dark:border-teal-800",
  },
  income_cert: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-600",
    border: "border-green-200 dark:border-green-800",
  },
  migration: {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    text: "text-orange-600",
    border: "border-orange-200 dark:border-orange-800",
  },
  other: {
    bg: "bg-slate-50 dark:bg-slate-800",
    text: "text-slate-600",
    border: "border-slate-200 dark:border-slate-700",
  },
};

// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({
  categories,
  defaultCategory,
  onClose,
  onUploaded,
  studentId,
}: {
  categories: Record<string, string>;
  defaultCategory: string;
  onClose: () => void;
  onUploaded: (doc: StudentDocument) => void;
  studentId: string | number;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(defaultCategory);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFile(f: File) {
    setFile(f);
    setError(null);
    if (!name) setName(f.name.replace(/\.[^.]+$/, ""));
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleUpload() {
    if (!file) {
      setError("Please select a file.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter a document name.");
      return;
    }

    setUploading(true);
    setError(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", name.trim());
    fd.append("category", category);

    try {
      const res = await fetch(`/api/student/${studentId}/documents`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      onUploaded(data.document as StudentDocument);
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
            Upload Document
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : file
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10"
                  : "border-slate-200 dark:border-slate-700 hover:border-primary/60 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />

            {preview ? (
              <Image
                src={preview}
                alt="Preview"
                width={300}
                height={128}
                unoptimized
                className="max-h-32 mx-auto rounded-xl object-contain mb-3"
              />
            ) : file ? (
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-5xl text-emerald-500">
                  description
                </span>
              </div>
            ) : (
              <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 block mb-2">
                cloud_upload
              </span>
            )}

            {file ? (
              <div>
                <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm truncate max-w-xs mx-auto">
                  {file.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB · {file.type}
                </p>
                <p className="text-xs text-primary mt-1 font-medium">
                  Click to change file
                </p>
              </div>
            ) : (
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                  Drop file here or{" "}
                  <span className="text-primary underline">browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PDF, JPEG, PNG, WebP · Max 5 MB
                </p>
              </div>
            )}
          </div>

          {/* Document name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Document Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Class 10 Marksheet 2022"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Document Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
            >
              {CATEGORY_ORDER.map((key) => (
                <option key={key} value={key}>
                  {categories[key] ?? key}
                </option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <span className="material-symbols-outlined text-red-500 shrink-0 mt-0.5 text-[18px]">
                error
              </span>
              <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={uploading}
              className="flex-1 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-black text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">
                    progress_activity
                  </span>
                  Uploading…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    upload
                  </span>
                  Upload
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Document card ─────────────────────────────────────────────────────────────
function DocumentCard({
  doc,
  onDelete,
  deleting,
}: {
  doc: StudentDocument;
  onDelete: (id: number) => void;
  deleting: boolean;
}) {
  const colors = CATEGORY_COLORS[doc.category] ?? CATEGORY_COLORS.other;
  const icon = CATEGORY_ICONS[doc.category] ?? "description";

  return (
    <div
      className={`group relative bg-white dark:bg-slate-800 rounded-2xl border ${colors.border} shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col ${
        deleting ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      {/* Thumbnail / icon area */}
      <div
        className={`relative h-28 ${colors.bg} flex items-center justify-center overflow-hidden`}
      >
        {doc.is_image ? (
          <Image
            src={doc.file_path}
            alt={doc.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 250px"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span
            className={`material-symbols-outlined text-5xl ${colors.text} opacity-60`}
          >
            {doc.file_type === "application/pdf" ? "picture_as_pdf" : icon}
          </span>
        )}

        {/* File type badge */}
        <span
          className={`absolute bottom-2 left-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}
        >
          {doc.file_type === "application/pdf"
            ? "PDF"
            : (doc.file_type?.split("/")[1]?.toUpperCase() ?? "FILE")}
        </span>

        {/* Delete button — visible on hover */}
        <button
          onClick={() => onDelete(doc.id)}
          title="Delete document"
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
        >
          {deleting ? (
            <span className="material-symbols-outlined text-[14px] animate-spin">
              progress_activity
            </span>
          ) : (
            <span className="material-symbols-outlined text-[14px]">
              delete
            </span>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug mb-1 line-clamp-2">
          {doc.name}
        </h4>
        <p className={`text-[11px] font-bold mb-2 ${colors.text}`}>
          {doc.category_label}
        </p>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-700">
          <span className="text-[10px] text-slate-400">
            {doc.uploaded_on ?? "—"}
          </span>
          {doc.file_size_kb && (
            <span className="text-[10px] text-slate-400">
              {doc.file_size_kb}
            </span>
          )}
        </div>
        {/* View / Download */}
        <a
          href={doc.file_path}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-3 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors ${colors.bg} ${colors.text} hover:opacity-80`}
        >
          <span className="material-symbols-outlined text-[14px]">
            {doc.is_image ? "zoom_in" : "open_in_new"}
          </span>
          {doc.is_image ? "View" : "Open"}
        </a>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-pulse">
      <div className="h-28 bg-slate-200 dark:bg-slate-700" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl mt-3" />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main — DocumentsTab
// ══════════════════════════════════════════════════════════════════════════════
export default function DocumentsTab({ user }: Props) {
  const [data, setData] = useState<DocumentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("other");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQ, setSearchQ] = useState("");

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/student/${user.id}/documents`);
      if (!res.ok) throw new Error("Failed to load documents");
      const json: DocumentsData = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function deleteDocument(docId: number) {
    if (!user?.id) return;
    if (!confirm("Delete this document? This cannot be undone.")) return;
    setDeletingId(docId);
    try {
      const res = await fetch(
        `/api/student/${user.id}/documents?docId=${docId}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const d = await res.json();
        alert(d.error ?? "Could not delete document.");
        return;
      }
      // Optimistic update
      setData((prev) => {
        if (!prev) return prev;
        const documents = prev.documents.filter((d) => d.id !== docId);
        const grouped = { ...prev.grouped };
        for (const key of Object.keys(grouped)) {
          grouped[key] = grouped[key].filter((d) => d.id !== docId);
        }
        const countsGrouped = { ...prev.counts.grouped };
        for (const key of Object.keys(countsGrouped)) {
          countsGrouped[key] = grouped[key].length;
        }
        return {
          ...prev,
          documents,
          grouped,
          counts: { total: documents.length, grouped: countsGrouped },
        };
      });
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleUploaded(doc: StudentDocument) {
    setData((prev) => {
      if (!prev) return prev;
      const documents = [doc, ...prev.documents];
      const grouped = { ...prev.grouped };
      if (!grouped[doc.category]) grouped[doc.category] = [];
      grouped[doc.category] = [doc, ...grouped[doc.category]];
      const countsGrouped = { ...prev.counts.grouped };
      countsGrouped[doc.category] = (countsGrouped[doc.category] ?? 0) + 1;
      return {
        ...prev,
        documents,
        grouped,
        counts: { total: documents.length, grouped: countsGrouped },
      };
    });
  }

  // Filter displayed documents
  const allDocs = data?.documents ?? [];
  const filteredDocs = allDocs.filter((doc) => {
    if (activeCategory !== "all" && doc.category !== activeCategory)
      return false;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      return (
        doc.name.toLowerCase().includes(q) ||
        doc.category_label.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories = data?.categories ?? {};
  const counts = data?.counts ?? { total: 0, grouped: {} };

  return (
    <div className="space-y-8 pb-24">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            My Documents
          </h1>
          {!loading && (
            <p className="text-primary font-medium mt-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">folder</span>
              {counts.total > 0
                ? `${counts.total} document${counts.total !== 1 ? "s" : ""} uploaded`
                : "No documents yet — upload your marksheets and certificates"}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-xl">
              search
            </span>
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search documents…"
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium outline-none transition-all"
            />
          </div>

          {/* Upload button */}
          <button
            onClick={() => {
              setUploadCategory(
                activeCategory === "all" ? "other" : activeCategory,
              );
              setShowUpload(true);
            }}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-black text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">
              upload
            </span>
            Upload
          </button>
        </div>
      </div>

      {/* ── Category filter tabs ─────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {/* All tab */}
        <button
          onClick={() => setActiveCategory("all")}
          className={`flex h-10 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-bold transition-all ${
            activeCategory === "all"
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary/40"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">folder</span>
          All
          {!loading && (
            <span
              className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                activeCategory === "all"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-500"
              }`}
            >
              {counts.total}
            </span>
          )}
        </button>

        {CATEGORY_ORDER.map((cat) => {
          const label = categories[cat] ?? cat;
          const count = counts.grouped[cat] ?? 0;
          const icon = CATEGORY_ICONS[cat] ?? "description";
          const colors = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.other;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-bold transition-all ${
                activeCategory === cat
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : `bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${colors.text} hover:border-primary/40`
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {icon}
              </span>
              <span className="hidden sm:inline">{label}</span>
              {!loading && count > 0 && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    activeCategory === cat
                      ? "bg-white/20 text-white"
                      : `${colors.bg} ${colors.text}`
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Category overview cards (when "all" is selected and not searching) */}
      {!loading && !error && activeCategory === "all" && !searchQ && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {CATEGORY_ORDER.map((cat) => {
            const label = categories[cat] ?? cat;
            const count = counts.grouped[cat] ?? 0;
            const icon = CATEGORY_ICONS[cat] ?? "description";
            const colors = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.other;

            return (
              <button
                key={cat}
                onClick={() => {
                  if (count > 0) {
                    setActiveCategory(cat);
                  } else {
                    setUploadCategory(cat);
                    setShowUpload(true);
                  }
                }}
                className={`group relative rounded-2xl p-5 text-left border ${colors.border} ${colors.bg} hover:shadow-md transition-all`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`material-symbols-outlined text-2xl ${colors.text}`}
                  >
                    {icon}
                  </span>
                  {count === 0 && (
                    <span className="material-symbols-outlined text-[14px] text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors">
                      add_circle
                    </span>
                  )}
                  {count > 0 && (
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}
                    >
                      {count}
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-snug">
                  {label}
                </p>
                <p
                  className={`text-[10px] font-semibold mt-1 ${
                    count > 0 ? colors.text : "text-slate-400"
                  }`}
                >
                  {count > 0
                    ? `${count} file${count !== 1 ? "s" : ""}`
                    : "Not uploaded"}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Loading ──────────────────────────────────────────────────────── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {!loading && error && (
        <div className="flex flex-col items-center py-24 gap-4">
          <span className="material-symbols-outlined text-6xl text-red-400">
            error_outline
          </span>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            {error}
          </p>
          <button
            onClick={load}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {!loading && !error && filteredDocs.length === 0 && (
        <div className="text-center py-24">
          <span className="material-symbols-outlined text-7xl text-slate-300 dark:text-slate-600 block mb-4">
            {searchQ ? "search_off" : "upload_file"}
          </span>
          <p className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">
            {searchQ
              ? `No results for "${searchQ}"`
              : activeCategory !== "all"
                ? `No ${categories[activeCategory] ?? activeCategory} uploaded yet`
                : "No documents yet"}
          </p>
          <p className="text-slate-400 text-sm mb-6">
            {searchQ || activeCategory !== "all"
              ? "Try a different search or category."
              : "Upload your marksheets, ID proof, and other documents to complete your profile."}
          </p>
          <button
            onClick={() => {
              setUploadCategory(
                activeCategory !== "all" ? activeCategory : "other",
              );
              setShowUpload(true);
            }}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">
              upload
            </span>
            Upload Your First Document
          </button>
        </div>
      )}

      {/* ── Document grid ─────────────────────────────────────────────────── */}
      {!loading && !error && filteredDocs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredDocs.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onDelete={deleteDocument}
              deleting={deletingId === doc.id}
            />
          ))}
        </div>
      )}

      {/* ── Refresh ───────────────────────────────────────────────────────── */}
      {!loading && !error && (
        <div className="flex justify-center pt-4">
          <button
            onClick={load}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Refresh Documents
          </button>
        </div>
      )}

      {/* ── Upload modal ──────────────────────────────────────────────────── */}
      {showUpload && user?.id && (
        <UploadModal
          categories={categories}
          defaultCategory={uploadCategory}
          studentId={user.id}
          onClose={() => setShowUpload(false)}
          onUploaded={handleUploaded}
        />
      )}
    </div>
  );
}




