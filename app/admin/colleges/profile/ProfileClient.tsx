"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import PaginationFixed from "@/app/components/PaginationFixed";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileRow {
  id: number | string;
  slug: string;
  name: string;
  email: string | null;
  bannerimage: string | null;
  rating: number;
  ranking: number | null;
  verified: number;
  isTopUniversity: number;
  topUniversityRank: number | null;
  universityType: string | null;
  isShowOnHome: number;
  isShowOnTop: number;
  city_name: string | null;
  state_name: string | null;
  count_courses: number;
  count_faculty: number;
  count_reviews: number;
  count_placements: number;
  count_scholarships: number;
  created_at: string | null;
}

interface ProfileClientProps {
  profiles: ProfileRow[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  q: string;
  filters: {
    verified: string;
    isTopUniversity: string;
    universityType: string;
    showOnHome: string;
    showOnTop: string;
  };
  universityTypeOptions: string[];
  onDelete: (id: string) => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";

function buildImageUrl(raw: string | null): string {
  if (!raw) return "";
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("/")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

function formatDate(val: string | null): string {
  if (!val) return "—";
  try {
    const d = new Date(val);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function StatBadge({
  count,
  label,
  color,
}: {
  count: number;
  label: string;
  color: string;
}) {
  if (count === 0) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${color}`}
    >
      {count} {label}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProfileClient({
  profiles,
  total,
  page,
  totalPages,
  pageSize,
  q,
  filters,
  universityTypeOptions,
  onDelete,
}: ProfileClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showFilters, setShowFilters] = useState(
    !!(q || filters.verified || filters.universityType || filters.showOnHome || filters.showOnTop)
  );
  const [visibleCount, setVisibleCount] = useState(15);

  const listKey = profiles[0]?.id ?? "empty";
  const [lastKey, setLastKey] = useState(listKey);
  if (listKey !== lastKey) {
    setLastKey(listKey);
    setVisibleCount(15);
  }

  // ── Filter state — one entry per form field ─────────────────────────────────
  const [f, setF] = useState({
    collegeName:    q,
    email:          "",
    university:     filters.universityType,
    review:         "",
    agreement:      "",
    verified:       filters.verified,
    addressType:    "",
    showOnHome:     filters.showOnHome,
    showOnTop:      filters.showOnTop,
    lastUpdatedBy:  "",
  });

  const set = (key: string, val: string) => setF((prev) => ({ ...prev, [key]: val }));

  function buildUrl(overrides: Record<string, string | number>) {
    const merged: Record<string, string> = {
      ...(f.collegeName    ? { q: f.collegeName }                        : {}),
      ...(f.verified       ? { verified: f.verified }                    : {}),
      ...(f.university     ? { universityType: f.university }            : {}),
      ...(f.showOnHome     ? { showOnHome: f.showOnHome }                : {}),
      ...(f.showOnTop      ? { showOnTop: f.showOnTop }                  : {}),
      page: String(page),
      ...Object.fromEntries(
        Object.entries(overrides).map(([k, v]) => [k, String(v)]),
      ),
    };
    return `${pathname}?${new URLSearchParams(merged).toString()}`;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (f.collegeName)   params.set("q",              f.collegeName);
    if (f.verified)      params.set("verified",        f.verified);
    if (f.university)    params.set("universityType",  f.university);
    if (f.showOnHome)    params.set("showOnHome",      f.showOnHome);
    if (f.showOnTop)     params.set("showOnTop",       f.showOnTop);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleClear() {
    setF({
      collegeName: "", email: "", university: "", review: "",
      agreement: "", verified: "", addressType: "",
      showOnHome: "", showOnTop: "", lastUpdatedBy: "",
    });
    router.push(pathname);
  }

  const showMore = visibleCount < profiles.length;
  const showPagination = !showMore && totalPages > 1;

  const start = total > 0 ? (page - 1) * 45 + 1 : 0;
  const end = total > 0 ? (page - 1) * 45 + Math.min(visibleCount, profiles.length) : 0;

  const inputCls =
    "w-full h-10 px-3 border border-slate-200 rounded-[5px] bg-white text-slate-700 text-sm " +
    "font-medium placeholder:text-slate-300 focus:outline-none focus:border-[#FF3C3C] " +
    "focus:ring-2 focus:ring-[#FF3C3C]/10 transition-all";

  const selectCls =
    "w-full h-10 px-3 border border-slate-200 rounded-[5px] bg-white text-slate-700 text-sm " +
    "font-medium focus:outline-none focus:border-[#FF3C3C] focus:ring-2 focus:ring-[#FF3C3C]/10 " +
    "transition-all appearance-none cursor-pointer";

  const filterLabel =
    "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1";

  return (
    <div className="space-y-0 mx-[10px]">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
        <div>
          <h1 className="text-lg font-black text-slate-800">
            College Profiles
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Manage and monitor all college/university profiles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#008080]/10 px-4 py-2 rounded-xl">
            <span className="material-symbols-outlined text-[18px] text-[#008080]">account_balance</span>
            <span className="text-sm font-black text-[#008080]">{total.toLocaleString()} Total</span>
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(p => !p)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all ${
              showFilters ? "bg-[#008080] text-white border-[#008080]" : "bg-white text-slate-600 border-slate-200 hover:border-[#008080] hover:text-[#008080]"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">filter_alt</span>
            Filters
            {(q || filters.verified || filters.universityType || filters.showOnHome || filters.showOnTop) && (
              <span className="w-2 h-2 rounded-full bg-red-500 ml-1" />
            )}
          </button>
        </div>
      </div>

      {/* ── Search & Filters ── */}
      {showFilters && (
      <div className="bg-white border-b border-slate-100">
        {/* Section heading */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#FF3C3C]">filter_list</span>
            <h2 className="text-sm font-black text-slate-700">Search College Profile Details</h2>
          </div>
        </div>

        <form onSubmit={handleSearch} className="px-6 py-5">

          {/* Row 1 — College Name + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-5">
            <div>
              <label className={filterLabel}>College Name</label>
              <input
                type="text"
                value={f.collegeName}
                onChange={(e) => set("collegeName", e.target.value)}
                placeholder="Search by college name"
                className={inputCls}
              />
            </div>
            <div>
              <label className={filterLabel}>Email Address</label>
              <input
                type="text"
                value={f.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="Enter email address"
                className={inputCls}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-slate-200 my-5" />

          {/* Row 2 — University + Review + Agreement */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 mb-5">
            <div>
              <label className={filterLabel}>University</label>
              <input
                type="text"
                value={f.university}
                onChange={(e) => set("university", e.target.value)}
                placeholder="Enter university type"
                className={inputCls}
              />
            </div>
            <div>
              <label className={filterLabel}>Review</label>
              <input
                type="text"
                value={f.review}
                onChange={(e) => set("review", e.target.value)}
                placeholder="Enter review text"
                className={inputCls}
              />
            </div>
            <div>
              <label className={filterLabel}>Agreement</label>
              <input
                type="text"
                value={f.agreement}
                onChange={(e) => set("agreement", e.target.value)}
                placeholder="Enter agreement"
                className={inputCls}
              />
            </div>
          </div>

          {/* Row 3 — Verified + Address Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 mb-5">
            <div className="relative">
              <label className={filterLabel}>Verified</label>
              <select
                value={f.verified}
                onChange={(e) => set("verified", e.target.value)}
                className={selectCls}
              >
                <option value="">Select verified</option>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
              <span className="absolute right-3 bottom-2.5 text-slate-400 pointer-events-none material-symbols-outlined text-[16px]">expand_more</span>
            </div>
            <div>
              <label className={filterLabel}>Address Type</label>
              <input
                type="text"
                value={f.addressType}
                onChange={(e) => set("addressType", e.target.value)}
                placeholder="Enter address type"
                className={inputCls}
              />
            </div>
            <div>{/* spacer */}</div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-slate-200 my-5" />

          {/* Row 4 — Show On Home + Show On Top + Last Updated */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 mb-6">
            <div className="relative">
              <label className={filterLabel}>Is Show On Home</label>
              <select
                value={f.showOnHome}
                onChange={(e) => set("showOnHome", e.target.value)}
                className={selectCls}
              >
                <option value="">Select Option</option>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
              <span className="absolute right-3 bottom-2.5 text-slate-400 pointer-events-none material-symbols-outlined text-[16px]">expand_more</span>
            </div>
            <div className="relative">
              <label className={filterLabel}>Is Show On Top</label>
              <select
                value={f.showOnTop}
                onChange={(e) => set("showOnTop", e.target.value)}
                className={selectCls}
              >
                <option value="">Select Option</option>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
              <span className="absolute right-3 bottom-2.5 text-slate-400 pointer-events-none material-symbols-outlined text-[16px]">expand_more</span>
            </div>
            <div>
              <label className={filterLabel}>Last Updated by Admin</label>
              <input
                type="text"
                value={f.lastUpdatedBy}
                onChange={(e) => set("lastUpdatedBy", e.target.value)}
                placeholder="Enter admin name"
                className={inputCls}
              />
            </div>
          </div>

          {/* Action buttons — centred */}
          <div className="flex items-center justify-center gap-6 pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="w-44 h-11 rounded-[5px] font-black text-sm text-white uppercase tracking-wide transition-all active:scale-95"
              style={{ backgroundColor: "#8E97A4" }}
            >
              Clear
            </button>
            <button
              type="submit"
              className="w-44 h-11 rounded-[5px] font-black text-sm text-white uppercase tracking-wide transition-all active:scale-95"
              style={{ backgroundColor: "#FF4242" }}
            >
              Submit
            </button>
          </div>

        </form>
      </div>
      )}

      {/* ── Results Table ── */}
      <div className="bg-white">
        {/* Table header info */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500 font-medium">
            {total > 0 ? (
              <>
                Showing{" "}
                <span className="font-bold text-slate-800">
                  {start}–{end}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-800">
                  {total.toLocaleString()}
                </span>{" "}
                profiles
              </>
            ) : (
              "No profiles found"
            )}
          </p>
        </div>

        {/* Table — no overflow-x-auto, fixed columns that fit */}
        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] text-slate-300">
                account_balance
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-700">
              No colleges found
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse table-fixed">
            <colgroup>
              <col style={{ width: "4%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "17%" }} />
            </colgroup>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider text-center">
                  S.No
                </th>
                <th className="px-4 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  College
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Status & Flags
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profiles.slice(0, visibleCount).map((p, index) => (
                <tr
                  key={p.slug}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  {/* ── S.No ── */}
                  <td className="px-3 py-2.5 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[11px] font-black text-slate-500">
                      {(page - 1) * 45 + index + 1}
                    </span>
                  </td>

                  {/* ── College ── */}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      {/* Thumbnail */}
                      <div className="w-11 h-8 rounded-[5px] overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                        {p.bannerimage ? (
                          <img
                            src={buildImageUrl(p.bannerimage)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#FF3C3C]/10 text-[#FF3C3C] font-black text-sm">
                            {(p.name || p.slug).charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="text-sm font-bold text-slate-800 truncate leading-tight"
                          title={p.name}
                        >
                          {p.name || p.slug}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                          {p.slug}
                        </p>
                        {p.email && (
                          <p className="text-[10px] text-slate-400 truncate">
                            {p.email}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-300">
                          {formatDate(p.created_at)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* ── Location ── */}
                  <td className="px-3 py-2.5">
                    {p.city_name || p.state_name ? (
                      <div className="space-y-0.5">
                        {p.city_name && (
                          <p className="text-sm font-semibold text-slate-700 truncate">
                            {p.city_name}
                          </p>
                        )}
                        {p.state_name && (
                          <p className="text-xs text-slate-400 truncate">
                            {p.state_name}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-300 text-sm">—</span>
                    )}
                  </td>

                  {/* ── Type ── */}
                  <td className="px-3 py-2.5">
                    {p.universityType ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold truncate max-w-full">
                        {p.universityType}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-sm">—</span>
                    )}
                    {p.ranking && (
                      <p className="text-[11px] text-slate-400 mt-1 font-medium">
                        Rank #{p.ranking}
                      </p>
                    )}
                  </td>

                  {/* ── Status & Flags ── */}
                  <td className="px-3 py-2.5">
                    <div className="grid grid-cols-2 gap-1">
                      {/* Row 1 */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        p.verified ? "bg-[#FF3C3C]/10 text-[#FF3C3C]" : "bg-slate-100 text-slate-500"
                      }`}>
                        <span className="material-symbols-outlined text-[12px]">{p.verified ? "verified" : "pending"}</span>
                        {p.verified ? "Verified" : "Unverified"}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        p.isTopUniversity === 1 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-400"
                      }`}>
                        <span className="material-symbols-outlined text-[12px]">workspace_premium</span>
                        Top Univ
                      </span>

                      {/* Row 2 */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        p.isShowOnHome === 1 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"
                      }`}>
                        <span className="material-symbols-outlined text-[12px]">home</span>
                        Home
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        p.isShowOnTop === 1 ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-400"
                      }`}>
                        <span className="material-symbols-outlined text-[12px]">trending_up</span>
                        Top
                      </span>

                      {/* Row 3 — Placements (only if exists) */}
                      {p.count_placements > 0 && (
                        <span className="col-span-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FF3C3C]/10 text-[#FF3C3C]">
                          <span className="material-symbols-outlined text-[12px]">monitoring</span>
                          {p.count_placements} Placements
                        </span>
                      )}
                    </div>
                  </td>

                  {/* ── Content Counts ── */}
                  <td className="px-3 py-2.5">
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        <StatBadge count={p.count_courses} label="Courses" color="bg-[#FF3C3C]/10 text-[#FF3C3C]" />
                        <StatBadge count={p.count_faculty} label="Faculty" color="bg-blue-50 text-blue-600" />
                      </div>
                      <StatBadge count={p.count_reviews} label="Reviews" color="bg-amber-50 text-amber-600" />
                      {p.count_courses === 0 && p.count_faculty === 0 && p.count_reviews === 0 && (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </div>
                  </td>

                  {/* ── Actions ── */}
                  <td className="px-3 py-2.5">
                    <div className="flex flex-row items-center justify-end gap-1.5">
                      {/* Edit → full edit page */}
                      <Link
                        href={`/admin/colleges/profile/${p.slug}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-[5px] border border-slate-200 bg-white text-slate-700 text-[11px] font-bold hover:bg-slate-100 transition-colors shadow-sm"
                        title="Edit all college details"
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          edit
                        </span>
                        Edit
                      </Link>

                      {/* View public page */}
                      <Link
                        href={`/college/${p.slug}`}
                        target="_blank"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-[5px] border border-slate-200 text-slate-500 text-[11px] font-bold hover:border-[#FF3C3C] hover:text-[#FF3C3C] transition-colors"
                        title="View college page"
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          open_in_new
                        </span>
                        View
                      </Link>

                      {/* Delete */}
                      <DeleteButton
                        action={async () => {
                          await onDelete(p.slug);
                        }}
                        label="Delete"
                        size="xs"
                        icon={
                          <span className="material-symbols-outlined text-[13px]">
                            delete
                          </span>
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ── Show More ── */}
        {showMore && (
          <div className="mt-10 mb-8 flex flex-col items-center gap-2">
            <button
              onClick={() => setVisibleCount((c) => Math.min(c + 15, profiles.length))}
              className="group flex flex-col items-center gap-1 text-neutral-400 hover:text-[#FF3C3C] transition-colors"
              type="button"
            >
              <span className="text-xs font-bold uppercase tracking-widest">
                Show More
              </span>
              <span className="material-symbols-outlined text-[36px] group-hover:text-[#FF3C3C] animate-bounce">
                keyboard_arrow_down
              </span>
            </button>
          </div>
        )}

        {/* ── Pagination ── */}
        {showPagination && (
          <div className="px-6 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 mt-6 mb-6">
            <p className="text-sm text-slate-400 font-medium">
              Showing <strong>{start}</strong>-<strong>{end}</strong> of <strong>{total.toLocaleString()}</strong> profiles
            </p>
            <PaginationFixed currentPage={page} totalPages={totalPages} useUrl />
          </div>
        )}
      </div>
    </div>
  );
}
