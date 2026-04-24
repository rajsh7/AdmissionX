"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CourseFormModal from "./CourseFormModal";
import PaginationFixed from "@/app/components/PaginationFixed";
import { formatDate } from "@/lib/utils";

const STEP = 25;

interface CourseRow {
  id: number;
  name: string;
  pageslug: string | null;
  isShowOnTop: number;
  isShowOnHome: number;
  degree_name: string | null;
  image: string | null;
  created_at: string;
}

interface Props {
  courses: CourseRow[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  offset: number;
  updateCourse: (formData: FormData) => Promise<void>;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };


export default function CourseListClient({
  courses,
  total,
  page,
  totalPages,
  pageSize,
  offset,
  updateCourse,
}: Props) {
  const [editing, setEditing] = useState<CourseRow | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(STEP);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset visible count when page changes
  const pageKey = `${page}-${courses[0]?.id}`;
  const [lastPageKey, setLastPageKey] = useState(pageKey);
  if (pageKey !== lastPageKey) {
    setLastPageKey(pageKey);
    setVisibleCount(STEP);
  }

  const showMore = visibleCount < courses.length;
  const showPagination = !showMore && totalPages > 1;

  if (!mounted) return <div className="min-h-[400px] bg-white rounded-2xl border border-slate-100 animate-pulse" />;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-5 py-3 w-10">#</th>
              <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Course Name</th>
              <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Degree</th>
              <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Slug</th>
              <th className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Featured</th>
              <th className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">On Home</th>
              <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 hidden xl:table-cell">Date</th>
              <th className="text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {courses.slice(0, visibleCount).map((course, idx) => (
              <tr key={course.id} className="hover:bg-orange-50/20 transition-colors group">
                <td className="px-5 py-4 text-xs text-slate-400 font-mono italic">
                   {String(offset + idx + 1).padStart(2, '0')}
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 border border-orange-100">
                       <span className="material-symbols-rounded text-orange-500 text-[18px]" style={ICO_FILL}>menu_book</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate max-w-[200px] leading-snug">{course.name}</p>
                      {course.degree_name && (
                        <p className="text-[11px] text-slate-400 truncate md:hidden">{course.degree_name}</p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 hidden md:table-cell">
                  {course.degree_name ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100 uppercase tracking-tight">
                      {course.degree_name}
                    </span>
                  ) : <span className="text-xs text-slate-300 italic">—</span>}
                </td>

                <td className="px-4 py-4 hidden lg:table-cell">
                  {course.pageslug ? (
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded truncate block max-w-[180px]">
                      /{course.pageslug}
                    </span>
                  ) : <span className="text-xs text-slate-300 italic">—</span>}
                </td>

                <td className="px-4 py-4 text-center hidden sm:table-cell">
                  {course.isShowOnTop ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full uppercase tracking-tighter ring-1 ring-inset ring-amber-600/20">
                      <span className="material-symbols-rounded text-[14px]" style={ICO_FILL}>star</span>Top
                    </span>
                  ) : <span className="text-xs text-slate-300">—</span>}
                </td>

                <td className="px-4 py-4 text-center hidden sm:table-cell">
                  {course.isShowOnHome ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full uppercase tracking-tighter ring-1 ring-inset ring-blue-600/20">
                      <span className="material-symbols-rounded text-[14px]" style={ICO_FILL}>check_circle</span>Home
                    </span>
                  ) : <span className="text-xs text-slate-300">—</span>}
                </td>

                <td className="px-4 py-4 hidden xl:table-cell">
                  <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{formatDate(course.created_at)}</span>
                </td>

                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditing(course)}
                      className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
                    >
                      <span className="material-symbols-rounded text-[20px]">edit</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CourseFormModal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        onSubmit={updateCourse}
        course={editing}
      />

      {/* Show More */}
      {showMore && (
        <div className="py-8 flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => setVisibleCount(v => Math.min(v + STEP, courses.length))}
            className="group flex flex-col items-center gap-1 text-slate-400 hover:text-orange-500 transition-colors"
          >
            <span className="text-xs font-black uppercase tracking-[0.2em] ml-[0.2em]">
              Show More ({courses.length - visibleCount} remaining)
            </span>
            <span className="material-symbols-outlined text-[40px] animate-bounce group-hover:text-orange-500">
              keyboard_arrow_down
            </span>
          </button>
        </div>
      )}

      {/* Pagination after all shown */}
      {showPagination && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30 rounded-b-2xl">
          <p className="text-xs text-slate-500 font-medium tracking-tight">
            Showing <span className="text-slate-800 font-bold">{(page-1)*pageSize + 1}–{Math.min((page-1)*pageSize + pageSize, total)}</span> of <span className="text-slate-800 font-bold">{total.toLocaleString()}</span> courses
          </p>
          <PaginationFixed currentPage={page} totalPages={totalPages} useUrl />
        </div>
      )}
    </>
  );
}
