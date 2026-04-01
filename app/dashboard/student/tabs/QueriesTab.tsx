"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  user: { id: string | number; name: string; email: string } | null;
  filter: "replied" | "pending" | "all";
}

interface Query {
  id: number;
  subject: string;
  message: string;
  status: "replied" | "pending";
  reply: string | null;
  created_at: string;
  replied_at: string | null;
  category: string;
}

const CATEGORY_META: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  admission:   { label: "Admission",   icon: "school",          color: "text-blue-600",   bg: "bg-blue-50"   },
  fees:        { label: "Fees",        icon: "payments",        color: "text-green-600",  bg: "bg-green-50"  },
  scholarship: { label: "Scholarship", icon: "workspace_premium",color: "text-purple-600", bg: "bg-purple-50" },
  documents:   { label: "Documents",   icon: "folder",          color: "text-amber-600",  bg: "bg-amber-50"  },
  general:     { label: "General",     icon: "help_outline",    color: "text-slate-600",  bg: "bg-slate-50"  },
};

const EMPTY_FORM = { subject: "", message: "", category: "general" };

export default function QueriesTab({ user, filter }: Props) {
  const [queries,   setQueries]   = useState<Query[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState({ ...EMPTY_FORM });
  const [expanded,  setExpanded]  = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Simulate loading — replace with real API when available
  const load = useCallback(async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    // No real data yet — future API: /api/student/[id]/queries
    setQueries([]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = queries.filter((q) =>
    filter === "all" ? true : q.status === filter
  );

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    const newQuery: Query = {
      id: Date.now(),
      subject: form.subject,
      message: form.message,
      category: form.category,
      status: "pending",
      reply: null,
      created_at: new Date().toISOString(),
      replied_at: null,
    };
    setQueries((prev) => [newQuery, ...prev]);
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
    setSubmitting(false);
  }

  const filterLabel =
    filter === "replied" ? "Replied" : filter === "pending" ? "Pending" : "All";

  const filterIcon =
    filter === "replied" ? "mark_chat_read" : filter === "pending" ? "pending" : "list";

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <div className="h-12 bg-green-50 rounded-2xl animate-pulse w-1/3" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-green-50 shadow-sm animate-pulse space-y-3">
            <div className="h-4 bg-green-50 rounded w-1/2" />
            <div className="h-3 bg-green-50 rounded w-3/4" />
            <div className="h-3 bg-green-50 rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-green-600 text-[22px]">{filterIcon}</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">Queries — {filterLabel}</h1>
            <p className="text-xs text-slate-400 font-medium">
              {filter === "replied"
                ? "Queries that have been answered by our team"
                : filter === "pending"
                ? "Queries awaiting a response"
                : "All your submitted queries"}
            </p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-md shadow-green-200"
          >
            <span className="material-symbols-outlined text-[18px]">add_comment</span>
            New Query
          </button>
        )}
      </div>

      {/* Coming soon notice */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-3.5 flex items-center gap-3">
        <span
          className="material-symbols-outlined text-amber-500 text-[20px] flex-shrink-0"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          construction
        </span>
        <div>
          <p className="text-sm font-bold text-amber-800">Feature Coming Soon</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Query management will be fully integrated with our support team shortly.
            You can submit queries below and they will be saved locally for now.
          </p>
        </div>
        <span className="ml-auto flex-shrink-0 text-[10px] font-black text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
          Coming Soon
        </span>
      </div>

      {/* New Query Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 bg-green-50/40">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-[16px]">add_comment</span>
              </div>
              <h2 className="font-black text-slate-800 text-[15px]">Submit New Query</h2>
            </div>
            <button
              onClick={() => { setShowForm(false); setForm({ ...EMPTY_FORM }); }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Category + Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-slate-50/50 appearance-none"
                >
                  {Object.entries(CATEGORY_META).map(([key, meta]) => (
                    <option key={key} value={key}>{meta.label}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Subject <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Brief subject of your query..."
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-slate-50/50"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                required
                placeholder="Describe your query in detail. Be as specific as possible so we can help you faster..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-slate-50/50 resize-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {form.message.length} / 1000 characters
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-50">
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm({ ...EMPTY_FORM }); }}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !form.subject.trim() || !form.message.trim()}
                className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-black hover:bg-green-700 transition-colors shadow-md shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    Submit Query
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary chips */}
      {queries.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { label: "All",     count: queries.length,                            color: "bg-slate-100 text-slate-700"  },
            { label: "Pending", count: queries.filter(q => q.status === "pending").length, color: "bg-amber-100 text-amber-700" },
            { label: "Replied", count: queries.filter(q => q.status === "replied").length, color: "bg-green-100 text-green-700"  },
          ].map((chip) => (
            <span key={chip.label} className={`text-xs font-bold px-3 py-1.5 rounded-full ${chip.color}`}>
              {chip.label}: {chip.count}
            </span>
          ))}
        </div>
      )}

      {/* Query list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-green-50 shadow-sm">
          <div className="flex flex-col items-center justify-center py-20 px-6 gap-4">
            <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-green-300">
                {filter === "replied" ? "mark_chat_read" : filter === "pending" ? "pending" : "help_outline"}
              </span>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-700">
                {filter === "replied"
                  ? "No Replied Queries"
                  : filter === "pending"
                  ? "No Pending Queries"
                  : "No Queries Yet"}
              </h3>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                {filter === "replied"
                  ? "None of your queries have been replied to yet."
                  : filter === "pending"
                  ? "You have no pending queries at the moment."
                  : "Submit your first query and our counselors will get back to you shortly."}
              </p>
            </div>
            {filter !== "replied" && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-md shadow-green-200"
              >
                <span className="material-symbols-outlined text-[18px]">add_comment</span>
                Submit a Query
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((q) => {
            const catMeta  = CATEGORY_META[q.category] ?? CATEGORY_META.general;
            const isOpen   = expanded === q.id;
            const isReplied = q.status === "replied";
            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-green-50 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Query header */}
                <button
                  className="w-full text-left px-6 py-4 flex items-center gap-4"
                  onClick={() => setExpanded(isOpen ? null : q.id)}
                >
                  {/* Category icon */}
                  <div className={`w-10 h-10 ${catMeta.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <span className={`material-symbols-outlined text-[20px] ${catMeta.color}`}>
                      {catMeta.icon}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-800 truncate">{q.subject}</p>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isReplied
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        <span className="material-symbols-outlined text-[11px]">
                          {isReplied ? "mark_chat_read" : "pending"}
                        </span>
                        {isReplied ? "Replied" : "Pending"}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${catMeta.bg} ${catMeta.color}`}>
                        {catMeta.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      {new Date(q.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>

                  <span className={`material-symbols-outlined text-[20px] text-slate-300 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <div className="px-6 pb-5 border-t border-slate-50 space-y-4 pt-4">
                    {/* Message */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Your Message</p>
                      <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl px-4 py-3">
                        {q.message}
                      </p>
                    </div>

                    {/* Reply */}
                    {q.reply ? (
                      <div>
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">mark_chat_read</span>
                          Reply from Support
                        </p>
                        <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                          <p className="text-sm text-slate-700 leading-relaxed">{q.reply}</p>
                          {q.replied_at && (
                            <p className="text-[10px] text-green-500 font-semibold mt-2 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[11px]">schedule</span>
                              Replied on{" "}
                              {new Date(q.replied_at).toLocaleDateString("en-IN", {
                                day: "2-digit", month: "short", year: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 px-4 py-3 rounded-xl">
                        <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
                        <span className="font-semibold">Awaiting response from our support team</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}




