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

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };
const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f43f5e", "#f59e0b", "#06b6d4"];

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

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>apartment</span>
            College Profiles
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage published college profiles, rankings, and verification status.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-80">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search colleges, slugs..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
            />
          </div>
          <button
            onClick={() => { setEditingProfile(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all shrink-0"
          >
            <span className="material-symbols-rounded text-[18px]">add_circle</span>
            Add Profile
          </button>
        </div>
      </div>

      {/* 2-column card grid */}
      {profiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-24 text-center">
          <span className="material-symbols-rounded text-7xl text-slate-200 block mb-4" style={ICO_FILL}>apartment</span>
          <p className="text-slate-500 font-semibold text-sm">No college profiles found.</p>
          {q && (
            <Link href="/admin/colleges/profile" className="text-blue-600 text-xs mt-3 inline-block hover:underline font-bold">
              Clear search
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {profiles.map((p, idx) => {
            const imgUrl = buildImageUrl(p.bannerimage);
            const initial = (p.name || "C")[0].toUpperCase();
            const bgColor = COLORS[initial.charCodeAt(0) % COLORS.length];
            return (
              <div
                key={p.id}
                className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Banner image area */}
                <div className="relative h-44 bg-slate-100 overflow-hidden flex-shrink-0">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fb = e.currentTarget.parentElement?.querySelector(".img-fallback") as HTMLElement;
                        if (fb) fb.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="img-fallback absolute inset-0 items-center justify-center"
                    style={{ background: bgColor, display: imgUrl ? "none" : "flex" }}
                  >
                    <span className="text-white font-black text-6xl opacity-20">{initial}</span>
                  </div>

                  {/* Overlay badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {p.verified ? (
                      <span className="flex items-center gap-0.5 text-[10px] font-black text-blue-600 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow">
                        <span className="material-symbols-rounded text-[11px]" style={ICO_FILL}>verified</span>
                        VERIFIED
                      </span>
                    ) : null}
                    {p.isTopUniversity ? (
                      <span className="flex items-center gap-0.5 text-[10px] font-black text-amber-600 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow">
                        <span className="material-symbols-rounded text-[11px]" style={ICO_FILL}>rewarded_ads</span>
                        TOP
                      </span>
                    ) : null}
                  </div>
                  <div className="absolute top-3 right-3 text-[10px] font-black text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                    #{offset + idx + 1}
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-extrabold text-slate-800 text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors mb-1">
                    {p.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">{p.slug}</p>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                      <span className="material-symbols-rounded text-amber-400 text-[13px]" style={ICO_FILL}>star</span>
                      {parseFloat(String(p.rating)).toFixed(1)}
                    </span>
                    {p.ranking ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-red-600">
                        <span className="material-symbols-rounded text-[13px]" style={ICO_FILL}>workspace_premium</span>
                        Rank #{p.ranking}
                      </span>
                    ) : null}
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {p.universityType || "Private"}
                    </span>
                    {p.city_name ? (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-slate-400">
                        <span className="material-symbols-rounded text-[12px]">location_on</span>
                        {p.city_name}
                      </span>
                    ) : null}
                  </div>

                  {/* Content stats */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {[
                      { label: "Courses", val: p.count_courses, cls: "bg-orange-50 text-orange-600" },
                      { label: "Faculty", val: p.count_faculty, cls: "bg-blue-50 text-blue-600" },
                      { label: "Placements", val: p.count_placements, cls: "bg-emerald-50 text-emerald-600" },
                      { label: "Events", val: p.count_events, cls: "bg-amber-50 text-amber-600" },
                      { label: "Scholarships", val: p.count_scholarships, cls: "bg-purple-50 text-purple-600" },
                      { label: "Reviews", val: p.count_reviews, cls: "bg-pink-50 text-pink-600" },
                    ].map((s) => (
                      <span key={s.label} className={`text-[9px] font-black px-2 py-0.5 rounded-full ${s.val > 0 ? s.cls : "bg-slate-50 text-slate-300"}`}>
                        {s.label}: {s.val}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/college/${p.slug}`}
                      target="_blank"
                      className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl transition-all"
                    >
                      <span className="material-symbols-rounded text-[15px]">visibility</span>
                      View
                    </Link>
                    <button
                      onClick={() => { setEditingProfile(p); setModalOpen(true); }}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-3 py-2 rounded-xl transition-all"
                    >
                      <span className="material-symbols-rounded text-[15px]">edit</span>
                      Edit
                    </button>
                    <DeleteButton action={onDelete.bind(null, p.id)} size="sm" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between px-6 py-4">
          <p className="text-xs text-slate-400 font-medium">
            Showing{" "}
            <span className="text-slate-700 font-bold">{offset + 1}–{Math.min(offset + pageSize, total)}</span>
            {" "}of{" "}
            <span className="text-slate-700 font-bold">{total.toLocaleString()}</span> colleges
          </p>
          <div className="flex items-center gap-1.5">
            {page > 1 ? (
              <Link href={`/admin/colleges/profile?page=${page - 1}${q ? `&q=${q}` : ""}`} className="w-9 h-9 flex items-center justify-center text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                <span className="material-symbols-rounded text-[18px]">chevron_left</span>
              </Link>
            ) : (
              <span className="w-9 h-9 flex items-center justify-center text-slate-300 border border-slate-100 rounded-xl cursor-not-allowed">
                <span className="material-symbols-rounded text-[18px]">chevron_left</span>
              </span>
            )}
            <span className="text-xs font-bold text-slate-700 bg-blue-50 w-9 h-9 flex items-center justify-center rounded-xl border border-blue-100">{page}</span>
            <span className="text-[10px] text-slate-300 font-bold">/</span>
            <span className="text-xs font-bold text-slate-400 w-9 h-9 flex items-center justify-center">{totalPages}</span>
            {page < totalPages ? (
              <Link href={`/admin/colleges/profile?page=${page + 1}${q ? `&q=${q}` : ""}`} className="w-9 h-9 flex items-center justify-center text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                <span className="material-symbols-rounded text-[18px]">chevron_right</span>
              </Link>
            ) : (
              <span className="w-9 h-9 flex items-center justify-center text-slate-300 border border-slate-100 rounded-xl cursor-not-allowed">
                <span className="material-symbols-rounded text-[18px]">chevron_right</span>
              </span>
            )}
          </div>
        </div>
      )}

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
