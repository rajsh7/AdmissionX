"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props { college: CollegeUser }

interface Ticket {
  id: string;
  subject: string;
  message: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved";
  category: string;
  student_name: string;
  student_email: string;
  reply: string | null;
  replied_at: string | null;
  created_at: string | null;
}

interface Stats { open: number; in_progress: number; resolved: number; total: number }

const FILL = { fontVariationSettings: "'FILL' 1" };

const STATUS_CONFIG = {
  open:        { label: "Open",        cls: "bg-red-50 text-red-600 border-red-100",     icon: "radio_button_unchecked" },
  in_progress: { label: "In Progress", cls: "bg-amber-50 text-amber-600 border-amber-100", icon: "pending" },
  resolved:    { label: "Resolved",    cls: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: "check_circle" },
};

const PRIORITY_CONFIG = {
  low:    { label: "Low",    cls: "bg-slate-50 text-slate-500" },
  medium: { label: "Medium", cls: "bg-blue-50 text-blue-600" },
  high:   { label: "High",   cls: "bg-red-50 text-red-600" },
};

const FILTER_TABS = [
  { value: "",            label: "All" },
  { value: "open",        label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved",    label: "Resolved" },
];

function TicketCard({
  ticket,
  slug,
  onReplied,
  onStatusChanged,
}: {
  ticket: Ticket;
  slug: string;
  onReplied: (id: string, reply: string) => void;
  onStatusChanged: (id: string, status: Ticket["status"]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReply, setShowReply] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const sc = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
  const pc = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG.medium;

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/helpdesk`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: ticket.id, reply: replyText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send reply");
      onReplied(ticket.id, replyText.trim());
      setReplyText("");
      setShowReply(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(newStatus: Ticket["status"]) {
    setUpdatingStatus(true);
    try {
      await fetch(`/api/college/dashboard/${slug}/helpdesk`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: ticket.id, status: newStatus }),
      });
      onStatusChanged(ticket.id, newStatus);
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <div className={`bg-white rounded-2xl border-2 transition-all ${
      ticket.status === "open" ? "border-red-100" :
      ticket.status === "in_progress" ? "border-amber-100" :
      "border-slate-100"
    }`}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left p-5 flex items-start gap-4"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 font-black text-slate-500 text-sm">
          {ticket.student_name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <p className="font-bold text-slate-800 text-sm truncate">{ticket.subject}</p>
              <p className="text-xs text-slate-400 mt-0.5">{ticket.student_name}
                {ticket.student_email && <span className="text-slate-300"> · {ticket.student_email}</span>}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pc.cls}`}>
                {pc.label}
              </span>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1 ${sc.cls}`}>
                <span className="material-symbols-outlined text-[12px]" style={FILL}>{sc.icon}</span>
                {sc.label}
              </span>
              {ticket.created_at && (
                <span className="text-[10px] text-slate-400">{ticket.created_at}</span>
              )}
            </div>
          </div>
          <p className="mt-1.5 text-sm text-slate-500 line-clamp-1">{ticket.message}</p>
        </div>

        <span className={`material-symbols-outlined text-[20px] text-slate-400 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}>
          expand_more
        </span>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 space-y-0 divide-y divide-slate-50">

          {/* Full message */}
          <div className="p-5">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Message</p>
            <div className="bg-slate-50 rounded-xl px-4 py-3">
              <p className="text-sm text-slate-700 leading-relaxed">{ticket.message}</p>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[11px] font-bold text-slate-400">Category:</span>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{ticket.category}</span>
            </div>
          </div>

          {/* Existing reply */}
          {ticket.reply && (
            <div className="p-5">
              <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]" style={FILL}>check_circle</span>
                Your Reply · {ticket.replied_at ?? ""}
              </p>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                <p className="text-sm text-emerald-800 leading-relaxed">{ticket.reply}</p>
              </div>
            </div>
          )}

          {/* Status changer + reply */}
          <div className="p-5 flex flex-col sm:flex-row gap-4">
            {/* Status selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Status:</span>
              {(["open", "in_progress", "resolved"] as const).map(s => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={updatingStatus || ticket.status === s}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all disabled:cursor-default ${
                      ticket.status === s
                        ? `${cfg.cls} ring-2 ring-offset-1 ring-current`
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>

            {/* Reply button */}
            {!ticket.reply && !showReply && (
              <button
                onClick={() => setShowReply(true)}
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-[#FF3D3D] text-white text-sm font-bold rounded-xl hover:bg-[#e63535] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">reply</span>
                Reply
              </button>
            )}
            {ticket.reply && (
              <button
                onClick={() => setShowReply(v => !v)}
                className="ml-auto flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Update Reply
              </button>
            )}
          </div>

          {/* Reply form */}
          {showReply && (
            <div className="px-5 pb-5">
              <form onSubmit={handleReply} className="space-y-3">
                <textarea
                  value={replyText}
                  onChange={e => { setReplyText(e.target.value); setError(""); }}
                  placeholder="Type your reply to the student..."
                  rows={4}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF3D3D]/20 focus:border-[#FF3D3D] resize-none transition-all"
                />
                {error && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>{error}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving || !replyText.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#FF3D3D] text-white text-sm font-bold rounded-xl disabled:opacity-50 hover:bg-[#e63535] transition-colors"
                  >
                    {saving
                      ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <span className="material-symbols-outlined text-[16px]">send</span>
                    }
                    {saving ? "Sending…" : "Send Reply"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowReply(false); setReplyText(""); setError(""); }}
                    className="px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HelpdeskTab({ college }: Props) {
  const slug = college.slug;
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Stats>({ open: 0, in_progress: 0, resolved: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const sp = new URLSearchParams({ page: String(page) });
      if (filterStatus) sp.set("status", filterStatus);
      const res = await fetch(`/api/college/dashboard/${slug}/helpdesk?${sp}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setTickets(data.tickets ?? []);
      setStats(data.stats ?? stats);
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, page, filterStatus]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [filterStatus]);

  function handleReplied(id: string, reply: string) {
    setTickets(prev => prev.map(t =>
      t.id === id ? { ...t, reply, replied_at: "Just now", status: "resolved" } : t
    ));
    setStats(prev => ({ ...prev, open: Math.max(0, prev.open - 1), resolved: prev.resolved + 1 }));
  }

  function handleStatusChanged(id: string, status: Ticket["status"]) {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  }

  return (
    <div className="pb-24 font-poppins space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="w-1.5 h-6 bg-[#FF3D3D] rounded-full" />
          <h2 className="text-[24px] font-black text-slate-800 uppercase tracking-tight">Help Desk</h2>
        </div>
        <p className="text-slate-500 text-sm font-medium">
          Support tickets raised by students — reply and manage their requests.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total",       value: stats.total,       icon: "confirmation_number", cls: "bg-slate-100 text-slate-600" },
          { label: "Open",        value: stats.open,        icon: "radio_button_unchecked", cls: "bg-red-100 text-red-600" },
          { label: "In Progress", value: stats.in_progress, icon: "pending",             cls: "bg-amber-100 text-amber-600" },
          { label: "Resolved",    value: stats.resolved,    icon: "check_circle",        cls: "bg-emerald-100 text-emerald-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.cls}`}>
              <span className="material-symbols-outlined text-[20px]" style={FILL}>{s.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800 leading-none">{s.value}</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {FILTER_TABS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === f.value
                ? "bg-white text-[#FF3D3D] shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {f.label}
            {f.value === "open" && stats.open > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-black">
                {stats.open}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-red-700">
          <span className="material-symbols-outlined text-xl">error</span>
          <span className="text-sm font-medium">{error}</span>
          <button onClick={load} className="ml-auto text-xs font-bold underline">Retry</button>
        </div>
      )}

      {/* Ticket list */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="p-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
          <span className="material-symbols-outlined text-slate-300 text-6xl mb-4 block" style={FILL}>
            support_agent
          </span>
          <p className="text-slate-400 font-bold text-lg">
            {filterStatus ? `No ${STATUS_CONFIG[filterStatus as keyof typeof STATUS_CONFIG]?.label ?? filterStatus} tickets.` : "No support tickets yet."}
          </p>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            When students raise support tickets for your college, they will appear here.
          </p>
          {filterStatus && (
            <button
              onClick={() => setFilterStatus("")}
              className="mt-4 text-sm text-[#FF3D3D] font-bold hover:underline"
            >
              Show all tickets
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(t => (
            <TicketCard
              key={t.id}
              ticket={t}
              slug={slug}
              onReplied={handleReplied}
              onStatusChanged={handleStatusChanged}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">Page {page} of {totalPages}</p>
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
