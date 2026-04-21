"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props { college: CollegeUser; }

interface Letter {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

export default function LettersTab({ college }: Props) {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const slug = college.slug;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/letters`);
      const d = await res.json();
      setLetters(d.letters ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) { setSelectedFile(file); setError(null); }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    if (!selectedFile) { setError("Please select a file."); return; }
    setUploading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("file", selectedFile);
      const res = await fetch(`/api/college/dashboard/${slug}/letters`, { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Upload failed.");
      setSuccess("Letter uploaded successfully!");
      setTimeout(() => setSuccess(null), 4000);
      setTitle(""); setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setShowForm(false);
      load();
    } catch (e) { setError(e instanceof Error ? e.message : "Upload failed."); }
    finally { setUploading(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this letter?")) return;
    try {
      await fetch(`/api/college/dashboard/${slug}/letters?id=${id}`, { method: "DELETE" });
      setLetters(prev => prev.filter(l => l.id !== id));
      setSuccess("Letter deleted!"); setTimeout(() => setSuccess(null), 3000);
    } catch { setError("Delete failed."); }
  }

  function isPdf(fileType: string) { return fileType === "application/pdf"; }

  function formatDate(dt: string) {
    if (!dt) return "";
    try { return new Date(dt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return ""; }
  }

  return (
    <div className="pb-24 font-poppins bg-[#fcfcfc] min-h-[600px] border border-slate-200 rounded-[10px] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#333]">Affiliation / Accreditation Letters</h2>
          <p className="text-slate-400 text-sm mt-0.5">{college.name} · {letters.length} document{letters.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => { setShowForm(v => !v); setError(null); }}
          className="flex items-center gap-2 bg-[#FF3D3D] text-white px-5 py-2.5 rounded-[8px] font-bold text-[14px] hover:bg-[#e63535] transition-all">
          <span className="material-symbols-outlined text-[18px]">upload_file</span>
          {showForm ? "Cancel" : "Upload Letter"}
        </button>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Feedback */}
        {success && (
          <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-sm font-semibold">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>{success}
          </div>
        )}

        {/* Upload Form */}
        {showForm && (
          <form onSubmit={handleUpload} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 max-w-2xl">
            <h3 className="text-[15px] font-bold text-slate-700">Upload New Letter</h3>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-semibold">
                <span className="material-symbols-outlined text-[16px]">error</span>{error}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. NAAC Accreditation Certificate"
                className="w-full border border-slate-200 rounded-[5px] px-4 py-3 text-[14px] text-slate-800 bg-white outline-none focus:border-red-400 transition-all placeholder:text-slate-300" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">File * (PDF, JPG, PNG — max 5MB)</label>
              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF3C3C] hover:bg-red-50/20 transition-all">
                <span className="material-symbols-outlined text-[36px] text-slate-300 mb-2">upload_file</span>
                <p className="text-[13px] font-semibold text-slate-500">
                  {selectedFile ? selectedFile.name : "Click to select file"}
                </p>
                {selectedFile && <p className="text-[11px] text-slate-400 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>}
              </div>
              <input ref={fileRef} type="file" accept=".pdf,image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
            </div>
            <button type="submit" disabled={uploading}
              className="px-6 py-2.5 bg-[#FF3D3D] text-white rounded-[8px] font-bold text-[14px] hover:bg-[#e63535] transition-all disabled:opacity-50">
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>
        )}

        {/* Letters List */}
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
          </div>
        ) : letters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-[48px] text-slate-200 mb-3">description</span>
            <p className="text-slate-500 font-semibold">No letters uploaded yet</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-sm font-bold text-[#FF3C3C] hover:underline">
              + Upload your first letter
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {letters.map(l => (
              <div key={l.id} className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: isPdf(l.file_type) ? "#FFF0F0" : "#F0F4FF" }}>
                  <span className="material-symbols-outlined text-[22px]"
                    style={{ color: isPdf(l.file_type) ? "#FF3C3C" : "#4A6CF7", fontVariationSettings: "'FILL' 1" }}>
                    {isPdf(l.file_type) ? "picture_as_pdf" : "image"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-slate-800 truncate">{l.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isPdf(l.file_type) ? "PDF Document" : "Image"} · {formatDate(l.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a href={l.file_url} target="_blank" rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View">
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  </a>
                  <button onClick={() => handleDelete(l.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
