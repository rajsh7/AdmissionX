"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props {
  college: CollegeUser;
}

interface GalleryImage {
  id: number;
  name: string;
  fullimage: string;
  rawPath: string;
  caption: string;
  created_at: string;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 animate-pulse aspect-square" />
  );
}

function UploadModal({
  slug,
  onClose,
  onUploaded,
}: {
  slug: string;
  onClose: () => void;
  onUploaded: (img: GalleryImage) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile]         = useState<File | null>(null);
  const [preview, setPreview]   = useState<string | null>(null);
  const [name, setName]         = useState("");
  const [caption, setCaption]   = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  function handleFile(f: File) {
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(f.type)) {
      setError("Only JPEG, PNG, WebP, and GIF images are allowed.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }
    setError(null);
    setFile(f);
    setName((prev) => prev || f.name.replace(/\.[^.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", name.trim() || file.name);
      fd.append("caption", caption.trim());

      const res  = await fetch(`/api/college/dashboard/${slug}/gallery`, {
        method: "POST",
        body:   fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      onUploaded(data.image as GalleryImage);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[22px] text-violet-600"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                add_photo_alternate
              </span>
            </div>
            <div>
              <h2 className="font-black text-slate-900 dark:text-white text-base">
                Upload Photo
              </h2>
              <p className="text-xs text-slate-400">JPEG, PNG, WebP, GIF · Max 5 MB</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Drop zone */}
          <div
            className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
              dragging
                ? "border-violet-500 bg-violet-50 dark:bg-violet-900/10"
                : preview
                  ? "border-slate-200 dark:border-slate-700"
                  : "border-slate-200 dark:border-slate-700 hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/10"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-56 object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Change Image
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center text-center px-6">
                <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-3">
                  cloud_upload
                </span>
                <p className="font-bold text-slate-600 dark:text-slate-300 text-sm mb-1">
                  Drop image here or click to browse
                </p>
                <p className="text-xs text-slate-400">
                  JPEG, PNG, WebP, GIF · Max 5 MB
                </p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Image Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Campus Library"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
            />
          </div>

          {/* Caption */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Caption <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Short description of the photo"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-red-500 text-[18px] shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}>
                error
              </span>
              <p className="text-xs font-medium text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-violet-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-200 dark:shadow-none hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {uploading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    progress_activity
                  </span>
                  Uploading…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
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

export default function GalleryTab({ college }: Props) {
  const [images, setImages]     = useState<GalleryImage[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [lightbox, setLightbox]     = useState<GalleryImage | null>(null);

  const slug = college.slug;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/college/dashboard/${slug}/gallery`);
      if (!res.ok) throw new Error("Failed to load gallery.");
      const data = await res.json();
      setImages(data.gallery ?? []);
      setTotal(data.total   ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(imageId: number) {
    if (!confirm("Delete this photo? This cannot be undone.")) return;
    setDeletingId(imageId);
    try {
      const res = await fetch(
        `/api/college/dashboard/${slug}/gallery?imageId=${imageId}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed.");
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      setTotal((prev) => Math.max(0, prev - 1));
      if (lightbox?.id === imageId) setLightbox(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleUploaded(img: GalleryImage) {
    setImages((prev) => [img, ...prev]);
    setTotal((prev) => prev + 1);
  }

  return (
    <>
      <div className="space-y-8 pb-24">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Gallery & Media
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {loading
                ? "Loading photos…"
                : total > 0
                  ? `${total} photo${total !== 1 ? "s" : ""} uploaded`
                  : "No photos yet — add campus images to attract students"}
            </p>
          </div>

          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-200 dark:shadow-none hover:bg-violet-700 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
            Upload Photo
          </button>
        </div>

        {/* ── Tip banner (when empty) ─────────────────────────────────────── */}
        {!loading && images.length === 0 && !error && (
          <div className="flex items-start gap-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl px-6 py-5">
            <span
              className="material-symbols-outlined text-[28px] text-violet-500 shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              photo_library
            </span>
            <div>
              <p className="font-bold text-violet-800 dark:text-violet-300 text-sm mb-1">
                Showcase your campus
              </p>
              <p className="text-xs text-violet-600 dark:text-violet-400 leading-relaxed">
                Upload high-quality photos of your campus, library, labs, sports facilities,
                hostels, and events. Colleges with more photos get{" "}
                <strong>3x more student inquiries</strong>.
              </p>
            </div>
          </div>
        )}

        {/* ── Error ──────────────────────────────────────────────────────── */}
        {!loading && error && (
          <div className="flex flex-col items-center py-20 gap-4">
            <span className="material-symbols-outlined text-6xl text-red-300">error_outline</span>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{error}</p>
            <button
              onClick={load}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── Loading skeleton ────────────────────────────────────────────── */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Gallery grid ────────────────────────────────────────────────── */}
        {!loading && !error && images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((img) => {
              const isDeleting = deletingId === img.id;
              return (
                <div
                  key={img.id}
                  className={`group relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-square shadow-sm hover:shadow-xl transition-all ${
                    isDeleting ? "opacity-50 pointer-events-none" : "cursor-pointer"
                  }`}
                >
                  {/* Image */}
                  <img
                    src={img.fullimage}
                    alt={img.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onClick={() => setLightbox(img)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23e2e8f0'/%3E%3C/svg%3E";
                    }}
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  {/* Caption */}
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="text-white text-xs font-medium line-clamp-2 leading-snug">
                        {img.caption}
                      </p>
                    </div>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(img.id); }}
                    title="Delete photo"
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100 shadow-sm z-10"
                  >
                    {isDeleting ? (
                      <span className="material-symbols-outlined text-[14px] animate-spin">
                        progress_activity
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                    )}
                  </button>

                  {/* Fullscreen button */}
                  <button
                    onClick={() => setLightbox(img)}
                    title="View full size"
                    className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-violet-600 hover:bg-white dark:hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100 shadow-sm z-10"
                  >
                    <span className="material-symbols-outlined text-[14px]">zoom_in</span>
                  </button>
                </div>
              );
            })}

            {/* Upload tile */}
            <button
              onClick={() => setShowUpload(true)}
              className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-600 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 flex flex-col items-center justify-center gap-2 transition-all group"
            >
              <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600 group-hover:text-violet-500 transition-colors">
                add
              </span>
              <span className="text-xs font-bold text-slate-400 group-hover:text-violet-500 transition-colors">
                Add Photo
              </span>
            </button>
          </div>
        )}

        {/* ── Refresh ─────────────────────────────────────────────────────── */}
        {!loading && !error && (
          <div className="flex justify-center pt-2">
            <button
              onClick={load}
              className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
              Refresh Gallery
            </button>
          </div>
        )}
      </div>

      {/* ── Upload Modal ───────────────────────────────────────────────────── */}
      {showUpload && (
        <UploadModal
          slug={slug}
          onClose={() => setShowUpload(false)}
          onUploaded={handleUploaded}
        />
      )}

      {/* ── Lightbox ───────────────────────────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-12 right-0 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>

            {/* Image */}
            <img
              src={lightbox.fullimage}
              alt={lightbox.name}
              className="max-w-full max-h-[80vh] mx-auto object-contain rounded-2xl shadow-2xl"
            />

            {/* Info */}
            <div className="mt-4 text-center">
              <p className="text-white font-bold text-sm">{lightbox.name}</p>
              {lightbox.caption && (
                <p className="text-white/60 text-xs mt-1">{lightbox.caption}</p>
              )}
            </div>

            {/* Nav arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => {
                    const idx = images.findIndex((i) => i.id === lightbox.id);
                    const prev = images[(idx - 1 + images.length) % images.length];
                    setLightbox(prev);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[22px]">chevron_left</span>
                </button>
                <button
                  onClick={() => {
                    const idx = images.findIndex((i) => i.id === lightbox.id);
                    const next = images[(idx + 1) % images.length];
                    setLightbox(next);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[22px]">chevron_right</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
