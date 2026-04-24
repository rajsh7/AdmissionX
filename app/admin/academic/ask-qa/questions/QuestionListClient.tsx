"use client";

import { useState } from "react";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import QuestionFormModal from "./QuestionFormModal";

interface Question {
  id: number;
  question: string;
  questionDate: string | null;
  status: number | null;
  userId?: number | null;
  slug?: string | null;
}

interface QuestionListClientProps {
  questions: Question[];
  createQuestion: (formData: FormData) => Promise<void>;
  updateQuestion: (formData: FormData) => Promise<void>;
  deleteQuestion: (id: number) => Promise<void>;
}

export default function QuestionListClient({
  questions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
}: QuestionListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

  function handleAdd() {
    setEditingQuestion(null);
    setIsModalOpen(true);
  }

  function handleEdit(q: Question) {
    setEditingQuestion(q);
    setIsModalOpen(true);
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 text-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-orange-600 text-[22px]" style={ICO_FILL}>
              help_center
            </span>
            ASK Questions
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage user questions and their publication status.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-rounded text-[20px]">add</span>
          Add New Question
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Question</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {questions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400 font-semibold">
                    No questions found.
                  </td>
                </tr>
              ) : (
                questions.map((row) => (
                  <tr key={row.id} className="hover:bg-orange-50/20 transition-colors group">
                    <td className="px-5 py-3.5 min-w-[300px]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-rounded text-orange-600 text-[16px]" style={ICO_FILL}>
                            help_center
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 line-clamp-2 max-w-[400px]">
                            {row.question}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            ID: #{row.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {row.slug ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 truncate block max-w-[150px]">
                           /{row.slug}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-300 italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {row.questionDate ? new Date(row.questionDate.trim()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                       <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${row.status ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                          <span className="material-symbols-rounded text-[14px]" style={ICO_FILL}>{row.status ? 'check_circle' : 'pending'}</span>
                          {row.status ? 'Published' : 'Pending'}
                       </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-400">
                      <div className="flex items-center justify-end gap-2 text-slate-800">
                         <button 
                           onClick={() => handleEdit(row)}
                           className="p-1.5 hover:bg-slate-100 rounded-lg hover:text-orange-600 transition-colors"
                          >
                           <span className="material-symbols-rounded text-[18px]">edit</span>
                         </button>
                         <DeleteButton action={deleteQuestion.bind(null, row.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <QuestionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingQuestion ? updateQuestion : createQuestion}
        question={editingQuestion}
      />
    </>
  );
}




