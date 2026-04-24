"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  user: { id: string | number; name: string; email: string } | null;
}

interface Ticket {
  id: string;
  subject: string;
  message: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved";
  category: string;
  college_name: string;
  college_slug: string;
  reply: string | null;
  replied_at: string | null;
  created_at: string | null;
}

const STATUS_CONFIG = {
  open:        { label: "Open",        cls: "bg-red-50 text-red-600",     icon: "radio_button_unchecked" },
  in_progress: { label: "In Progress", cls: "bg-amber-50 text-amber-600", icon: "pending" },
  resolved:    { label: "Resolved",    cls: "bg-emerald-50 text-emerald-600", icon: "check_circle" },
};

const PRIORITY_CONFIG = {
  low:    { label: "Low",    cls: "bg-slate-50 text-slate-500" },
  medium: { label: "Medium", cls: "bg-blue-50 text-blue-600" },
  high:   { label: "High",   cls: "bg-red-50 text-red-600" },
};

const CATEGORIES = ["General", "Admission", "Fees", "Documents", "Scholarship", "Placement", "Other"];
const FILL = { fontVariationSettings: "'FILL' 1" };

function TicketCard({ ticket }: { ticket: Ticket }) {
  const [expanded, setExpanded] = useState(false);
  const sc = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
  const pc = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG.medium;

  return (
    <div className={`bg-white rounded-[12px] border-2 transition-all ${
      ticket.status === "open" ? "border-red-100" :
      ticket.status === "in_progress" ? "border-amber-100" :
      "border-gray-100"
    }`}>
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left p-5 flex items-start gap-4"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sc.cls}`}>
          <span className="material-symbols-outlined text-[20px]" style={FILL}>{sc.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <p className="font-bold text-[#222] text-[14px] truncate">{ticket.subject}</p>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pc.cls}`}>{pc.label}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.cls}`}>{sc.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {ticket.college_name && (
              <span className="text-[11px] font-semibold text-blue-600">{ticket.college_name}</span>
            )}
            <span className="text-[11px] font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{ticket.category}</span>
            {ticket.created_at && <span className="text-[11px] text-gray-400">{ticket.created_at}</span>}
          </div>
        </div>
        <span className={`material-symbols-outlined text-gray-300 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`}>
          expand_more
        </span>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          <div className="p-5">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Your Message</p>
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-[13px] font-medium text-gray-600 leading-relaxed">{ticket.message}</p>
            </div>
          </div>

          {ticket.reply ? (
            <div className="p-5">
              <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]" style={FILL}>check_circle</span>
                College Reply · {ticket.replied_at ?? ""}
              </p>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                <p className="text-[13px] font-medium text-emerald-800 leading-relaxed">{ticket.reply}</p>
              </div>
            </div>
          ) : (
            <div className="p-5 flex items-center gap-2 text-gray-400">
              <span className="material-symbols-outlined text-[18px] animate-pulse">schedule</span>
              <span className="text-[11px] font-semibold uppercase tracking-widest">Awaiting college response</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HelpDeskTab({ user }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"tickets" | "faq">("tickets");

  // Form state
  const [subject, setSubject]       = useState("");
  const [message, setMessage]       = useState("");
  const [priority, setPriority]     = useState("medium");
  const [category, setCategory]     = useState("General");
  const [collegeSlug, setCollegeSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/helpdesk");
      const data = await res.json();
      setTickets(data.tickets ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(""); setFormSuccess("");
    if (!subject.trim() || !message.trim()) { setFormError("Subject and message are required."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/student/helpdesk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, priority, category, college_slug: collegeSlug }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error ?? "Failed to submit."); return; }
      setFormSuccess("Ticket submitted! The college will respond shortly.");
      setSubject(""); setMessage(""); setPriority("medium"); setCategory("General"); setCollegeSlug("");
      setTimeout(() => { setShowForm(false); setFormSuccess(""); load(); }, 2000);
    } catch { setFormError("Network error. Please try again."); }
    finally { setSubmitting(false); }
  }

  const open       = tickets.filter(t => t.status === "open").length;
  const inProgress = tickets.filter(t => t.status === "in_progress").length;
  const resolved   = tickets.filter(t => t.status === "resolved").length;

  const FAQ_DATA = [
    { q: "How do I reset my password?", a: "Go to Settings → Update Password. Use 'Forgot Password' on the login page if needed." },
    { q: "How do I track my application?", a: "Go to 'My Applications' tab to see real-time status of all your submissions." },
    { q: "What file formats are accepted for documents?", a: "We accept PDF, JPG, PNG, and WEBP. Each file must be under 5MB." },
    { q: "How do I update my profile?", a: "Navigate to Student Details → Profile to update your name, photo, and personal details." },
    { q: "How long does a college take to reply?", a: "Most colleges respond within 1–3 business days. You'll see the reply in your ticket." },
  ];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-[26px] font-bold text-[#222]">Help & Support</h2>
          <p className="text-gray-400 font-semibold uppercase text-[12px] tracking-widest mt-1">Get assistance and find answers</p>
        </div>
        {activeTab === "tickets" && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-[#e31e24] text-white text-[13px] font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-red-100 hover:bg-[#c0191e] transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Ticket
          </button>
        )}
      </div>

      {/* Stats */}
      {tickets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total",       value: tickets.length, icon: "confirmation_number", cls: "text-slate-600 bg-slate-50" },
            { label: "Open",        value: open,           icon: "radio_button_unchecked", cls: "text-red-600 bg-red-50" },
            { label: "In Progress", value: inProgress,     icon: "pending",             cls: "text-amber-600 bg-amber-50" },
            { label: "Resolved",    value: resolved,       icon: "check_circle",        cls: "text-emerald-600 bg-emerald-50" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-[10px] border border-gray-100 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.cls}`}>
                <span className="material-symbols-outlined text-[20px]" style={FILL}>{s.icon}</span>
              </div>
              <div>
                <p className="text-[22px] font-bold text-[#222] leading-none">{s.value}</p>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        <div className="flex border-b border-gray-100">
          {(["tickets", "faq"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setShowForm(false); }}
              className={`px-8 py-5 text-[13px] font-bold uppercase tracking-widest border-b-2 transition-all ${
                activeTab === tab ? "border-[#e31e24] text-[#e31e24]" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab === "tickets" ? "Support Tickets" : "FAQ"}
            </button>
          ))}
        </div>

        <div className="p-6 sm:p-10">
          {activeTab === "faq" ? (
            <div className="max-w-3xl space-y-3">
              {FAQ_DATA.map((faq, i) => (
                <div key={i} className="border-2 border-gray-50 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50/50 transition-colors"
                  >
                    <span className="text-[14px] font-bold text-[#333]">{faq.q}</span>
                    <span className={`material-symbols-outlined text-gray-300 transition-transform ${openFaq === i ? "rotate-180" : ""}`}>expand_more</span>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-[14px] font-medium text-gray-500 leading-relaxed bg-gray-50/30">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* New ticket form */}
              {showForm && (
                <div className="max-w-2xl bg-white border-2 border-[#e31e24]/20 rounded-[12px] p-6 mb-6">
                  <h3 className="text-[16px] font-bold text-[#222] mb-5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#e31e24] text-[20px]">confirmation_number</span>
                    Create Support Ticket
                  </h3>

                  {formSuccess && (
                    <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
                      <span className="material-symbols-outlined text-[18px]" style={FILL}>check_circle</span>
                      {formSuccess}
                    </div>
                  )}
                  {formError && (
                    <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                      <span className="material-symbols-outlined text-[18px]" style={FILL}>error</span>
                      {formError}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                          Category
                        </label>
                        <select
                          value={category}
                          onChange={e => setCategory(e.target.value)}
                          className="w-full bg-white border-2 border-gray-100 rounded-[8px] px-4 py-3 text-[13px] font-medium text-[#333] outline-none focus:border-[#e31e24]/30"
                        >
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                          Priority
                        </label>
                        <select
                          value={priority}
                          onChange={e => setPriority(e.target.value)}
                          className="w-full bg-white border-2 border-gray-100 rounded-[8px] px-4 py-3 text-[13px] font-medium text-[#333] outline-none focus:border-[#e31e24]/30"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                        College Slug <span className="text-gray-400 font-normal normal-case">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={collegeSlug}
                        onChange={e => setCollegeSlug(e.target.value)}
                        placeholder="e.g. delhi-institute-of-technology"
                        className="w-full bg-white border-2 border-gray-100 rounded-[8px] px-4 py-3 text-[13px] font-medium text-[#333] outline-none focus:border-[#e31e24]/30"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                        Subject <span className="text-[#e31e24]">*</span>
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        placeholder="Brief summary of your issue"
                        required
                        maxLength={200}
                        className="w-full bg-white border-2 border-gray-100 rounded-[8px] px-4 py-3 text-[13px] font-medium text-[#333] outline-none focus:border-[#e31e24]/30"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                        Message <span className="text-[#e31e24]">*</span>
                      </label>
                      <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Describe your issue in detail..."
                        required
                        rows={4}
                        maxLength={1000}
                        className="w-full bg-white border-2 border-gray-100 rounded-[8px] px-4 py-3 text-[13px] font-medium text-[#333] outline-none focus:border-[#e31e24]/30 resize-none"
                      />
                      <p className="text-[11px] text-gray-400 text-right mt-1">{message.length}/1000</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => { setShowForm(false); setFormError(""); }}
                        className="flex-1 py-3 bg-gray-50 text-gray-500 text-[13px] font-bold uppercase tracking-wider rounded-lg hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-3 bg-[#e31e24] text-white text-[13px] font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-red-100 hover:bg-[#c0191e] disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {submitting
                          ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting…</>
                          : "Submit Ticket"
                        }
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Ticket list */}
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2].map(i => <div key={i} className="h-24 bg-gray-50 rounded-xl" />)}
                </div>
              ) : tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map(t => <TicketCard key={t.id} ticket={t} />)}
                </div>
              ) : !showForm ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-200">
                    <span className="material-symbols-outlined text-[40px]">confirmation_number</span>
                  </div>
                  <h3 className="text-[18px] font-bold text-[#333]">No Tickets Yet</h3>
                  <p className="text-[13px] font-medium text-gray-400 max-w-[280px] mt-1">
                    Have an issue or question? Raise a support ticket and get a direct response.
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-6 px-8 py-3 bg-[#e31e24] text-white text-[12px] font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-red-100 hover:bg-[#c0191e] transition-all"
                  >
                    Create Ticket
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
