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
  file_size_kb: string | null;
  category: string;
  category_label: string;
  is_image: boolean;
  uploaded_on: string | null;
}

interface DocumentsData {
  documents: StudentDocument[];
  categories: Record<string, string>;
  counts: { total: number };
}

// ── Shared Tab Navigation ─────────────────────────────────────────────────────
function ProfileTabs({ active = "academic" }: { active?: string }) {
  const tabs = [
    { id: "profile", label: "Profile", icon: "person" },
    { id: "address", label: "Address", icon: "location_on" },
    { id: "academic", label: "Academic Certificates", icon: "workspace_premium" },
    { id: "projects", label: "Projects", icon: "work" },
    { id: "settings", label: "Account Settings", icon: "settings" },
  ];

  return (
    <div className="flex border-b border-gray-200 mb-10 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`flex items-center gap-2 px-6 py-4 text-[13px] font-semibold uppercase tracking-wider transition-all whitespace-nowrap border-b-2 ${
            active === tab.id 
              ? "border-[#e31e24] text-[#e31e24]" 
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ── Premium Document Card ────────────────────────────────────────────────────
function DocumentCard({ doc, onDelete }: { doc: StudentDocument, onDelete: (id: number) => void }) {
  return (
    <div className="bg-white rounded-[12px] border-2 border-gray-100 p-4 hover:border-[#e31e24]/20 transition-all group relative">
       <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 text-gray-400 group-hover:bg-red-50 group-hover:text-[#e31e24] transition-colors">
             <span className="material-symbols-outlined text-[28px]">
               {doc.is_image ? "image" : "description"}
             </span>
          </div>
          <div className="flex-1 min-w-0 pr-8">
             <h4 className="text-[14px] font-semibold text-[#333] truncate leading-tight mb-1">{doc.name}</h4>
             <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest leading-none mb-2">{doc.category_label}</p>
             <div className="flex items-center gap-3 text-[10px] font-medium text-gray-400">
                <span>{doc.file_size_kb}</span>
                <span className="w-1 h-1 bg-gray-200 rounded-full" />
                <span>{doc.uploaded_on}</span>
             </div>
          </div>
          
          <div className="absolute right-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onDelete(doc.id)}
              className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 hover:bg-red-100 hover:text-[#e31e24] flex items-center justify-center transition-colors shadow-sm"
              title="Delete"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
            <a 
              href={doc.file_path} 
              target="_blank" 
              className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white hover:bg-black flex items-center justify-center shadow-sm"
              title="View"
            >
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            </a>
          </div>
       </div>
    </div>
  );
}

// ── Main DocumentsTab ────────────────────────────────────────────────────────
export default function DocumentsTab({ user }: Props) {
  const [data, setData] = useState<DocumentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form state for upload
  const [file, setFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [category, setCategory] = useState("other");

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/student/${user.id}/documents`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !user?.id) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", docName || file.name);
    fd.append("category", category);
    try {
      await fetch(`/api/student/${user.id}/documents`, { method: "POST", body: fd });
      setShowUpload(false);
      setFile(null);
      setDocName("");
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this document?")) return;
    try {
      await fetch(`/api/student/${user?.id}/documents?docId=${id}`, { method: "DELETE" });
      load();
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) return <div className="space-y-4 animate-pulse pt-10">
    {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-50 rounded-xl" />)}
  </div>;

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-[26px] font-bold text-[#222]">Academic Certificates</h2>
          <p className="text-gray-400 font-semibold uppercase text-[12px] tracking-widest mt-1">Upload and manage your files</p>
        </div>
        {!showUpload && (
          <button 
            onClick={() => setShowUpload(true)}
            className="px-6 py-3 bg-[#e31e24] text-white text-[13px] font-semibold uppercase tracking-wider rounded-lg shadow-lg shadow-red-100 hover:bg-[#c0191e] transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Upload New
          </button>
        )}
      </div>

      <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
        <ProfileTabs active="academic" />
        
        <div className="p-10">
          {showUpload ? (
            <div className="max-w-xl mx-auto py-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center space-y-2">
                 <h3 className="text-[20px] font-bold text-[#333]">Upload Document</h3>
                 <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider">PDF, JPEG, PNG, WEBP · MAX 5MB</p>
              </div>

              <form onSubmit={handleUpload} className="space-y-6">
                <div className="relative pt-2">
                  <label className="absolute left-4 -top-0.5 px-1.5 bg-white text-[11px] font-semibold text-gray-400 uppercase tracking-widest z-10">Document Name</label>
                  <input 
                    type="text" value={docName} onChange={(e) => setDocName(e.target.value)}
                    placeholder="e.g. Class 10th Marksheet"
                    className="w-full bg-white border-2 border-gray-100 rounded-[8px] px-4 py-3.5 text-[14px] font-medium text-[#333] outline-none transition-all focus:border-[#e31e24]/30"
                  />
                </div>

                <div className="relative pt-2">
                  <label className="absolute left-4 -top-0.5 px-1.5 bg-white text-[11px] font-semibold text-gray-400 uppercase tracking-widest z-10">Category</label>
                  <select 
                    value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border-2 border-gray-100 rounded-[8px] px-4 py-3.5 text-[14px] font-medium text-[#333] outline-none transition-all focus:border-[#e31e24]/30 appearance-none"
                  >
                    {Object.entries(data?.categories || {}).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div 
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${file ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-[#e31e24] bg-gray-50"}`}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                   <input 
                     id="file-input" type="file" className="hidden" 
                     onChange={(e) => setFile(e.target.files?.[0] || null)} 
                   />
                   <span className="material-symbols-outlined text-[48px] text-gray-300 mb-2">cloud_upload</span>
                   <p className="text-[14px] font-semibold text-[#333]">{file ? file.name : "Click to browse or drag file here"}</p>
                   {file && <p className="text-[11px] font-semibold text-green-600 uppercase mt-1">File selected</p>}
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" onClick={() => setShowUpload(false)}
                    className="flex-1 py-3 bg-gray-50 text-gray-500 text-[13px] font-semibold uppercase tracking-wider rounded-lg hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" disabled={!file || uploading}
                    className="flex-1 py-3 bg-[#e31e24] text-white text-[13px] font-semibold uppercase tracking-wider rounded-lg shadow-lg shadow-red-100 hover:bg-[#c0191e] transition-all disabled:opacity-50"
                  >
                    {uploading ? "Uploading..." : "Start Upload"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
               {data?.documents && data.documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.documents.map(doc => (
                      <DocumentCard key={doc.id} doc={doc} onDelete={handleDelete} />
                    ))}
                  </div>
               ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-200">
                       <span className="material-symbols-outlined text-[40px]">inventory_2</span>
                    </div>
                    <h3 className="text-[18px] font-bold text-[#333]">No Documents Found</h3>
                    <p className="text-[13px] font-medium text-gray-400 max-w-[280px] mt-1">You haven't uploaded any academic certificates yet.</p>
                    <button 
                      onClick={() => setShowUpload(true)}
                      className="mt-6 px-8 py-3 border-2 border-gray-100 text-[#333] text-[12px] font-semibold uppercase tracking-widest rounded-lg hover:bg-gray-50 transition-all"
                    >
                      Upload Now
                    </button>
                  </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
