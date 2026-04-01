"use client";

import { useState } from "react";
import AdminModal from "@/app/admin/_components/AdminModal";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import FAQFormModal from "./FAQFormModal";

interface Option { id: number; name: string; }

interface FAQRow {
  id: number;
  collegeprofile_id: number;
  college_name: string;
  question: string;
  answer: string;
}

interface FAQListClientProps {
  faqs: FAQRow[];
  colleges: Option[];
  offset: number;
  onAdd: (formData: FormData) => Promise<void>;
  onEdit: (formData: FormData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function FAQListClient({
  faqs,
  colleges,
  offset,
  onAdd,
  onEdit,
  onDelete,
}: FAQListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQRow | null>(null);

  function openAdd() {
    setEditingFaq(null);
    setIsModalOpen(true);
  }

  function openEdit(faq: FAQRow) {
    setEditingFaq(faq);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingFaq(null);
  }

  return (
    <>
      {/* Add button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all"
        >
          <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>add_circle</span>
          Add FAQ
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {faqs.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>quiz</span>
            <p className="text-slate-500 font-semibold text-sm">No FAQ records found.</p>
            <button
              onClick={openAdd}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span className="material-symbols-rounded text-[18px]" style={ICO_FILL}>add_circle</span>
              Add first FAQ
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10">#</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Question & Answer</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">College Name</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {faqs.map((f, idx) => (
                  <tr key={f.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 leading-snug">{f.question}</span>
                        <span className="text-xs text-slate-400 line-clamp-1 mt-0.5">{f.answer || "No answer provided"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-600 font-medium truncate max-w-[200px] block">{f.college_name}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(f)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <span className="material-symbols-rounded text-[18px]">edit</span>
                        </button>
                        <DeleteButton action={onDelete.bind(null, f.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FAQFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingFaq ? onEdit : onAdd}
        faq={editingFaq}
        colleges={colleges}
      />
    </>
  );
}




