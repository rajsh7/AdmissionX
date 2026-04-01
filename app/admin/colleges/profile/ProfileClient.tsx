"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import ProfileModal from "./ProfileModal";

interface ProfileRow {
  id: string;
  users_id: number;
  slug: string;
  name: string;
  bannerimage: string | null;
  rating: number;
  ranking: number | null;
  verified: number;
  isTopUniversity: number;
  topUniversityRank: number | null;
  universityType: string | null;
  registeredAddressCityId: number | null;
  city_name: string | null;
  count_courses: number;
  count_facilities: number;
  count_faculty: number;
  count_placements: number;
  count_admissions: number;
  count_events: number;
  count_faqs: number;
  count_management: number;
  count_reviews: number;
  count_scholarships: number;
  count_sports: number;
}

interface ProfileClientProps {
  profiles: ProfileRow[];
  total: number;
  page: number;
  totalPages: number;
  offset: number;
  pageSize: number;
  q: string;
  onAdd: (formData: FormData) => Promise<void>;
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const REMOTE_IMAGE_BASE = "https://admin.admissionx.in/uploads/";

function buildImageUrl(raw: string | null): string {
    if (!raw) return "";
    if (raw.startsWith("http")) return raw;
    if (raw.startsWith("/")) return raw;
    return `${REMOTE_IMAGE_BASE}${raw}`;
}

// Shows image if it loads, otherwise reveals an initial-letter fallback tile.
// Stateless: no useState → no hydration mismatch.
function CollegeAvatar({ name, bannerimage }: { name: string; bannerimage: string | null }) {
  const url = buildImageUrl(bannerimage);
  const initial = (name || "C")[0].toUpperCase();
  const colors = ["#3b82f6","#10b981","#8b5cf6","#f43f5e","#f59e0b","#06b6d4"];
  const color = colors[initial.charCodeAt(0) % colors.length];
  const fallbackId = `college-fb-${name.replace(/\s+/g, "-").toLowerCase()}-${(bannerimage || "none").slice(-6)}`;

  if (!url) {
    return (
      <div style={{ background: color }} className="w-12 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
        <span className="text-white font-black text-sm">{initial}</span>
      </div>
    );
  }

  return (
    <div className="relative w-12 h-10 flex-shrink-0">
      {/* Fallback tile — always rendered, hidden when image loads */}
      <div
        id={fallbackId}
        style={{ background: color, display: "none" }}
        className="w-12 h-10 rounded-lg flex items-center justify-center shadow-sm absolute inset-0"
      >
        <span className="text-white font-black text-sm">{initial}</span>
      </div>
      <div className="w-12 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shadow-sm">
        <img
          src={url}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const fb = document.getElementById(fallbackId);
            if (fb) fb.style.display = "flex";
          }}
        />
      </div>
    </div>
  );
}

