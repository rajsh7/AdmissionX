"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { formatDate } from "@/lib/utils";
import ExamFormModal from "./ExamFormModal";

interface ExamRow {
  id: number;
  title: string;
  slug: string | null;
  status: number;
  totalViews: number | null;
  totalLikes: number | null;
  totalApplicationClick: number | null;
  description: string | null;
  applicationFrom: string | null;
  applicationTo: string | null;
  created_at: string;
  [key: string]: any; // Allow other fields for the modal
}

interface ExamListClientProps {
  data: ExamRow[];
  examTypes: { id: number; name: string }[];
  createAction: (formData: FormData) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (id: number) => Promise<void>;
  offset: number;
}

export default function ExamListClient({
  data,
  examTypes,
  createAction,
  updateAction,
  deleteAction,
  offset,
}: ExamListClientProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExamRow | null>(null);

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
  const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  function stripHtml(html: string | null | undefined): string {
    if (!html) return "";
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <span className="material-symbols-rounded text-[20px]" style={ICO}>add</span>
          Add New Exam
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto text-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4 text-left w-12">#</th>
                <th className="px-6 py-4 text-left">Exam Details</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right hidden lg:table-cell">Activity</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((exam, idx) => (
                <tr key={exam.id} className="hover:bg-amber-50/20 transition-colors group">
                  <td className="px-6 py-5 text-xs text-slate-400 font-mono italic">
                    {String(offset + idx + 1).padStart(2, '0')}
                  </td>
                  <td className="px-6 py-5">
                    <div className="max-w-[400px]">
                      <p className="font-bold text-slate-800 text-base leading-tight mb-1 group-hover:text-amber-600 transition-colors">
                        {exam.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-rounded text-[14px]" style={ICO}>calendar_today</span>
                          {formatDate(exam.created_at)}
                        </span>
                        {exam.slug && <span className="text-amber-500 font-mono font-bold">/{exam.slug}</span>}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {stripHtml(exam.description) || "No description provided."}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ring-1 ring-inset ${
                        exam.status === 1
                          ? "bg-green-100 text-green-700 ring-green-600/20"
                          : "bg-slate-100 text-slate-500 ring-slate-600/10"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${exam.status === 1 ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                      {exam.status === 1 ? "Live" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right hidden lg:table-cell">
                     <div className="flex flex-col items-end gap-1 font-mono text-[10px] text-slate-400 font-bold">
                        <span className="flex items-center gap-1.5">
                           {(exam.totalViews ?? 0).toLocaleString()} <span className="material-symbols-rounded text-[14px]" style={ICO}>visibility</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                           {(exam.totalLikes ?? 0).toLocaleString()} <span className="material-symbols-rounded text-[14px]" style={ICO}>favorite</span>
                        </span>
                     </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingItem(exam)}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-amber-100 shadow-sm"
                        title="Edit Exam"
                      >
                        <span className="material-symbols-rounded text-[20px]" style={ICO}>edit</span>
                      </button>
                      <DeleteButton action={deleteAction.bind(null, exam.id)} size="sm" />
                      {exam.slug && (
                        <Link
                          href={`/examination/${exam.slug}`}
                          target="_blank"
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-white rounded-xl transition-all border border-transparent hover:border-blue-100 shadow-sm"
                        >
                          <span className="material-symbols-rounded text-[20px]" style={ICO}>open_in_new</span>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ExamFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={createAction}
        examTypes={examTypes}
      />

      <ExamFormModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSubmit={updateAction}
        initialData={editingItem}
        examTypes={examTypes}
      />
    </div>
  );
}
