"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PaginationFixed from "@/app/components/PaginationFixed";
import { formatDate } from "@/lib/utils";
import ExamFormModal from "../ExamFormModal";
import DeleteButton from "@/app/admin/_components/DeleteButton";

const STEP = 25;

interface ExamRow {
  id: number;
  title: string;
  slug: string | null;
  status: number;
  applicationFrom: string | null;
  applicationTo: string | null;
  created_at: string;
}

interface Props {
  data: ExamRow[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  offset: number;
  examTypes: { id: number; name: string }[];
  createAction: (formData: FormData) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (id: number) => Promise<void>;
}

export default function AieaListClient({
  data,
  total,
  page,
  totalPages,
  pageSize,
  offset,
  examTypes,
  createAction,
  updateAction,
  deleteAction,
}: Props) {
  const [editing, setEditing] = useState<ExamRow | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(STEP);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset visible count when page changes
  const pageKey = `${page}-${data[0]?.id}`;
  const [lastPageKey, setLastPageKey] = useState(pageKey);
  if (pageKey !== lastPageKey) {
    setLastPageKey(pageKey);
    setVisibleCount(STEP);
  }

  const showMore = visibleCount < data.length;
  const showPagination = !showMore && totalPages > 1;

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
  const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  if (!mounted) return <div className="min-h-[400px] bg-white rounded-2xl border border-slate-100 animate-pulse" />;

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-900/10"
        >
          <span className="material-symbols-rounded text-[20px]">add</span>
          Schedule New AIEA Exam
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-12">#</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Exam Title</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Duration / Status</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Slug</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <span className="material-symbols-rounded text-6xl text-slate-200 mb-4 block" style={ICO_FILL}>quiz</span>
                    <p className="text-slate-500 font-semibold text-sm">No AIEA exams found.</p>
                  </td>
                </tr>
              ) : (
                data.slice(0, visibleCount).map((exam, idx) => (
                  <tr key={exam.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono italic">
                      {String(offset + idx + 1).padStart(2, '0')}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 leading-snug">{exam.title}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-slate-400 font-medium">Added {formatDate(exam.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold">
                          {exam.status === 1 ? (
                            <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full ring-1 ring-inset ring-green-600/20 uppercase tracking-tight">Active</span>
                          ) : (
                            <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full ring-1 ring-inset ring-slate-400/20 uppercase tracking-tight">Inactive</span>
                          )}
                        </div>
                        {exam.applicationFrom && (
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {formatDate(exam.applicationFrom)} — {exam.applicationTo ? formatDate(exam.applicationTo) : 'TBA'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded truncate block max-w-[150px]">
                        /{exam.slug || 'no-slug'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 transition-opacity">
                        <button
                          onClick={() => setEditing(exam)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <span className="material-symbols-rounded text-[20px]">edit</span>
                        </button>
                        <DeleteButton action={deleteAction.bind(null, exam.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Show More */}
      {showMore && (
        <div className="py-8 flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => setVisibleCount(v => Math.min(v + STEP, data.length))}
            className="group flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <span className="text-xs font-black uppercase tracking-[0.2em] ml-[0.2em]">
              Show More ({data.length - visibleCount} remaining)
            </span>
            <span className="material-symbols-outlined text-[40px] animate-bounce group-hover:text-blue-600">
              keyboard_arrow_down
            </span>
          </button>
        </div>
      )}

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30 rounded-b-2xl">
          <p className="text-xs text-slate-500 font-medium tracking-tight">
            Showing <span className="text-slate-800 font-bold">{(page - 1) * pageSize + 1}–{Math.min((page - 1) * pageSize + pageSize, total)}</span> of <span className="text-slate-800 font-bold">{total.toLocaleString()}</span> exams
          </p>
          <PaginationFixed currentPage={page} totalPages={totalPages} useUrl />
        </div>
      )}

      {/* Form Modals */}
      <ExamFormModal
        isOpen={isAdding || !!editing}
        onClose={() => {
          setIsAdding(false);
          setEditing(null);
        }}
        onSubmit={async (fd) => {
          if (editing) await updateAction(fd);
          else await createAction(fd);
        }}
        initialData={editing}
        examTypes={examTypes}
      />
    </>
  );
}