export default function ProfileClient({
  profiles,
  total,
  page,
  totalPages,
  offset,
  pageSize,
  q,
  onAdd,
  onUpdate,
  onDelete,
}: ProfileClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ProfileRow | null>(null);
  const [searchQuery, setSearchQuery] = useState(q);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchQuery === q) return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }, 400);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [searchQuery, q, pathname, router]);

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
  const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  function handleAdd() {
    setEditingProfile(null);
    setModalOpen(true);
  }

  function handleEdit(p: ProfileRow) {
    setEditingProfile(p);
    setModalOpen(true);
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>apartment</span>
            College Profiles
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage published college profiles, rankings, and verification status.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full sm:w-80">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search colleges, slugs..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
              />
            </div>
          </div>
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/40 transition-all shrink-0"
          >
            <span className="material-symbols-rounded text-[18px]">add_circle</span>
            Add Profile
          </button>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {profiles.length === 0 ? (
          <div className="py-24 text-center">
            <span className="material-symbols-rounded text-7xl text-slate-200 block mb-4" style={ICO_FILL}>apartment</span>
            <p className="text-slate-500 font-semibold text-sm">No college profiles found.</p>
            {q && (
                <Link href="/admin/colleges/profile" className="text-blue-600 text-xs mt-3 inline-block hover:underline font-bold">Clear search result</Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10">#</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">College Name</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status & Rank</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Type & Location</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Content Overview</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {profiles.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <CollegeAvatar name={p.name} bannerimage={p.bannerimage} />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-800 leading-snug truncate max-w-[250px]">{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                           {p.verified ? (
                             <span className="flex items-center gap-0.5 text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded" title="Verified College">
                               <span className="material-symbols-rounded text-[12px]" style={ICO_FILL}>verified</span>
                               VERIFIED
                             </span>
                           ) : (
                             <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">UNVERIFIED</span>
                           )}
                           {p.isTopUniversity ? (
                             <span className="flex items-center gap-0.5 text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded" title="Top University">
                               <span className="material-symbols-rounded text-[12px]" style={ICO_FILL}>rewarded_ads</span>
                               TOP
                             </span>
                           ) : null}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                           <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                             <span className="material-symbols-rounded text-amber-400 text-[14px]" style={ICO_FILL}>star</span>
                             {parseFloat(String(p.rating)).toFixed(1)}
                           </div>
                           {p.ranking ? (
                             <div className="flex items-center gap-1 text-[11px] font-bold text-red-600">
                               <span className="material-symbols-rounded text-[14px]" style={ICO_FILL}>workspace_premium</span>
                               Rank #{p.ranking}
                             </div>
                           ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{p.universityType || "Private"}</span>
                        <div className="flex items-center gap-1 text-slate-400 text-xs">
                           <span className="material-symbols-rounded text-[14px]">location_on</span>
                           <span className="truncate max-w-[150px] uppercase tracking-wider text-[10px] font-bold">{p.city_name || "India"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                        {[
                          { label: "Crs", val: p.count_courses, color: "bg-orange-50 text-orange-600" },
                          { label: "Fac", val: p.count_faculty, color: "bg-blue-50 text-blue-600" },
                          { label: "Plc", val: p.count_placements, color: "bg-emerald-50 text-emerald-600" },
                          { label: "Evt", val: p.count_events, color: "bg-amber-50 text-amber-600" },
                          { label: "Sch", val: p.count_scholarships, color: "bg-purple-50 text-purple-600" },
                        ].map((stat) => (
                          <span key={stat.label} className={`flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded border border-slate-100/50 ${stat.val > 0 ? stat.color : "bg-slate-50 text-slate-300"}`}>
                            {stat.label}: {stat.val}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/college/${p.slug}`}
                          target="_blank"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="View Live Profile"
                        >
                           <span className="material-symbols-rounded text-[20px]">visibility</span>
                        </Link>
                        <button 
                          onClick={() => handleEdit(p)}
                          className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all" 
                          title="Edit Profile"
                        >
                           <span className="material-symbols-rounded text-[20px]">edit</span>
                        </button>
                        <div className="w-px h-4 bg-slate-100 mx-1" />
                        <DeleteButton action={onDelete.bind(null, p.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ───────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
            <p className="text-xs text-slate-400 font-medium">
              Showing <span className="text-slate-700 font-bold">{offset + 1}–{Math.min(offset + pageSize, total)}</span> of <span className="text-slate-700 font-bold">{total.toLocaleString()}</span> colleges
            </p>
            <div className="flex items-center gap-1.5">
              {page > 1 ? (
                <Link href={`/admin/colleges/profile?page=${page - 1}${q ? `&q=${q}` : ''}`} className="w-9 h-9 flex items-center justify-center text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                   <span className="material-symbols-rounded text-[18px]">chevron_left</span>
                </Link>
              ) : (
                <span className="w-9 h-9 flex items-center justify-center text-slate-300 bg-white border border-slate-100 rounded-xl cursor-not-allowed">
                   <span className="material-symbols-rounded text-[18px]">chevron_left</span>
                </span>
              )}
              
              <div className="flex items-center gap-1 mx-1">
                 <span className="text-xs font-bold text-slate-700 bg-blue-50 w-9 h-9 flex items-center justify-center rounded-xl border border-blue-100">{page}</span>
                 <span className="text-[10px] text-slate-300 font-bold">/</span>
                 <span className="text-xs font-bold text-slate-400 w-9 h-9 flex items-center justify-center">{totalPages}</span>
              </div>

              {page < totalPages ? (
                <Link href={`/admin/colleges/profile?page=${page + 1}${q ? `&q=${q}` : ''}`} className="w-9 h-9 flex items-center justify-center text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                   <span className="material-symbols-rounded text-[18px]">chevron_right</span>
                </Link>
              ) : (
                <span className="w-9 h-9 flex items-center justify-center text-slate-300 bg-white border border-slate-100 rounded-xl cursor-not-allowed">
                   <span className="material-symbols-rounded text-[18px]">chevron_right</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <ProfileModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editingProfile ? onUpdate : onAdd}
        initialData={editingProfile}
        title={editingProfile ? "Edit College Profile" : "Add New College Profile"}
      />
    </div>
  );
}




