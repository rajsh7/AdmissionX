"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props {
  college: CollegeUser;
}

interface Query {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  subject: string;
  message: string;
  status: "pending" | "answered";
  response: string | null;
  responded_at: string | null;
  created_at: string | null;
}

interface Stats { total: number; pending: number; answered: number }
interface Pagination { page: number; limit: number; total: number; totalPages: number }

const FILTER_TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "answered", label: "Answered" },
];

function QueryRow({
  q,
  slug,
  onReplied,
}: {
  q: Query;
  slug: string;
  onReplied: (id: string, response: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/queries`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query_id: q.id, response: reply.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send reply.");
      onReplied(q.id, reply.trim());
      setReply("");
      setExpanded(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border-2 transition-all ${
      q.status === "pending"
        ? "border-amber-100 dark:border-amber-900/40"
        : "border-slate-100 dark:border-slate-700"
    }`}>
      {/* Header row */}
      <div className="flex items-start gap-4 p-5">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0">
          <span className="text-sm font-black text-primary">
            {(q.student_name ?? "?").charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-bold text-slate-800 dark:text-white text-sm">{q.student_name}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{q.student_email}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                q.status === "pending"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
              }`}>
                {q.status}
              </span>
              <span className="text-[10px] text-slate-400">{q.created_at}</span>
            </div>
          </div>

          <p className="mt-2 font-semibold text-slate-700 dark:text-slate-200 text-sm">{q.subject}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{q.message}</p>
        </div>
      </div>

      {/* Existing response */}
      {q.response && (
        <div className="mx-5 mb-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-4">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Your reply · {q.responded_at ?? ""}
          </p>
          <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">{q.response}</p>
        </div>
      )}

      {/* Reply section */}
      {q.status === "pending" && (
        <div className="border-t border-slate-100 dark:border-slate-700 px-5 py-4">
          {!expanded ? (
            <button
              onClick={() => setExpanded(true)}
              className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">reply</span>
              Reply to this query
            </button>
          ) : (
            <form onSubmit={handleReply} className="space-y-3">
              <textarea
                value={reply}
                onChange={e => { setReply(e.target.value); setError(""); }}
                placeholder="Type your reply here..."
                rows={3}
                required
                maxLength={2000}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
              {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>{error}
                </p>
              )}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving || !reply.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl disabled:opacity-50 hover:bg-primary/90 active:scale-95 transition-all"
                >
                  {saving ? (
                    <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending…</>
                  ) : (
                    <><span className="material-symbols-outlined text-[16px]">send</span>Send Reply</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setExpanded(false); setReply(""); setError(""); }}
                  className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default function QueriesTab({ college }: Props) {
  const slug = college.slug;
  const [queries, setQueries] = useState<Query[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, answered: 0 });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const sp = new URLSearchParams({ page: String(page), ...(filterStatus ? { status: filterStatus } : {}) });
      const res = await fetch(`/api/college/dashboard/${slug}/queries?${sp}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load queries.");
      setQueries(data.queries ?? []);
      setStats(data.stats ?? stats);
      setPagination(data.pagination ?? pagination);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, page, filterStatus]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [filterStatus]);

  function handleReplied(id: string, response: string) {
    setQueries(prev => prev.map(q =>
      q.id === id ? { ...q, status: "answered", response, responded_at: "Just now" } : q
    ));
    setStats(prev => ({ ...prev, pending: Math.max(0, prev.pending - 1), answered: prev.answered + 1 }));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Student Queries</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Respond to questions from prospective students</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: stats.total, icon: "forum", cls: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" },
          { label: "Pending", value: stats.pending, icon: "schedule", cls: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300" },
          { label: "Answered", value: stats.answered, icon: "check_circle", cls: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.cls}`}>
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800 dark:text-white leading-none">{s.value}</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {FILTER_TABS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === f.value
                ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            {f.label}
            {f.value === "pending" && stats.pending > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-[9px] font-black">{stats.pending}</span>
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-5 py-4 text-red-700 dark:text-red-400">
          <span className="material-symbols-outlined text-xl">error</span>
          <span className="text-sm font-medium">{error}</span>
          <button onClick={load} className="ml-auto text-xs font-bold underline">Retry</button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-48" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : queries.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center py-20 text-center px-6">
          <span className="material-symbols-outlined text-5xl text-slate-200 dark:text-slate-700 mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span>
          <p className="font-semibold text-slate-500 dark:text-slate-400 text-sm">
            {filterStatus ? `No ${filterStatus} queries.` : "No student queries yet."}
          </p>
          <p className="text-xs text-slate-400 mt-1">Queries from students will appear here once submitted.</p>
          {filterStatus && (
            <button onClick={() => setFilterStatus("")} className="mt-3 text-sm text-primary font-semibold hover:underline">
              Show all queries
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {queries.map(q => (
            <QueryRow key={q.id} q={q} slug={slug} onReplied={handleReplied} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">
            Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
