"use client";

import { useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import PaginationFixed from "@/app/components/PaginationFixed";

interface CollegeRow {
  slug: string;
  name: string;
  bannerimage: string | null;
  logoimage: string | null;
  hasMosaic: boolean;
}

const IMAGE_KEYS = ["banner"] as const;
type ImageKey = (typeof IMAGE_KEYS)[number];

const KEY_LABELS: Record<ImageKey, string> = {
  banner: "Banner",
};

// How many rows visible per "Show More" step — matches other admin pages
const STEP = 15;

interface Props {
  colleges: CollegeRow[];
  total: number;
  page: number;
  totalPages: number;
  q: string;
}

export default function BulkImagesClient({ colleges, total, page, totalPages, q }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);

  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dirtyRows, setDirtyRows] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(STEP);

  const showMore = visibleCount < colleges.length;
  const showPagination = !showMore && totalPages > 1;
  const [search, setSearch] = useState(q);

  // uploaded slugs — to show green tick after upload
  const [uploadedSlugs, setUploadedSlugs] = useState<Set<string>>(new Set());

  function markDirty(slug: string) {
    setDirtyRows((prev) => new Set(prev).add(slug));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    setLoading(true);
    setStatus(null);
    try {
      const fd = new FormData(formRef.current);
      const res = await fetch("/api/admin/colleges/bulk-images", { method: "POST", body: fd });
      const json = await res.json();
      if (json.ok) {
        setStatus(`✅ Done — ${json.updated} college(s) updated out of ${json.total} selected.`);
        // mark uploaded slugs
        setUploadedSlugs((prev) => {
          const next = new Set(prev);
          for (const slug of dirtyRows) next.add(slug);
          return next;
        });
        setDirtyRows(new Set());
        formRef.current.reset();
      } else {
        setStatus(`❌ Error: ${json.error}`);
      }
    } catch (err) {
      setStatus(`❌ Network error: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  function goPage(p: number) {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
    setVisibleCount(STEP);
    setDirtyRows(new Set());
    setStatus(null);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    goPage(1);
  }

  const visible = colleges.slice(0, visibleCount);
  const start = (page - 1) * 50 + 1;
  const end = (page - 1) * 50 + colleges.length;

  return (
    <div className="space-y-0 mx-[10px]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
        <div>
          <h1 className="text-lg font-black text-slate-800">Bulk College Images</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Upload banner images for multiple colleges at once
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#008080]/10 px-4 py-2 rounded-xl">
            <span className="material-symbols-outlined text-[18px] text-[#008080]">photo_library</span>
            <span className="text-sm font-black text-[#008080]">{total.toLocaleString()} Colleges</span>
          </div>
          {dirtyRows.size > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
              <span className="material-symbols-outlined text-[18px] text-amber-600">pending</span>
              <span className="text-sm font-black text-amber-700">{dirtyRows.size} pending</span>
            </div>
          )}
          <button
            type="submit"
            form="bulk-form"
            disabled={loading || dirtyRows.size === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#FF3C3C] text-white text-sm font-black disabled:opacity-40 hover:bg-[#e03030] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              {loading ? "hourglass_top" : "upload"}
            </span>
            {loading ? "Uploading…" : "Upload Selected"}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="px-6 py-3 bg-white border-b border-slate-100 flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search college name or slug…"
          className="flex-1 h-9 px-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-[#FF3C3C] focus:ring-2 focus:ring-[#FF3C3C]/10"
        />
        <button type="submit" className="h-9 px-4 bg-slate-800 text-white text-sm font-bold rounded-lg hover:bg-slate-700 transition-colors">
          Search
        </button>
        {q && (
          <button type="button" onClick={() => { setSearch(""); goPage(1); }} className="h-9 px-3 border border-slate-200 text-slate-500 text-sm font-bold rounded-lg hover:bg-slate-50">
            Clear
          </button>
        )}
        <p className="text-xs text-slate-400 font-medium whitespace-nowrap">
          Showing {start}–{end} of {total.toLocaleString()}
        </p>
      </form>

      {/* Status */}
      {status && (
        <div className={`mx-6 mt-3 px-4 py-3 rounded-xl text-sm font-semibold ${
          status.startsWith("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {status}
        </div>
      )}

      {/* Legend */}
      <div className="px-6 pt-3 pb-1 flex items-center gap-4 text-[11px] font-semibold text-slate-400">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-400 inline-block" /> Image uploaded</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-200 inline-block" /> No image</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Pending upload</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-400 inline-block" /> Just uploaded ✓</span>
      </div>

      {/* Table */}
      <form id="bulk-form" ref={formRef} onSubmit={handleSubmit} className="bg-white mt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider w-8 text-center">#</th>
                <th className="px-4 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider w-[320px]">College</th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider w-16 text-center">Status</th>
                {IMAGE_KEYS.map((k) => (
                  <th key={k} className="px-2 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider text-center">
                    {KEY_LABELS[k]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((c, idx) => {
                const isDirty = dirtyRows.has(c.slug);
                const isUploaded = uploadedSlugs.has(c.slug);
                const hasAnyImage = !!(c.bannerimage || c.logoimage);
                return (
                  <tr
                    key={c.slug}
                    className={`transition-colors ${
                      isUploaded ? "bg-blue-50/40" : isDirty ? "bg-amber-50/40" : "hover:bg-slate-50/60"
                    }`}
                  >
                    <input type="hidden" name={`slug__${c.slug}`} value={c.slug} />

                    {/* S.No */}
                    <td className="px-3 py-2 text-center">
                      <span className="text-[11px] font-black text-slate-400">
                        {(page - 1) * 50 + idx + 1}
                      </span>
                    </td>

                    {/* College */}
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-6 rounded bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                          {c.bannerimage ? (
                            <img src={c.bannerimage} alt="" className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = "none"; }} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-400">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 leading-snug">{c.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono break-all">{c.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Image status */}
                    <td className="px-3 py-2 text-center">
                      {isUploaded ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span>
                          Done
                        </span>
                      ) : hasAnyImage ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-black">
                          <span className="material-symbols-outlined text-[12px]">image</span>
                          Has
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[10px] font-black">
                          <span className="material-symbols-outlined text-[12px]">hide_image</span>
                          None
                        </span>
                      )}
                    </td>

                    {/* File inputs */}
                    {IMAGE_KEYS.map((k) => (
                      <td key={k} className="px-2 py-2 text-center">
                        <FileCell
                          name={`${k}__${c.slug}`}
                          onPick={() => markDirty(c.slug)}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </form>

      {/* Show More */}
      {showMore && (
        <div className="mt-10 mb-8 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => Math.min(c + STEP, colleges.length))}
            className="group flex flex-col items-center gap-1 text-neutral-400 hover:text-[#FF3C3C] transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-widest">Show More</span>
            <span className="material-symbols-outlined text-[36px] group-hover:text-[#FF3C3C] animate-bounce">
              keyboard_arrow_down
            </span>
          </button>
        </div>
      )}

      {/* Pagination — shown after show-more exhausted */}
      {showPagination && (
        <div className="px-6 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 mt-6 mb-6">
          <p className="text-sm text-slate-400 font-medium">
            Showing <strong>{start}</strong>–<strong>{end}</strong> of{" "}
            <strong>{total.toLocaleString()}</strong> colleges
          </p>
          <PaginationFixed currentPage={page} totalPages={totalPages} useUrl />
        </div>
      )}
    </div>
  );
}

function FileCell({ name, onPick }: { name: string; onPick: () => void }) {
  const [preview, setPreview] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onPick();
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  return (
    <label className="relative flex items-center justify-center w-[72px] h-[44px] border border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-[#FF3C3C] hover:bg-[#FF3C3C]/5 transition-all group overflow-hidden mx-auto">
      {preview ? (
        <img src={preview} alt="" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
      ) : (
        <span className="material-symbols-outlined text-[18px] text-slate-300 group-hover:text-[#FF3C3C] transition-colors">
          add_photo_alternate
        </span>
      )}
      <input
        type="file"
        name={name}
        accept="image/*"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={handleChange}
      />
    </label>
  );
}
