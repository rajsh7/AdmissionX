"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface Bookmark {
  id: string;
  student_id: number;
  student_name: string;
  student_email: string;
  title: string;
  url: string;
  type: string;
  college_id: number;
  course_id: number;
  blog_id: number;
  created_at: string | null;
}

interface Props {
  bookmarks: Bookmark[];
  types: { id: number; name: string }[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  q: string;
  typeFilter: string;
  deleteBookmark: (id: string) => Promise<void>;
}

function formatDate(val: string | null) {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return "—"; }
}

const TYPE_COLORS: Record<string, string> = {
  College: "bg-blue-100 text-blue-700",
  Courses: "bg-purple-100 text-purple-700",
  Course: "bg-purple-100 text-purple-700",
  Blog: "bg-amber-100 text-amber-700",
};

const TYPE_ICONS: Record<string, string> = {
  College: "account_balance",
  Courses: "menu_book",
  Course: "menu_book",
  Blog: "article",
};

export default function BookmarkClient({
  bookmarks, types, total, page, totalPages, pageSize,
  q, typeFilter, deleteBookmark,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams({
      ...(q ? { q } : {}),
      ...(typeFilter ? { type: typeFilter } : {}),
      page: String(page),
      ...overrides,
    });
    return `${pathname}?${params.toString()}`;
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this bookmark?")) return;
    setDeletingId(id);
    await deleteBookmark(id);
    setDeletingId(null);
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white flex-shrink-0">
        <div>
          <h1 className="text-lg font-black text-slate-800">Student Bookmarks</h1>
          <p className="text-xs text-slate-400 mt-0.5">All saved colleges, courses and blogs by students</p>
        </div>
        <div className="flex items-center gap-2 bg-[#008080]/10 px-4 py-2 rounded-xl">
          <span className="material-symbols-outlined text-[18px] text-[#008080]">bookmark</span>
          <span className="text-sm font-black text-[#008080]">{total.toLocaleString()} Total</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const val = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value.trim();
            router.push(buildUrl({ q: val, page: "1" }));
          }}
          className="flex flex-wrap items-center gap-3"
        >
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by title..."
              className="w-full pl-9 pr-4 h-10 border border-slate-200 rounded-xl bg-white text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => router.push(buildUrl({ type: e.target.value, page: "1" }))}
              className="h-10 pl-3 pr-8 border border-slate-200 rounded-xl bg-white text-sm text-slate-700 focus:outline-none focus:border-[#008080] appearance-none cursor-pointer"
            >
              <option value="">All Types</option>
              {types.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">expand_more</span>
          </div>

          <button type="submit" className="h-10 px-5 rounded-xl bg-[#008080] text-white text-sm font-bold hover:bg-[#006666] transition-colors">
            Search
          </button>

          {(q || typeFilter) && (
            <Link href={pathname} className="h-10 px-4 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 flex items-center transition-colors">
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-white">
        <div className="px-6 py-3 border-b border-slate-100">
          <p className="text-sm text-slate-500">
            {total > 0
              ? <>Showing <span className="font-bold text-slate-800">{start}–{end}</span> of <span className="font-bold text-slate-800">{total.toLocaleString()}</span> bookmarks</>
              : "No bookmarks found"}
          </p>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider w-10 text-center">#</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Bookmark Title</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">URL</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Saved On</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookmarks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-[40px] text-slate-200">bookmark_border</span>
                      <p className="text-slate-400 font-medium text-sm">No bookmarks found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                bookmarks.map((b, i) => {
                  const typeColor = TYPE_COLORS[b.type] ?? "bg-slate-100 text-slate-600";
                  const typeIcon = TYPE_ICONS[b.type] ?? "bookmark";
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-4 py-3 text-center">
                        <span className="text-[11px] font-bold text-slate-400">{(page - 1) * pageSize + i + 1}</span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#008080]/10 flex items-center justify-center flex-shrink-0 text-[#008080] font-black text-xs">
                            {b.student_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{b.student_name}</p>
                            <p className="text-[11px] text-slate-400 truncate">{b.student_email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 max-w-[220px]">
                        <p className="text-sm text-slate-700 font-medium truncate" title={b.title}>{b.title || "—"}</p>
                      </td>

                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${typeColor}`}>
                          <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>{typeIcon}</span>
                          {b.type}
                        </span>
                      </td>

                      <td className="px-4 py-3 max-w-[180px]">
                        {b.url ? (
                          <a href={b.url} target="_blank" rel="noopener noreferrer"
                            className="text-[12px] text-[#008080] hover:underline truncate block" title={b.url}>
                            {b.url.replace(/^https?:\/\//, "").slice(0, 40)}…
                          </a>
                        ) : <span className="text-slate-300 text-sm">—</span>}
                      </td>

                      <td className="px-4 py-3 text-[12px] text-slate-500 whitespace-nowrap">
                        {formatDate(b.created_at)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/students/${b.student_id}`}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#008080] text-white text-[11px] font-bold hover:bg-[#006666] transition-colors">
                            <span className="material-symbols-outlined text-[13px]">edit</span>
                            Edit Student
                          </Link>
                          <button
                            onClick={() => handleDelete(b.id)}
                            disabled={deletingId === b.id}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-500 text-[11px] font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[13px]">delete</span>
                            {deletingId === b.id ? "..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-sm text-slate-400">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1.5">
              {page > 1 && (
                <Link href={buildUrl({ page: String(page - 1) })}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-[#008080] hover:text-[#008080] transition-colors bg-white">
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </Link>
              )}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let p: number;
                if (totalPages <= 7) p = i + 1;
                else if (page <= 4) p = i + 1;
                else if (page >= totalPages - 3) p = totalPages - 6 + i;
                else p = page - 3 + i;
                return (
                  <Link key={p} href={buildUrl({ page: String(p) })}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-colors ${
                      p === page ? "bg-[#008080] text-white" : "border border-slate-200 text-slate-500 hover:border-[#008080] hover:text-[#008080] bg-white"
                    }`}>
                    {p}
                  </Link>
                );
              })}
              {page < totalPages && (
                <Link href={buildUrl({ page: String(page + 1) })}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-[#008080] hover:text-[#008080] transition-colors bg-white">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
