"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props { college: CollegeUser }

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";

function buildUrl(raw: string | null) {
  if (!raw) return null;
  return raw.startsWith("http") || raw.startsWith("/") ? raw : `${IMAGE_BASE}${raw}`;
}

interface ImageSlot {
  field: "mosaic2" | "mosaic3" | "mosaic4";
  label: string;
  hint: string;
  aspect: string;
}

const ABOUT_SLOTS: ImageSlot[] = [
  { field: "mosaic2", label: "About Image 1 (Large Vertical)", hint: "600×800px recommended", aspect: "aspect-[3/4]" },
  { field: "mosaic3", label: "About Image 2 (Square)",         hint: "600×600px recommended", aspect: "aspect-square" },
  { field: "mosaic4", label: "About Image 3 (Square)",         hint: "600×600px recommended", aspect: "aspect-square" },
];

function ImageUploadCard({
  slot,
  currentUrl,
  slug,
  onUploaded,
}: {
  slot: ImageSlot;
  currentUrl: string | null;
  slug: string;
  onUploaded: (field: string, url: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setError("");
    setSuccess(false);
  }

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) { setError("Please select an image first."); return; }
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("field", slot.field);
      const res = await fetch(`/api/college/dashboard/${slug}/profile`, {
        method: "PATCH",
        body: fd,
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Upload failed");
      onUploaded(slot.field, d.url);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const displayUrl = preview || currentUrl;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Image preview area */}
      <div
        className={`relative ${slot.aspect} bg-slate-100 cursor-pointer group overflow-hidden`}
        onClick={() => fileRef.current?.click()}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={slot.label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300">
            <span className="material-symbols-outlined text-[40px]">add_photo_alternate</span>
            <span className="text-xs font-semibold">Click to select</span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-[32px]">upload</span>
        </div>
        {/* Preview badge */}
        {preview && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
            Preview
          </span>
        )}
        {/* Success badge */}
        {success && !preview && (
          <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">check</span>Saved
          </span>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleSelect}
      />

      {/* Info + actions */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-[13px] font-black text-slate-700">{slot.label}</p>
          <p className="text-[11px] text-slate-400 font-medium">{slot.hint}</p>
        </div>

        {error && (
          <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">error</span>{error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex-1 py-2 border border-slate-200 text-slate-600 text-[12px] font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">photo_library</span>
            {currentUrl ? "Change" : "Select"}
          </button>
          {preview && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 py-2 bg-[#8B3D3D] text-white text-[12px] font-bold rounded-lg hover:bg-[#7a3535] transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {uploading
                ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <span className="material-symbols-outlined text-[14px]">upload</span>
              }
              {uploading ? "Saving..." : "Save"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AboutImagesTab({ college }: Props) {
  const [images, setImages] = useState<Record<string, string | null>>({
    mosaic2: null, mosaic3: null, mosaic4: null,
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/college/dashboard/${college.slug}/profile`);
      const d = await res.json();
      const p = d.profile ?? {};
      setImages({
        mosaic2: buildUrl(p.mosaic2),
        mosaic3: buildUrl(p.mosaic3),
        mosaic4: buildUrl(p.mosaic4),
      });
    } catch {}
    finally { setLoading(false); }
  }, [college.slug]);

  useEffect(() => { load(); }, [load]);

  function handleUploaded(field: string, url: string) {
    setImages(prev => ({ ...prev, [field]: url }));
  }

  return (
    <div className="pb-24 font-poppins bg-[#fcfcfc] min-h-[600px] border border-slate-200 rounded-[10px] overflow-hidden shadow-sm">

      {/* Header */}
      <div className="p-8 border-b border-slate-100">
        <h2 className="text-[22px] font-bold text-[#333]">About Us Section Images</h2>
        <p className="text-slate-400 text-sm mt-1">
          Upload 3 images that appear in the About Us section on your public college page. These sync with the admin panel.
        </p>
      </div>

      {loading ? (
        <div className="p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-xl" />)}
        </div>
      ) : (
        <div className="p-8 space-y-6">

          {/* Layout preview */}
          <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
            <span className="material-symbols-outlined text-[18px] text-blue-500 shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
            <div className="text-[12px] text-blue-700 font-medium">
              <p className="font-bold mb-1">Layout on public page:</p>
              <p><strong>Image 1</strong> appears as a large vertical image on the left.</p>
              <p><strong>Images 2 & 3</strong> appear as smaller square images stacked on the right.</p>
            </div>
          </div>

          {/* Image cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {ABOUT_SLOTS.map(slot => (
              <ImageUploadCard
                key={slot.field}
                slot={slot}
                currentUrl={images[slot.field]}
                slug={college.slug}
                onUploaded={handleUploaded}
              />
            ))}
          </div>

          {/* Sync note */}
          <div className="flex items-start gap-3 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl">
            <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span>
            <p className="text-[12px] text-emerald-700 font-medium">
              These images are stored in the same database as the admin panel. Changes made here are immediately visible in <strong>Admin → Colleges → Profile → [Your College] → About Us Images</strong>, and vice versa.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
