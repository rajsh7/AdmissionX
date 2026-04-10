"use client";

import { useState } from "react";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import AnswerFormModal from "./AnswerFormModal";

interface Answer {
  id: number;
  answer: string;
  answerDate: string | null;
  status: number | null;
  question?: string | null;
  questionId?: number | null;
  userName?: string | null;
  userId?: number | null;
}

interface Question {
  id: number;
  question: string;
}

interface AnswerListClientProps {
  answers: Answer[];
  questions: Question[];
  createAnswer: (formData: FormData) => Promise<void>;
  updateAnswer: (formData: FormData) => Promise<void>;
  deleteAnswer: (id: number) => Promise<void>;
}

export default function AnswerListClient({
  answers,
  questions,
  createAnswer,
  updateAnswer,
  deleteAnswer,
}: AnswerListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState<Answer | null>(null);

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

  function handleAdd() {
    setEditingAnswer(null);
    setIsModalOpen(true);
  }

  function handleEdit(ans: Answer) {
    setEditingAnswer(ans);
    setIsModalOpen(true);
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 text-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-emerald-600 text-[22px]" style={ICO_FILL}>
              chat_bubble
            </span>
            ASK Answers
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage user answers and their related questions.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-rounded text-[20px]">add</span>
          Add New Answer
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Answer / Question</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {answers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400 font-semibold">
                    No answers found.
                  </td>
                </tr>
              ) : (
                answers.map((row) => (
                  <tr key={row.id} className="hover:bg-emerald-50/20 transition-colors group">
                    <td className="px-5 py-3.5 min-w-[350px]">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="material-symbols-rounded text-emerald-600 text-[16px]" style={ICO_FILL}>
                            chat_bubble
                          </span>
                        </div>
                        <div className="min-w-0 space-y-1">
                          <p className="font-semibold text-slate-800 line-clamp-2 max-w-[450px]">
                            {row.answer}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                             <span className="material-symbols-rounded text-[14px]">help_center</span>
                             <span className="truncate max-w-[400px]">Q: {row.question || "Unknown Question"}</span>
                          </div>
                          <p className="text-[10px] text-slate-300 font-mono">
                            ID: #{row.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-slate-600 truncate block max-w-[120px]">
                        {row.userName || "Unknown User"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {row.answerDate ? new Date(row.answerDate).toLocaleDateString() : "—"}
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
                           className="p-1.5 hover:bg-slate-100 rounded-lg hover:text-emerald-600 transition-colors"
                          >
                           <span className="material-symbols-rounded text-[18px]">edit</span>
                         </button>
                         <DeleteButton action={deleteAnswer.bind(null, row.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnswerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingAnswer ? updateAnswer : createAnswer}
        answer={editingAnswer}
        questions={questions}
      />
    </>
  );
}




