"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props { college: CollegeUser }

interface Answer {
  id: string;
  answer: string;
  userName: string;
  date: string | null;
  status: number;
}

interface Comment {
  id: string;
  comment: string;
  userName: string;
  date: string | null;
}

interface Question {
  id: string;
  numericId: number;
  question: string;
  date: string | null;
  status: number;
  answers: Answer[];
  comments: Comment[];
}

const FILL = { fontVariationSettings: "'FILL' 1" };

function QuestionCard({
  q,
  slug,
  onAnswerAdded,
  onAnswerDeleted,
}: {
  q: Question;
  slug: string;
  onAnswerAdded: (qId: string, answer: Answer) => void;
  onAnswerDeleted: (qId: string, answerId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!answerText.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: q.numericId, answer: answerText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      onAnswerAdded(q.id, {
        id: Date.now().toString(),
        answer: answerText.trim(),
        userName: "You (College)",
        date: "Just now",
        status: 1,
      });
      setAnswerText("");
      setShowAnswerForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAnswer(answerId: string) {
    if (!confirm("Delete this answer?")) return;
    setDeletingId(answerId);
    try {
      await fetch(`/api/college/dashboard/${slug}/qa?answerId=${answerId}`, { method: "DELETE" });
      onAnswerDeleted(q.id, answerId);
    } finally {
      setDeletingId(null);
    }
  }

  const totalActivity = q.answers.length + q.comments.length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Question header */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left p-5 flex items-start gap-4"
      >
        <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-[18px] text-orange-500" style={FILL}>help</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm leading-snug">{q.question}</p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {q.date && (
              <span className="text-[11px] text-slate-400">{q.date}</span>
            )}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              q.status === 1 ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
            }`}>
              {q.status === 1 ? "Active" : "Inactive"}
            </span>
            {q.answers.length > 0 && (
              <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">forum</span>
                {q.answers.length} answer{q.answers.length !== 1 ? "s" : ""}
              </span>
            )}
            {q.comments.length > 0 && (
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">comment</span>
                {q.comments.length} comment{q.comments.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        <span className={`material-symbols-outlined text-[20px] text-slate-400 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}>
          expand_more
        </span>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 divide-y divide-slate-50">

          {/* Answers */}
          <div className="p-5 space-y-3">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Answers ({q.answers.length})
            </p>
            {q.answers.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No answers yet. Be the first to answer!</p>
            ) : (
              q.answers.map(a => (
                <div key={a.id} className="flex gap-3 group">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[14px] text-blue-500" style={FILL}>forum</span>
                  </div>
                  <div className="flex-1 min-w-0 bg-blue-50/50 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-bold text-blue-700">{a.userName}</span>
                      <div className="flex items-center gap-2">
                        {a.date && <span className="text-[10px] text-slate-400">{a.date}</span>}
                        <button
                          onClick={() => handleDeleteAnswer(a.id)}
                          disabled={deletingId === a.id}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all rounded"
                          title="Delete answer"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{a.answer}</p>
                  </div>
                </div>
              ))
            )}

            {/* Add answer */}
            {!showAnswerForm ? (
              <button
                onClick={() => setShowAnswerForm(true)}
                className="flex items-center gap-2 text-sm font-bold text-[#FF3D3D] hover:text-[#e63535] transition-colors mt-1"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Add Answer
              </button>
            ) : (
              <form onSubmit={handleAnswer} className="space-y-2 mt-2">
                <textarea
                  value={answerText}
                  onChange={e => { setAnswerText(e.target.value); setError(""); }}
                  placeholder="Write your answer..."
                  rows={3}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF3D3D]/20 focus:border-[#FF3D3D] resize-none transition-all"
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving || !answerText.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-[#FF3D3D] text-white text-sm font-bold rounded-xl disabled:opacity-50 hover:bg-[#e63535] transition-colors"
                  >
                    {saving ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-[16px]">send</span>
                    )}
                    {saving ? "Posting…" : "Post Answer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAnswerForm(false); setAnswerText(""); setError(""); }}
                    className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Comments */}
          {q.comments.length > 0 && (
            <div className="p-5 space-y-3">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Comments ({q.comments.length})
              </p>
              {q.comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[14px] text-slate-400" style={FILL}>comment</span>
                  </div>
                  <div className="flex-1 min-w-0 bg-slate-50 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-slate-600">{c.userName}</span>
                      {c.date && <span className="text-[10px] text-slate-400">{c.date}</span>}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{c.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function QATab({ college }: Props) {
  const slug = college.slug;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const sp = new URLSearchParams({ page: String(page) });
      if (search) sp.set("q", search);
      const res = await fetch(`/api/college/dashboard/${slug}/qa?${sp}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setQuestions(data.questions ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [slug, page, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search]);

  function handleAnswerAdded(qId: string, answer: Answer) {
    setQuestions(prev => prev.map(q =>
      q.id === qId ? { ...q, answers: [...q.answers, answer] } : q
    ));
  }

  function handleAnswerDeleted(qId: string, answerId: string) {
    setQuestions(prev => prev.map(q =>
      q.id === qId ? { ...q, answers: q.answers.filter(a => a.id !== answerId) } : q
    ));
  }

  const totalAnswers = questions.reduce((s, q) => s + q.answers.length, 0);
  const totalComments = questions.reduce((s, q) => s + q.comments.length, 0);

  return (
    <div className="pb-24 font-poppins space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-1.5 h-6 bg-[#FF3D3D] rounded-full" />
            <h2 className="text-[24px] font-black text-slate-800 uppercase tracking-tight">Q&A / Comments</h2>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            Questions asked about your college — answer and engage with students.
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { label: "Questions", value: total, icon: "help", cls: "text-orange-500 bg-orange-50" },
            { label: "Answers", value: totalAnswers, icon: "forum", cls: "text-blue-500 bg-blue-50" },
            { label: "Comments", value: totalComments, icon: "comment", cls: "text-slate-500 bg-slate-100" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-2.5 shadow-sm">
              <span className={`material-symbols-outlined text-[18px] ${s.cls} p-1.5 rounded-lg`} style={FILL}>{s.icon}</span>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">{s.label}</p>
                <p className="text-[18px] font-black text-slate-800 leading-tight">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <form
        onSubmit={e => { e.preventDefault(); setSearch(searchInput); }}
        className="flex gap-2"
      >
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-slate-400">search</span>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF3D3D]/20 focus:border-[#FF3D3D] transition-all"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-colors"
        >
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(""); setSearchInput(""); }}
            className="px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Clear
          </button>
        )}
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-red-700">
          <span className="material-symbols-outlined text-xl">error</span>
          <span className="text-sm font-medium">{error}</span>
          <button onClick={load} className="ml-auto text-xs font-bold underline">Retry</button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="p-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
          <span className="material-symbols-outlined text-slate-300 text-6xl mb-4 block" style={FILL}>help</span>
          <p className="text-slate-400 font-bold text-lg">
            {search ? `No questions matching "${search}"` : "No questions for your college yet."}
          </p>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            Questions from students will appear here once they ask about your college.
          </p>
          {search && (
            <button
              onClick={() => { setSearch(""); setSearchInput(""); }}
              className="mt-4 text-sm text-[#FF3D3D] font-bold hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map(q => (
            <QuestionCard
              key={q.id}
              q={q}
              slug={slug}
              onAnswerAdded={handleAnswerAdded}
              onAnswerDeleted={handleAnswerDeleted}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">
            Page {page} of {totalPages} · {total} total questions
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
