"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  refLinks?: string;
  created_at: string;
}

interface Props {
  college: CollegeUser;
}

const INPUT =
  "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3D3D]/20 focus:border-[#FF3D3D] font-medium text-slate-700 transition-all";

function FAQForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: FAQ;
  onSave: (data: { question: string; answer: string; refLinks: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [refLinks, setRefLinks] = useState(initial?.refLinks ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    setSaving(true);
    setError("");
    try {
      await onSave({ question: question.trim(), answer: answer.trim(), refLinks: refLinks.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
          Question <span className="text-red-500">*</span>
        </label>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. What is the intake for CSE?"
          required
          className={INPUT}
        />
      </div>
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
          Answer <span className="text-red-500">*</span>
        </label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Provide a detailed answer..."
          required
          rows={4}
          className={INPUT + " resize-none"}
        />
      </div>
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
          Reference Links <span className="text-slate-400 font-normal normal-case">(optional)</span>
        </label>
        <input
          value={refLinks}
          onChange={(e) => setRefLinks(e.target.value)}
          placeholder="https://..."
          className={INPUT}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !question.trim() || !answer.trim()}
          className="flex-1 px-4 py-2.5 bg-[#FF3D3D] text-white text-sm font-bold rounded-xl hover:bg-[#e63535] transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : initial ? "Update FAQ" : "Add FAQ"}
        </button>
      </div>
    </form>
  );
}

function FAQCard({
  faq,
  onEdit,
  onDelete,
}: {
  faq: FAQ;
  onEdit: (faq: FAQ) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this FAQ?")) return;
    setDeleting(true);
    onDelete(faq._id);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start justify-between gap-4 p-5 text-left"
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span
            className="material-symbols-outlined text-[20px] text-[#FF3D3D] shrink-0 mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            help
          </span>
          <p className="font-bold text-slate-800 text-sm leading-snug">{faq.question}</p>
        </div>
        <span
          className={`material-symbols-outlined text-[20px] text-slate-400 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          expand_more
        </span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
          {faq.refLinks && (
            <a
              href={faq.refLinks}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
            >
              <span className="material-symbols-outlined text-[14px]">link</span>
              {faq.refLinks}
            </a>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">
              {faq.created_at
                ? new Date(faq.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : ""}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(faq)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="Edit"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                title="Delete"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FAQsTab({ college }: Props) {
  const slug = college.slug;
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/faqs`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load FAQs");
      setFaqs(data.faqs ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(data: { question: string; answer: string; refLinks: string }) {
    const res = await fetch(`/api/college/dashboard/${slug}/faqs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to add FAQ");
    await load();
    setShowForm(false);
  }

  async function handleEdit(data: { question: string; answer: string; refLinks: string }) {
    if (!editingFaq) return;
    const res = await fetch(`/api/college/dashboard/${slug}/faqs`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingFaq._id, ...data }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to update FAQ");
    await load();
    setEditingFaq(null);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/college/dashboard/${slug}/faqs?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json();
      alert(json.error ?? "Failed to delete");
      return;
    }
    setFaqs((prev) => prev.filter((f) => f._id !== id));
  }

  return (
    <div className="pb-24 font-poppins space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-1.5 h-6 bg-[#FF3D3D] rounded-full" />
            <h2 className="text-[24px] font-black text-slate-800 uppercase tracking-tight">College FAQs</h2>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            Manage frequently asked questions for your institution.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm">
            <span
              className="material-symbols-outlined text-[22px] text-[#FF3D3D]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              quiz
            </span>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total FAQs</p>
              <p className="text-[18px] font-black text-slate-800 leading-none">{faqs.length}</p>
            </div>
          </div>
          {!showForm && !editingFaq && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-3 bg-[#FF3D3D] hover:bg-[#e63535] text-white font-bold rounded-2xl shadow-sm transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                add_circle
              </span>
              Add FAQ
            </button>
          )}
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <FAQForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
      )}

      {/* Edit Form */}
      {editingFaq && (
        <FAQForm
          initial={editingFaq}
          onSave={handleEdit}
          onCancel={() => setEditingFaq(null)}
        />
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-red-700">
          <span className="material-symbols-outlined text-xl">error</span>
          <span className="text-sm font-medium">{error}</span>
          <button onClick={load} className="ml-auto text-xs font-bold underline">
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      ) : faqs.length === 0 && !showForm ? (
        <div className="p-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
          <span
            className="material-symbols-outlined text-slate-300 text-6xl mb-4 block"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            quiz
          </span>
          <p className="text-slate-400 font-bold text-lg">No FAQs added yet.</p>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            Add frequently asked questions to help prospective students.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF3D3D] text-white font-bold rounded-xl text-sm hover:bg-[#e63535] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add First FAQ
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <FAQCard
              key={faq._id}
              faq={faq}
              onEdit={(f) => {
                setEditingFaq(f);
                setShowForm(false);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
