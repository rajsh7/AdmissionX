"use client";

import { useState } from "react";
import Link from "next/link";
import CourseFormModal from "./CourseFormModal";

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
  offset: number;
  total: number;
  updateCourse: (formData: FormData) => Promise<void>;
  buildUrl: (overrides: Record<string, string | number>) => string;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return "—"; }
}

export default function CourseListClient({ courses, offset, total, updateCourse, buildUrl }: Props) {
  const [editing, setEditing] = useState<CourseRow | null>(null);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-5 py-3 w-10">#</th>
              <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Course Name</th>
              <th className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Image</th>
              <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Degree</th>
              <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Slug</th>
              <th className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Featured</th>
              <th className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">On Home</th>
              <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 hidden xl:table-cell">Added</th>
              <th className="text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {courses.map((course, idx) => (
              <tr key={course.id} className="hover:bg-orange-50/20 transition-colors">
                <td className="px-5 py-4 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {course.image ? (
                        <img
                          src={course.image.startsWith("http") || course.image.startsWith("/") ? course.image : `/uploads/${course.image}`}
                          alt="" className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-rounded text-orange-500 text-[16px]" style={ICO_FILL}>menu_book</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate max-w-[200px] leading-snug">{course.name}</p>
                      {course.degree_name && (
                        <p className="text-[11px] text-slate-400 truncate md:hidden">{course.degree_name}</p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 hidden md:table-cell">
                  <div className="flex justify-center">
                    <div className="w-14 h-10 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden">
                      {course.image ? (
                        <img
                          src={course.image.startsWith("http") || course.image.startsWith("/") ? course.image : `/uploads/${course.image}`}
                          alt="" className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-rounded text-slate-200 text-lg" style={ICO_FILL}>panorama</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 hidden md:table-cell">
                  {course.degree_name ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full max-w-[180px] truncate">
                      {course.degree_name}
                    </span>
                  ) : <span className="text-xs text-slate-300 italic">No degree</span>}
                </td>

                <td className="px-4 py-4 hidden lg:table-cell">
                  {course.pageslug ? (
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded truncate block max-w-[180px]">
                      /{course.pageslug}
                    </span>
                  ) : <span className="text-xs text-slate-300 italic">no slug</span>}
                </td>

                <td className="px-4 py-4 text-center hidden sm:table-cell">
                  {course.isShowOnTop ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                      <span className="material-symbols-rounded text-[12px]" style={ICO_FILL}>star</span>Yes
                    </span>
                  ) : <span className="text-xs text-slate-300">—</span>}
                </td>

                <td className="px-4 py-4 text-center hidden sm:table-cell">
                  {course.isShowOnHome ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      <span className="material-symbols-rounded text-[12px]" style={ICO_FILL}>check_circle</span>Yes
                    </span>
                  ) : <span className="text-xs text-slate-300">—</span>}
                </td>

                <td className="px-4 py-4 hidden xl:table-cell">
                  <span className="text-xs text-slate-400 whitespace-nowrap">{formatDate(course.created_at)}</span>
                </td>

                <td className="px-4 py-4 text-right">
                  <button
                    onClick={() => setEditing(course)}
                    className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:bg-orange-50 px-2.5 py-1.5 rounded-lg transition-colors ml-auto"
                  >
                    <span className="material-symbols-rounded text-[14px]" style={ICO_FILL}>edit</span>
                    Edit
                  </button>
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
    </>
  );
}
