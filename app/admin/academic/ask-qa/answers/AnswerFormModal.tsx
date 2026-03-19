"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import { useState } from "react";

interface Question {
  id: number;
  question: string;
}

interface AnswerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  answer?: any;
  questions: Question[];
}

export default function AnswerFormModal({
  isOpen,
  onClose,
  onSubmit,
  answer,
  questions,
}: AnswerFormModalProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleAction(formData: FormData) {
    setIsPending(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error("Form submission failed:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={answer ? "Edit Answer" : "Add New Answer"}
    >
      <form action={handleAction} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 text-slate-800">
        {answer && <input type="hidden" name="id" value={answer.id} />}
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Related Question</label>
          <select
            name="questionId"
            defaultValue={answer?.questionId || ""}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm appearance-none"
          >
            <option value="">Select a Question</option>
            {questions.map((q) => (
              <option key={q.id} value={q.id}>
                {q.question.length > 80 ? q.question.substring(0, 80) + "..." : q.question}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Answer Text</label>
          <textarea
            name="answer"
            defaultValue={answer?.answer || ""}
            required
            placeholder="Type the answer here..."
            rows={6}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
          />
        </div>

        <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                <input 
                    type="checkbox" 
                    name="status" 
                    defaultChecked={!!answer?.status} 
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">Published Status</span>
                    <span className="text-[10px] text-slate-400">Make this answer visible to everyone</span>
                </div>
            </label>
        </div>

        <div className="pt-4 flex gap-3 sticky bottom-0 bg-white pb-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 px-4 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Saving..." : answer ? "Update Answer" : "Create Answer"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
