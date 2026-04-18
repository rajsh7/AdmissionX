"use client";

import { useState } from "react";
import Link from "next/link";
import PaginationFixed from "@/app/components/PaginationFixed";

const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };
const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

const STEP = 25;

interface AppRow {
  id: number;
  applicationRef: string | null;
  student_name: string | null;
  student_email: string | null;
  student_phone: string | null;
  college_name: string | null;
  college_slug: string | null;
  course_name: string | null;
  degree_name: string | null;
  status: string;
  createdAt: string;
}

interface ApplicationsListClientProps {
  initialRows: AppRow[];
  offset: number;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

const STATUS_STYLE: Record<string, { cls: string; dot: string }> = {
  approved:     { cls: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-500" },
  pending:      { cls: "bg-amber-50 text-amber-700 border-amber-100",  dot: "bg-amber-500"   },
  submitted:    { cls: "bg-blue-50 text-blue-700 border-blue-100",    dot: "bg-blue-500"    },
  rejected:     { cls: "bg-red-50 text-red-700 border-red-100",      dot: "bg-red-500"     },
  cancelled:    { cls: "bg-slate-50 text-slate-600 border-slate-100",  dot: "bg-slate-400"   },
  default:      { cls: "bg-slate-50 text-slate-600 border-slate-100",  dot: "bg-slate-400"   },
};

function getStatusStyle(name: string | null) {
  const key = (name ?? "").toLowerCase().trim();
  return STATUS_STYLE[key] ?? STATUS_STYLE.default;
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return "—"; }
}

export default function ApplicationsListClient({ initialRows, offset, page, totalPages, total, pageSize }: ApplicationsListClientProps) {
  const [visibleCount, setVisibleCount] = useState(STEP);

  const listKey = initialRows[0]?.id ?? "empty";
  const [lastKey, setLastKey] = useState(listKey);
  if (listKey !== lastKey) { setLastKey(listKey); setVisibleCount(STEP); }

  const showMore = visibleCount < initialRows.length;
  const showPagination = !showMore && totalPages > 1;
  const visibleRows = initialRows.slice(0, visibleCount);

  return (
    <>
      <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10">#</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">App Ref</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Student</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Institution</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Course</th>
            <th className="px-4 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {visibleRows.map((app, idx) => {
            const style = getStatusStyle(app.status);
            return (
              <tr
                key={app.id}
                className="hover:bg-slate-50/70 transition-colors"
              >
                <td className="px-4 py-4 text-xs text-slate-400 font-mono">
                  {offset + idx + 1}
                </td>

                {/* App Ref */}
                <td className="px-4 py-4">
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                    {app.applicationRef || `#${app.id}`}
                  </span>
                </td>

                {/* Student */}
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <p className="font-semibold text-slate-800 leading-snug">
                      {app.student_name || "Anonymous Student"}
                    </p>
                    <p className="text-xs text-slate-400 truncate leading-snug">
                      {app.student_email || "—"}
                    </p>
                  </div>
                </td>

                {/* College */}
                <td className="px-4 py-4 hidden md:table-cell">
                  {app.college_name ? (
                    <div className="flex flex-col">
                      <p className="text-xs font-semibold text-slate-700 line-clamp-1">
                        {app.college_name}
                      </p>
                      {app.college_slug && (
                        <Link
                          href={`/college/${app.college_slug}`}
                          target="_blank"
                          className="text-[10px] text-teal-600 hover:underline font-bold uppercase tracking-wider mt-0.5"
                        >
                          View Profile
                        </Link>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-300 italic">No Institution</span>
                  )}
                </td>

                {/* Course */}
                <td className="px-4 py-4 hidden lg:table-cell">
                  <div className="flex flex-col">
                    <p className="text-xs font-semibold text-slate-700 line-clamp-1">
                      {app.course_name || "General Admission"}
                    </p>
                    {app.degree_name && (
                      <p className="text-[10px] text-slate-400 mt-0.5">{app.degree_name}</p>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-4 text-center">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${style.cls.split(" border")[0]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    {app.status}
                  </span>
                </td>

                {/* Date */}
                <td className="px-4 py-4 text-right">
                  <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                    {formatDate(app.createdAt)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

      {showMore && (
        <div className="mt-6 mb-4 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => Math.min(c + STEP, initialRows.length))}
            className="group flex flex-col items-center gap-1 text-neutral-400 hover:text-[#FF3C3C] transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-widest">Show More</span>
            <span className="material-symbols-outlined text-[36px] group-hover:text-[#FF3C3C] animate-bounce">keyboard_arrow_down</span>
          </button>
        </div>
      )}

      {showPagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-500 font-semibold">
            Showing <span className="text-slate-900">{offset + 1}–{Math.min(offset + pageSize, total)}</span> of <span className="text-slate-900">{total.toLocaleString()}</span> entries
          </p>
          <PaginationFixed currentPage={page} totalPages={totalPages} useUrl />
        </div>
      )}
    </>
  );
}




