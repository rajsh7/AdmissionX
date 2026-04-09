"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  user: { id: string | number; name: string; email: string } | null;
  filter?: string;
}

interface Query {
  id: string;
  college_slug: string;
  college_name: string;
  subject: string;
  message: string;
  status: "pending" | "answered" | "closed";
  response: string | null;
  responded_at: string | null;
  created_at: string | null;
}

function QueryCard({ q }: { q: Query }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-[12px] border-2 border-gray-100 p-6 hover:border-[#e31e24]/20 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1 flex-1 min-w-0 pr-4">
          <h3 className="text-[15px] font-bold text-[#333] truncate">{q.subject}</h3>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{q.college_name}</p>
        </div>
        <span className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest ${
          q.status === "pending" ? "bg-amber-50 text-amber-600" :
          q.status === "answered" ? "bg-emerald-50 text-emerald-600" :
          "bg-gray-50 text-gray-400"
        }`}>
          {q.status}
        </span>
      </div>

      <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl mb-4">
        <p className="text-[13px] font-medium text-gray-600 italic leading-relaxed line-clamp-3">"{q.message}"</p>
      </div>

      {q.response ? (
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={() => setExpanded(p => !p)}
            className="flex items-center gap-2 text-[12px] font-bold text-emerald-600 mb-3"
          >
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            College replied · {q.responded_at ?? ""}
            <span className="material-symbols-outlined text-[16px]">{expanded ? "expand_less" : "expand_more"}</span>
          </button>
          {expanded && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <p className="text-[13px] font-medium text-emerald-800 leading-relaxed">{q.response}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="pt-3 flex items-center gap-2 text-gray-400">
          <span className="material-symbols-outlined text-[18px] animate-pulse">schedule</span>
          <span className="text-[11px] font-semibold uppercase tracking-widest">Awaiting response · {q.created_at}</span>
        </div>
      )}
    </div>
  );
}

export default function QueriesTab({ user }: Props) {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [collegeSlug, setCollegeSlug] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/student/${user.id}/queries`);
      const data = await res.json();
      setQueries(data.queries ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    if (!collegeSlug.trim()) { setFormError("College slug/URL is required."); return; }
    if (!subject.trim()) { setFormError("Subject is required."); return; }
    if (!message.trim()) { setFormError("Message is required."); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/student/${user?.id}/queries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ college_slug: collegeSlug.trim(), college_name: collegeName.trim(), subject: subject.trim(), message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error ?? "Failed to send query."); return; }
      setFormSuccess("Query sent! The college will respond shortly.");
      setCollegeSlug(""); setCollegeName(""); setSubject(""); setMessage("");
      setTimeout(() => { setShowForm(false); setFormSuccess(""); load(); }, 2000);
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const pending = queries.filter(q => q.status === "pending").length;
  const answered = queries.filter(q => q.status === "answered").length;

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-[26px] font-bold text-[#222]">My Queries</h2>
          <p className="text-gray-400 font-semibold uppercase text-[12px] tracking-widest mt-1">Direct communication with colleges</p>
        </div>
        <button
          onClick={() => { setShowForm(p => !p); setFormError(""); setFormSuccess(""); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#e31e24] text-white text-[13px] font-bold rounded-lg shadow-lg shadow-red-100 hover:bg-[#c0191e] transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">{showForm ? "close" : "add"}</span>
          {showForm ? "Cancel" : "New Query"}
        </button>
      </div>

      {/* Stats */}
      {queries.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total", value: queries.length, icon: "forum", color: "text-slate-600 bg-slate-50" },
            { label: "Pending", value: pending, icon: "schedule", color: "text-amber-600 bg-amber-50" },
            { label: "Answered", value: answered, icon: "check_circle", color: "text-emerald-600 bg-emerald-50" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-[10px] border border-gray-100 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              </div>
              <div>
                <p className="text-[22px] font-bold text-[#222] leading-none">{s.value}</p>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Query Form */}
      {showForm && (
        <div className="bg-white rounded-[12px] border-2 border-[#e31e24]/20 p-6 mb-8 shadow-sm">
          <h3 className="text-[16px] font-bold text-[#222] mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#e31e24] text-[20px]">send</span>
            Send a Query to a College
          </h3>

          {formSuccess && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              {formSuccess}
            </div>
          )}
          {formError && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">College Slug / URL <span className="text-[#e31e24]">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">link</span>
                  <input
                    type="text"
                    value={collegeSlug}
                    onChange={e => setCollegeSlug(e.target.value)}
                    placeholder="e.g. delhi-institute-of-technology-abc12"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-[13px] text-[#333] focus:border-[#e31e24]/30 focus:ring-4 focus:ring-[#e31e24]/5 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">College Name (optional)</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">apartment</span>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={e => setCollegeName(e.target.value)}
                    placeholder="e.g. Delhi Institute of Technology"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-[13px] text-[#333] focus:border-[#e31e24]/30 focus:ring-4 focus:ring-[#e31e24]/5 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Subject <span className="text-[#e31e24]">*</span></label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">subject</span>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Admission process for B.Tech CSE"
                  required
                  maxLength={200}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-[13px] text-[#333] focus:border-[#e31e24]/30 focus:ring-4 focus:ring-[#e31e24]/5 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Message <span className="text-[#e31e24]">*</span></label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Write your question or query here..."
                required
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-[13px] text-[#333] focus:border-[#e31e24]/30 focus:ring-4 focus:ring-[#e31e24]/5 outline-none transition-all resize-none"
              />
              <p className="text-[11px] text-gray-400 text-right">{message.length}/1000</p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-8 py-3 bg-[#e31e24] text-white text-[13px] font-bold rounded-lg shadow-lg shadow-red-100 hover:bg-[#c0191e] transition-all active:scale-95 disabled:opacity-60"
              >
                {submitting ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending…</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">send</span>Send Query</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Query List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map(i => <div key={i} className="h-64 bg-gray-50 rounded-xl" />)}
        </div>
      ) : queries.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {queries.map(q => <QueryCard key={q.id} q={q} />)}
        </div>
      ) : (
        <div className="bg-white rounded-[10px] border border-gray-100 flex flex-col items-center justify-center py-32 text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-200">
            <span className="material-symbols-outlined text-[48px]">chat_bubble_outline</span>
          </div>
          <h3 className="text-[20px] font-bold text-[#333]">No Queries Yet</h3>
          <p className="text-[14px] font-medium text-gray-400 max-w-[320px] mt-2 mb-6">
            Have a question for a college? Send them a query and get a direct response.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-8 py-3 bg-[#e31e24] text-white text-[13px] font-bold rounded-full shadow-lg shadow-red-100 hover:scale-105 active:scale-95 transition-all"
          >
            Send Your First Query
          </button>
        </div>
      )}
    </div>
  );
}
