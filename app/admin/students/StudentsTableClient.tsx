"use client";

import { useState, useEffect } from "react";
import PaginationFixed from "@/app/components/PaginationFixed";

interface StudentRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  is_active: number;
  created_at: string;
}

interface Props {
  students: StudentRow[];
  total: number;
  page: number;
  totalPages: number;
  offset: number;
  PAGE_SIZE: number;
}

const AVATAR_COLORS = [
  "bg-emerald-500","bg-blue-500","bg-violet-500","bg-amber-500",
  "bg-rose-500","bg-cyan-500","bg-indigo-500","bg-teal-500",
];

function getAvatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function formatDate(d: string) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch { return "—"; }
}

function timeAgo(d: string) {
  if (!d) return "";
  try {
    const diff = Date.now() - new Date(d).getTime();
    const days = Math.floor(diff / 86_400_000);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    if (months >= 1) return `${months}mo ago`;
    if (weeks >= 1) return `${weeks}w ago`;
    if (days >= 1) return `${days}d ago`;
    const hours = Math.floor(diff / 3_600_000);
    if (hours >= 1) return `${hours}h ago`;
    return "Just now";
  } catch { return ""; }
}

function obfuscatePhone(phone: string | null | undefined) {
  if (!phone || phone.length < 4) return phone ?? "—";
  return phone.slice(0, -4).replace(/./g, "•") + phone.slice(-4);
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function StudentsTableClient({
  students, total, page, totalPages, offset, PAGE_SIZE,
}: Props) {
  const [visibleCount, setVisibleCount] = useState(25);

  // Reset visible count when the student list changes (e.g. new page or search)
  useEffect(() => {
    setVisibleCount(25);
  }, [students[0]?.id]);

  const visibleStudents = students.slice(0, visibleCount);
  const showPagination = totalPages > 1 && visibleCount >= Math.min(50, students.length);
  const hasMore = visibleCount < students.length && !showPagination;
  const start = total > 0 ? offset + 1 : 0;
  const end = Math.min(offset + PAGE_SIZE, total);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10">#</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Student</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Email</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Phone</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Joined</th>
              <th className="text-right px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-20">ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {visibleStudents.map((student, idx) => (
              <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3.5 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${getAvatarColor(student.id)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate leading-snug">{student.name}</p>
                      <p className="text-xs text-slate-400 truncate leading-snug md:hidden">{student.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 hidden md:table-cell">
                  <span className="text-sm text-slate-600 truncate block max-w-[220px]">{student.email}</span>
                </td>
                <td className="px-4 py-3.5 hidden lg:table-cell">
                  <span className="text-sm font-mono text-slate-500">{obfuscatePhone(student.phone)}</span>
                </td>
                <td className="px-4 py-3.5 hidden sm:table-cell">
                  <div>
                    <p className="text-xs font-semibold text-slate-600">{formatDate(student.created_at)}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(student.created_at)}</p>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                    #{student.id}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show More */}
      {hasMore && (
        <div
          onClick={() => setVisibleCount((c) => Math.min(c + 25, students.length))}
          className="mt-6 flex flex-col items-center gap-1 cursor-pointer select-none group"
        >
          <span className="text-xs font-bold text-neutral-500 group-hover:text-[#FF3C3C] transition-colors uppercase tracking-widest">
            Show More
          </span>
          <span className="material-symbols-outlined text-[36px] text-neutral-400 group-hover:text-[#FF3C3C] transition-colors animate-bounce">
            keyboard_arrow_down
          </span>
        </div>
      )}

      {/* Pagination */}
      {showPagination && (
        <div className="px-6 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 mt-6 mb-6">
          <p className="text-sm text-slate-400 font-medium">
            Showing <strong>{start}</strong>–<strong>{end}</strong> of{" "}
            <strong>{total.toLocaleString()}</strong> students
          </p>
          <PaginationFixed currentPage={page} totalPages={totalPages} useUrl />
        </div>
      )}
    </>
  );
}
