"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import FacultyFormModal from "./FacultyFormModal";

import PaginationFixed from "@/app/components/PaginationFixed";

interface CollegeOption { id: number; name: string; }

interface FacultyListClientProps {
  facultyMembers: any[];
  colleges: CollegeOption[];
  total: number;
  page: number;
  totalPages: number;
  offset: number;
  pageSize: number;
  q: string;
  collegeId?: string;
  facultyName?: string;
  email?: string;
  phone?: string;
  collegeName?: string;
  createFaculty: (data: FormData) => Promise<void>;
  updateFaculty: (data: FormData) => Promise<void>;
  deleteFaculty: (id: number) => Promise<void>;
}

const REMOTE_BASE = "https://admin.admissionx.in/uploads/";

function buildAvatarUrl(raw: string | null): string {
  if (!raw) return "";
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("/")) return raw;
  return `${REMOTE_BASE}${raw}`;
}

function FacultyAvatar({ name, imagename }: { name: string; imagename: string | null }) {
  const url = buildAvatarUrl(imagename);
  const initial = (name || "F")[0].toUpperCase();
  const colors = ["#3b82f6","#10b981","#8b5cf6","#f43f5e","#f59e0b","#06b6d4"];
  const color = colors[initial.charCodeAt(0) % colors.length];
  const fbId = `faculty-fb-${(name||"").replace(/\s+/g,"-").slice(0,10)}-${(imagename||"x").slice(-4)}`;

  if (!url) {
    return (
      <div style={{ background: color }} className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
        <span className="text-white font-black text-sm">{initial}</span>
      </div>
    );
  }

  return (
    <div className="relative w-10 h-10 flex-shrink-0">
      <div id={fbId} style={{ background: color, display: "none" }} className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm absolute inset-0">
        <span className="text-white font-black text-sm">{initial}</span>
      </div>
      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
        <img
          src={url}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const fb = document.getElementById(fbId);
            if (fb) fb.style.display = "flex";
          }}
        />
      </div>
    </div>
  );
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default function FacultyListClient({
  facultyMembers, colleges, total, page, totalPages, offset, pageSize, q, collegeId,
  facultyName, email, phone, collegeName,
  createFaculty, updateFaculty, deleteFaculty,
}: FacultyListClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [showFilters, setShowFilters] = useState(!!(q || collegeId || facultyName || email || phone || collegeName));
  const [visibleCount, setVisibleCount] = useState(15);
  const router = useRouter();
  const searchParams = useSearchParams();

  const listKey = facultyMembers[0]?.id ?? "empty";
  const [lastKey, setLastKey] = useState(listKey);
  if (listKey !== lastKey) { setLastKey(listKey); setVisibleCount(15); }

  const showMore = visibleCount < facultyMembers.length;
  const showPagination = !showMore && totalPages > 1;

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams(searchParams.toString());
    
    params.set("page", "1"); // Always reset to page 1 on new search
    
    const fields = ["facultyName", "email", "phone", "collegeName", "q"];
    fields.forEach(field => {
      const val = formData.get(field) as string;
      if (val && val.trim() !== "") {
        params.set(field, val.trim());
      } else {
        params.delete(field);
      }
    });

    router.push(`/admin/colleges/faculty?${params.toString()}`);
  }

  function openAdd() { setEditing(null); setModalOpen(true); }
  function openEdit(f: any) { setEditing(f); setModalOpen(true); }

  return (
    <>
      {/* Header Button */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={openAdd}
          className="bg-[#3F434A] hover:bg-slate-700 text-white font-semibold text-[13px] px-5 py-2.5 rounded-sm transition-colors flex items-center tracking-wide"
        >
          Add new college course +
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(p => !p)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-sm border text-[13px] font-semibold transition-all ${
            showFilters ? "bg-[#008080] text-white border-[#008080]" : "bg-white text-slate-600 border-slate-200 hover:border-[#008080] hover:text-[#008080]"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">filter_alt</span>
          Filters
          {(q || collegeId || facultyName || email || phone || collegeName) && (
            <span className="w-2 h-2 rounded-full bg-red-500 ml-1" />
          )}
        </button>
      </div>

      {/* ── Search Box Match Design ───────────────────── */}
      {showFilters && (
      <div className="bg-white border border-slate-100/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 mb-6">
        <h1 className="text-[22px] font-medium text-slate-500 mb-8 border-b border-slate-100 pb-4">
          Search College Faculty
        </h1>
        
        <form method="GET" action="/admin/colleges/faculty" onSubmit={handleSearch} className="flex flex-col gap-8">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative w-full">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-[13px] font-semibold text-slate-500">
                Faculty Name
              </label>
              <input type="text" name="facultyName" defaultValue={facultyName} placeholder="Dr. John Doe" className="w-full border border-slate-200 rounded-sm px-3 py-2.5 text-sm text-slate-600 bg-transparent focus:outline-none focus:border-red-500" />
            </div>

            <div className="relative w-full">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-[13px] font-semibold text-slate-500">
                Faculty Email
              </label>
              <input type="text" name="email" defaultValue={email} placeholder="john@example.com" className="w-full border border-slate-200 rounded-sm px-3 py-2.5 text-sm text-slate-600 bg-transparent focus:outline-none focus:border-red-500" />
            </div>

            <div className="relative w-full">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-[13px] font-semibold text-slate-500">
                Faculty Phone
              </label>
              <input type="text" name="phone" defaultValue={phone} placeholder="+91..." className="w-full border border-slate-200 rounded-sm px-3 py-2.5 text-sm text-slate-600 bg-transparent focus:outline-none focus:border-red-500" />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative w-full">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-[13px] font-semibold text-slate-500">
                College Name
              </label>
              <input type="text" name="collegeName" defaultValue={collegeName} placeholder="Asian Institute..." className="w-full border border-slate-200 rounded-sm px-3 py-2.5 text-sm text-slate-600 bg-transparent focus:outline-none focus:border-red-500" />
            </div>

            <div className="relative w-full">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-[13px] font-semibold text-slate-500">
                Search Any
              </label>
              <input type="text" name="q" defaultValue={q} placeholder="Search anything..." className="w-full border border-slate-200 rounded-sm px-3 py-2.5 text-sm text-slate-600 bg-transparent focus:outline-none focus:border-red-500" />
            </div>
            
            {/* Empty column to maintain grid structure if needed, or just let it span 2 columns out of 3. We let the grid handle the missing 3rd column naturally */}
          </div>

          {/* Buttons Centered Below Filters */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <Link
              href="/admin/colleges/faculty"
              className="flex items-center justify-center px-10 py-2.5 rounded-[4px] bg-[#9CA3AF] hover:bg-[#8A9ba8] text-white font-semibold text-[15px] transition-colors w-full sm:w-auto min-w-[120px]"
            >
              Clear
            </Link>
            <button
              type="submit"
              className="flex items-center justify-center px-10 py-2.5 rounded-[4px] bg-[#FF3C3C] hover:bg-red-600 text-white font-semibold text-[15px] transition-colors w-full sm:w-auto min-w-[120px]"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
      )}

      {/* Cards List */}
      <div className="flex flex-col gap-6 w-full">
        {facultyMembers.slice(0, visibleCount).map((f, idx) => (
          <div key={f.id} className="bg-[#fafafa] border border-slate-200 rounded-[4px] p-5 flex flex-col xl:flex-row gap-6 w-full">
            
            {/* Left Image */}
            <div 
              className="relative flex-shrink-0 flex items-center justify-center overflow-hidden rounded-[2px]"
              style={{ width: "269px", minWidth: "269px", height: "265px", backgroundColor: "#ffffff" }}
            >
              {/* Default: Saroje Education Group Logo */}
              <img
                src="/seglogo.webp"
                alt="Saroje Education Group"
                className="w-full h-full object-contain p-4 z-0"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
              {f.imagename && (
                <img 
                  src={buildAvatarUrl(f.imagename)} 
                  alt={f.name} 
                  className="absolute inset-0 w-full h-full object-cover z-10 bg-white" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>

            {/* Middle Details Box */}
            <div className="flex-1 flex flex-col justify-between py-1 overflow-hidden min-w-[280px]">
              <div className="flex flex-col gap-3 font-medium" style={{ fontSize: "14px", color: "#64748b" }}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-rounded" style={{ fontSize: "18px", color: "#334155" }}>location_on</span>
                  <p>College Name : <span style={{ color: "#475569" }}>{f.college_name}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-rounded" style={{ fontSize: "18px", color: "#334155" }}>mail</span>
                  <p>Name : <span style={{ color: "#475569" }}>{f.name}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-rounded" style={{ fontSize: "18px", color: "#334155" }}>call</span>
                  <p>Designation : <span style={{ color: "#475569" }}>{f.designation_name || ""}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-rounded" style={{ fontSize: "18px", color: "#334155" }}>location_on</span>
                  <p>Email : <span style={{ color: "#475569" }}>{f.email || ""}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-rounded" style={{ fontSize: "18px", color: "#334155" }}>mail</span>
                  <p>Phone : <span style={{ color: "#475569" }}>{f.phone || ""}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-rounded" style={{ fontSize: "18px", color: "#334155" }}>call</span>
                  <p>Gender : <span style={{ color: "#475569" }}>{f.gender === 1 ? "Male" : f.gender === 2 ? "Female" : ""}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-rounded" style={{ fontSize: "18px", color: "#334155" }}>mail</span>
                  <p>Date of Birth : <span style={{ color: "#475569" }}>{f.dob || ""}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-rounded" style={{ fontSize: "18px", color: "#334155" }}>call</span>
                  <p>Language Known : <span style={{ color: "#475569" }}>{f.languageKnown || ""}</span></p>
                </div>
              </div>
              
              {/* Actions at bottom centerish */}
              <div className="flex items-center justify-center mt-6 gap-3 w-full flex-wrap">
                <button onClick={() => router.push(`/admin/colleges/faculty/${f.id}`)} className="text-white px-7 py-2.5 rounded-[4px] font-semibold transition-colors shadow-sm hover:opacity-90" style={{ backgroundColor: "#9aa0b0", fontSize: "15px" }}>
                  Show
                </button>
                <button onClick={() => openEdit(f)} className="text-white px-8 py-2.5 rounded-[4px] font-semibold transition-colors shadow-sm hover:opacity-90" style={{ backgroundColor: "#0ea5e9", fontSize: "15px" }}>
                  Edit
                </button>
                <button onClick={async () => { if (confirm("Are you sure you want to delete this faculty member?")) await deleteFaculty(f.id); }} className="text-white px-6 py-2.5 rounded-[4px] font-semibold transition-colors flex items-center justify-center gap-1.5 min-w-[100px] shadow-sm hover:opacity-90 cursor-pointer" style={{ backgroundColor: "#fa434d", fontSize: "15px" }}>
                  <span className="material-symbols-rounded" style={{ fontSize: "18px", ...ICO_FILL }}>delete</span>
                  Delete
                </button>
              </div>
            </div>

            {/* Right Buttons Stack */}
            <div className="flex flex-col flex-shrink-0" style={{ width: "280px", gap: "10px" }}>
              <div className="text-white font-medium px-3 text-center rounded-[3px]" style={{ backgroundColor: "#24b29b", fontSize: "13px", padding: "8.5px 0" }}>
                Qualification Details
              </div>
              <div className="text-white font-medium px-3 text-center rounded-[3px]" style={{ backgroundColor: "#fbca40", fontSize: "13px", padding: "8.5px 0" }}>
                Experience Details
              </div>
              <div className="text-white font-medium px-3 text-center rounded-[3px]" style={{ backgroundColor: "#fa4366", fontSize: "13px", padding: "8.5px 0" }}>
                Associate Department Details
              </div>
              <div className="text-white font-medium px-3 text-center rounded-[3px]" style={{ backgroundColor: "#fbca40", fontSize: "13px", padding: "8.5px 0" }}>
                Address Details
              </div>
              <div className="text-white font-medium px-3 text-center rounded-[3px]" style={{ backgroundColor: "#fa4366", fontSize: "13px", padding: "8.5px 0" }}>
                College Public View
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Show More */}
      {showMore && (
        <div className="mt-10 mb-8 flex flex-col items-center gap-2">
          <button onClick={() => setVisibleCount((c) => Math.min(c + 15, facultyMembers.length))} className="group flex flex-col items-center gap-1 text-neutral-400 hover:text-[#FF3C3C] transition-colors" type="button">
            <span className="text-xs font-bold uppercase tracking-widest">Show More</span>
            <span className="material-symbols-outlined text-[36px] group-hover:text-[#FF3C3C] animate-bounce">keyboard_arrow_down</span>
          </button>
        </div>
      )}

      {/* Pagination */}
      {showPagination && (
        <div className="px-6 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 mt-6 mb-6">
          <p className="text-sm text-slate-400 font-medium">
            Showing <strong>{offset + 1}</strong>–<strong>{Math.min(offset + pageSize, total)}</strong> of <strong>{total.toLocaleString()}</strong> faculty members
          </p>
          <PaginationFixed currentPage={page} totalPages={totalPages} useUrl />
        </div>
      )}

      <FacultyFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editing ? updateFaculty : createFaculty}
        faculty={editing}
        colleges={colleges}
      />
    </>
  );
}




