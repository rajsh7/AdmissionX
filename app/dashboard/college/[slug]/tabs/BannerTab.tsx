"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props {
  college: CollegeUser;
}

export default function BannerTab({ college }: Props) {
  const [banner, setBanner] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/college/dashboard/${college.slug}/overview`);
      const d = await res.json();
      setBanner(d.profile?.bannerimage || null);
    } catch {}
  }, [college.slug]);

  useEffect(() => { load(); }, [load]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setSuccess(null);
    setError(null);
  }

  async function handleUpload() {
    if (!selectedFile) { setError("Please select a file first."); return; }
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      const res = await fetch(`/api/college/dashboard/${college.slug}/profile`, {
        method: "PATCH",
        body: fd,
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Upload failed");
      setBanner(d.url);
      setPreview(null);
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setSuccess("Banner uploaded successfully!");
      setTimeout(() => setSuccess(null), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="pb-24 font-poppins bg-[#fcfcfc] min-h-[600px] border border-slate-200 rounded-[10px] overflow-hidden shadow-sm">

      {/* Header */}
      <div className="p-8 border-b border-slate-100">
        <h2 className="text-[22px] font-bold text-[#333]">Upload College Banner</h2>
        <p className="text-slate-400 text-sm mt-1">Upload a high-quality banner image for your college profile. Recommended size: 1200×400px.</p>
      </div>

      <div className="p-8 space-y-8">

        {/* Feedback */}
        {success && (
          <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-sm font-semibold">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-semibold">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        {/* Upload Area */}
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-[#8B3D3D] hover:bg-red-50/30 transition-all"
        >
          <span className="material-symbols-outlined text-[48px] text-slate-300 mb-3">cloud_upload</span>
          <p className="text-[15px] font-semibold text-slate-600">Click to select banner image</p>
          <p className="text-[12px] text-slate-400 mt-1">JPG, PNG, WebP — Max 3MB</p>
          {selectedFile && (
            <p className="mt-3 text-[13px] font-bold text-[#8B3D3D]">{selectedFile.name}</p>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} />

        {/* Preview of selected file */}
        {preview && (
          <div className="space-y-3">
            <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Preview</p>
            <img src={preview} alt="Preview" className="w-full h-[200px] object-cover rounded-xl border border-slate-200" />
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className="bg-[#8B3D3D] text-white px-10 py-3 rounded-[8px] font-black text-[15px] hover:bg-[#7a3535] transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">upload</span>
          {uploading ? "Uploading..." : "Upload Banner"}
        </button>

        {/* Current Banner */}
        {banner && (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Current Banner</p>
            <img
              src={banner.startsWith("http") || banner.startsWith("/") ? banner : `https://admin.admissionx.in/uploads/${banner}`}
              alt="College Banner"
              className="w-full h-[220px] object-cover rounded-xl border border-slate-200 shadow-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}
