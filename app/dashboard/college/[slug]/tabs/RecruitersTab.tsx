"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";
import Image from "next/image";

interface Props { college: CollegeUser; }

interface Recruiter {
  id: number;
  name: string;
  logo: string;
  website?: string;
  created_at: string;
}

export default function RecruitersTab({ college }: Props) {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [recruiterName, setRecruiterName] = useState("");
  const [recruiterWebsite, setRecruiterWebsite] = useState("");

  const slug = college.slug;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/recruiters`);
      if (!res.ok) throw new Error("Failed to load recruiters.");
      const data = await res.json();
      setRecruiters(data.recruiters ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setSuccess(null);
    setError(null);
  }

  async function handleUpload() {
    if (!selectedFile || !recruiterName.trim()) {
      setError("Please provide recruiter name and logo.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("name", recruiterName.trim());
      fd.append("website", recruiterWebsite.trim());
      const res = await fetch(`/api/college/dashboard/${slug}/recruiters`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      setRecruiters(prev => [data.recruiter, ...prev]);
      setSelectedFile(null);
      setPreview(null);
      setRecruiterName("");
      setRecruiterWebsite("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccess("Recruiter added successfully!");
      setTimeout(() => setSuccess(null), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this recruiter?")) return;
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/recruiters?recruiterId=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Delete failed");
      }
      setRecruiters(prev => prev.filter(r => r.id !== id));
      setSuccess("Recruiter deleted!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    }
  }

  return (
    <div className="pb-24 bg-[#fcfcfc] min-h-[600px] border border-slate-200 rounded-[10px] overflow-hidden shadow-sm">
      <div className="p-6 md:p-8 border-b border-slate-100">
        <h2 className="text-[20px] font-bold text-[#333]">Top Recruiters</h2>
        <p className="text-slate-400 text-sm mt-0.5">
          Upload logos of companies that recruit from your college. These appear on your public placement page.
        </p>
      </div>

      <div className="p-6 md:p-10">
        {/* Feedback */}
        {success && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-sm font-semibold">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>{success}
          </div>
        )}
        {error && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-semibold">
            <span className="material-symbols-outlined text-[18px]">error</span>{error}
          </div>
        )}

        {/* Upload Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 mb-10">
          <h3 className="text-[16px] font-bold text-slate-700 mb-6">Add New Recruiter</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Logo upload */}
            <div className="flex flex-col items-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-[280px] aspect-[4/3] bg-[#f0f0f0] border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#FF3C3C] hover:bg-red-50/30 transition-all group mb-4"
              >
                {preview ? (
                  <div className="relative w-full h-full p-4">
                    <Image src={preview} alt="preview" fill className="object-contain" />
                  </div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[48px] text-slate-300 group-hover:text-[#FF3C3C] transition-colors">add_business</span>
                    <span className="text-[14px] font-bold text-slate-400 mt-2">Add Recruiter Logo</span>
                  </>
                )}
              </div>

              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />

              <div className="w-full max-w-[280px] bg-[#f0f0f0] border border-slate-200 rounded py-2 px-3 text-center text-[13px] text-slate-500 mb-4 truncate">
                {selectedFile ? selectedFile.name : "0 Files Selected"}
              </div>

              <p className="text-[11px] text-slate-400 text-center mb-4">
                PNG or SVG recommended · max 2 MB
              </p>
            </div>

            {/* Right: Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={recruiterName}
                  onChange={e => setRecruiterName(e.target.value)}
                  placeholder="e.g. Google, Microsoft, Amazon"
                  className="w-full border border-slate-200 rounded-[5px] px-4 py-3 text-[14px] text-slate-800 bg-white outline-none focus:border-red-400 transition-all placeholder:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Website <span className="text-slate-400 font-normal normal-case">(optional)</span>
                </label>
                <input
                  type="url"
                  value={recruiterWebsite}
                  onChange={e => setRecruiterWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full border border-slate-200 rounded-[5px] px-4 py-3 text-[14px] text-slate-800 bg-white outline-none focus:border-red-400 transition-all placeholder:text-slate-300"
                />
              </div>

              <button
                onClick={handleUpload}
                disabled={!selectedFile || !recruiterName.trim() || uploading}
                className="w-full bg-[#FF3C3C] hover:bg-[#e63535] disabled:opacity-50 text-white px-10 py-3 rounded-[6px] font-bold text-[15px] transition-all mt-6"
              >
                {uploading ? "Uploading..." : "Add Recruiter"}
              </button>
            </div>
          </div>
        </div>

        {/* Recruiters Grid */}
        {!loading && recruiters.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[16px] font-bold text-slate-600">Current Recruiters ({recruiters.length})</h3>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg">
                <span className="material-symbols-outlined text-[16px] text-blue-500" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                <p className="text-[11px] text-blue-700 font-medium">These appear on your public placement page</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {recruiters.map((rec) => (
                <div key={rec.id} className="group relative bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="aspect-[4/3] relative bg-slate-50 p-4 flex items-center justify-center">
                    <Image src={rec.logo} alt={rec.name} fill className="object-contain p-2" />
                  </div>
                  <div className="p-3 border-t border-slate-100">
                    <p className="text-[12px] font-bold text-slate-800 truncate">{rec.name}</p>
                    {rec.website && (
                      <a href={rec.website} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 hover:underline truncate block">
                        {rec.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </a>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => handleDelete(rec.id)} className="text-white text-xs font-bold bg-red-600/90 px-4 py-2 rounded-full hover:bg-red-600 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-pulse">
            {[1,2,3,4,5].map(i => <div key={i} className="aspect-[4/3] bg-slate-100 rounded-xl" />)}
          </div>
        )}

        {!loading && recruiters.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
            <span className="material-symbols-outlined text-slate-300 text-6xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>business</span>
            <p className="text-slate-400 font-bold text-lg">No recruiters added yet.</p>
            <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
              Add company logos to showcase your placement partners.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
