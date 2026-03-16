"use client";

import { useState } from "react";

interface Props {
  user: { id: number; name: string; email: string } | null;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

interface Ticket {
  id: number;
  subject: string;
  message: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved";
  created_at: string;
  category: string;
}

const FAQ_DATA: FAQ[] = [
  {
    id: 1,
    category: "Account",
    question: "How do I reset my password?",
    answer:
      "Go to the Login page and click 'Forgot Password'. Enter your registered email address and we will send you a reset link. The link is valid for 30 minutes. If you do not receive the email, check your spam folder or contact support.",
  },
  {
    id: 2,
    category: "Account",
    question: "How do I update my profile information?",
    answer:
      "Navigate to Student Details → Account Details from the sidebar. You can update your name, phone number, date of birth, gender, and other personal information. Click 'Save Changes' after updating. Your email address cannot be changed once registered.",
  },
  {
    id: 3,
    category: "Application",
    question: "How do I apply to a college on AdmissionX?",
    answer:
      "Browse colleges using the top navigation or search bar. Open a college page and click 'Apply Now' on the course you want. Fill in the application form, upload required documents, and pay the application fee if applicable. You can track your application status under Application → View All.",
  },
  {
    id: 4,
    category: "Application",
    question: "Can I edit my application after submission?",
    answer:
      "Applications in 'Draft' status can be edited. Once submitted, you cannot make changes to the main application. However, you can contact the college directly or raise a query through our Queries section if you need to make corrections.",
  },
  {
    id: 5,
    category: "Application",
    question: "What does each application status mean?",
    answer:
      "Draft — application saved but not submitted. Submitted — application sent to the college. Under Review — college is reviewing your application. Verified — your documents have been verified. Enrolled — you have been admitted and enrolled. Rejected — your application was not accepted.",
  },
  {
    id: 6,
    category: "Documents",
    question: "What documents do I need to upload?",
    answer:
      "Typically required documents include: Class 10 marksheet, Class 12 marksheet, Entrance exam scorecard (JEE/NEET/etc.), Photo ID proof (Aadhar/PAN), Recent passport-size photograph, Caste certificate (if applicable), Income certificate (for fee concession), Migration certificate (for transfers). Requirements vary by college — check the specific college page for their requirements.",
  },
  {
    id: 7,
    category: "Documents",
    question: "What file formats are accepted for document uploads?",
    answer:
      "We accept PDF, JPG, JPEG, and PNG formats. Each file should not exceed 5 MB. For marksheets and certificates, PDF format is preferred. For photographs, JPEG or PNG with a clear background is recommended. Make sure all documents are clearly scanned and readable.",
  },
  {
    id: 8,
    category: "Payments",
    question: "What payment methods are accepted?",
    answer:
      "We accept UPI (Google Pay, PhonePe, Paytm), Net Banking, Debit Cards, and Credit Cards. All transactions are secured with 256-bit SSL encryption. You will receive a payment confirmation email after successful payment. Keep your transaction ID for future reference.",
  },
  {
    id: 9,
    category: "Payments",
    question: "I paid the fee but my status is still pending. What should I do?",
    answer:
      "Payment processing can take up to 24 hours to reflect. If your status is still pending after 24 hours, please raise a support ticket with your Transaction ID, payment date, and amount. Our team will investigate and update your status within 2 business days.",
  },
  {
    id: 10,
    category: "Counselling",
    question: "How do I book a counselling session?",
    answer:
      "Go to Counseling from the sidebar. You will see a list of available expert counselors. Click 'Book Session' on the counselor of your choice, select a date and time slot, and confirm your booking. You will receive a confirmation on your registered email. All sessions are free of charge.",
  },
  {
    id: 11,
    category: "Counselling",
    question: "Is the counselling service free?",
    answer:
      "Yes! All counselling sessions on AdmissionX are completely free of charge. Our mission is to make quality education guidance accessible to every student. There are no hidden charges for any of our counselling or guidance services.",
  },
  {
    id: 12,
    category: "Technical",
    question: "The website is not loading properly. What should I do?",
    answer:
      "Try the following steps: 1) Clear your browser cache and cookies, 2) Try a different browser (Chrome, Firefox, or Edge recommended), 3) Disable browser extensions that might interfere, 4) Check your internet connection, 5) Try from a different device. If the issue persists, raise a support ticket with your browser details and a screenshot.",
  },
];

const CATEGORIES = ["All", ...Array.from(new Set(FAQ_DATA.map((f) => f.category)))];

const PRIORITY_META = {
  low:    { label: "Low",    color: "bg-slate-100 text-slate-600",  dot: "bg-slate-400"  },
  medium: { label: "Medium", color: "bg-amber-100 text-amber-700",  dot: "bg-amber-400"  },
  high:   { label: "High",   color: "bg-red-100 text-red-600",      dot: "bg-red-500"    },
};

const STATUS_META = {
  open:        { label: "Open",        color: "bg-blue-100 text-blue-700",   icon: "radio_button_unchecked" },
  in_progress: { label: "In Progress", color: "bg-amber-100 text-amber-700", icon: "pending"                },
  resolved:    { label: "Resolved",    color: "bg-green-100 text-green-700", icon: "check_circle"           },
};

const EMPTY_TICKET = {
  subject: "",
  message: "",
  priority: "medium" as Ticket["priority"],
  category: "Account",
};

export default function HelpDeskTab({ user }: Props) {
  // FAQ state
  const [faqCategory, setFaqCategory] = useState("All");
  const [openFaq, setOpenFaq]         = useState<number | null>(null);
  const [search, setSearch]           = useState("");

  // Ticket state
  const [activeTab, setActiveTab]   = useState<"faq" | "tickets">("faq");
  const [tickets, setTickets]       = useState<Ticket[]>([]);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState({ ...EMPTY_TICKET });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  // Filtered FAQs
  const filteredFaqs = FAQ_DATA.filter((f) => {
    const matchCat = faqCategory === "All" || f.category === faqCategory;
    const matchSearch =
      !search ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    const newTicket: Ticket = {
      id: Date.now(),
      subject: form.subject,
      message: form.message,
      priority: form.priority,
      category: form.category,
      status: "open",
      created_at: new Date().toISOString(),
    };
    setTickets((prev) => [newTicket, ...prev]);
    setForm({ ...EMPTY_TICKET });
    setShowForm(false);
    setSubmitting(false);
    setSubmitted(true);
    setActiveTab("tickets");
    setTimeout(() => setSubmitted(false), 5000);
  }

  return (
    <div className="space-y-6 max-w-5xl">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-green-600 text-[22px]">
              help_center
            </span>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">Help Desk</h1>
            <p className="text-xs text-slate-400 font-medium">
              FAQs, support tickets and guides to help you succeed
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setActiveTab("tickets");
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-md shadow-green-200"
        >
          <span className="material-symbols-outlined text-[18px]">
            confirmation_number
          </span>
          Raise a Ticket
        </button>
      </div>

      {/* ── Success toast ── */}
      {submitted && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <span
            className="material-symbols-outlined text-green-500 text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <p className="text-green-700 text-sm font-semibold">
            Your support ticket has been submitted! We will respond within 24
            hours.
          </p>
        </div>
      )}

      {/* ── Quick stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            icon: "quiz",
            label: "FAQs Available",
            value: String(FAQ_DATA.length),
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            icon: "confirmation_number",
            label: "My Tickets",
            value: String(tickets.length),
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            icon: "pending",
            label: "Open Tickets",
            value: String(tickets.filter((t) => t.status === "open").length),
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            icon: "check_circle",
            label: "Resolved",
            value: String(
              tickets.filter((t) => t.status === "resolved").length
            ),
            color: "text-green-600",
            bg: "bg-green-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-green-50 shadow-sm p-4 flex items-center gap-3"
          >
            <div
              className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}
            >
              <span
                className={`material-symbols-outlined text-[20px] ${s.color}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {s.icon}
              </span>
            </div>
            <div>
              <p className="text-xl font-black text-slate-800 leading-none">
                {s.value}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab switcher ── */}
      <div className="bg-white rounded-2xl border border-green-50 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100">
          {(
            [
              { id: "faq", label: "FAQs", icon: "quiz" },
              { id: "tickets", label: "My Tickets", icon: "confirmation_number" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all duration-150 ${
                activeTab === tab.id
                  ? "border-green-500 text-green-700 bg-green-50/40"
                  : "border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50/50"
              }`}
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={
                  activeTab === tab.id
                    ? { fontVariationSettings: "'FILL' 1" }
                    : {}
                }
              >
                {tab.icon}
              </span>
              {tab.label}
              {tab.id === "tickets" && tickets.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-green-600 text-white text-[10px] font-black flex items-center justify-center">
                  {tickets.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FAQ TAB
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "faq" && (
          <div className="p-5 space-y-5">

            {/* Search + category filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[17px] text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search FAQs..."
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-slate-50/50"
                />
              </div>

              {/* Category chips */}
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFaqCategory(cat)}
                    className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                      faqCategory === cat
                        ? "bg-green-600 text-white shadow-sm shadow-green-200"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count */}
            {search && (
              <p className="text-xs text-slate-400 font-medium">
                {filteredFaqs.length} result
                {filteredFaqs.length !== 1 ? "s" : ""} for &ldquo;{search}
                &rdquo;
              </p>
            )}

            {/* FAQ accordion */}
            {filteredFaqs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-green-300">
                    search_off
                  </span>
                </div>
                <p className="text-slate-500 font-semibold text-sm">
                  No FAQs found
                </p>
                <p className="text-slate-400 text-xs text-center max-w-xs">
                  Try a different search term or category. If you still cannot
                  find your answer, raise a support ticket.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setFaqCategory("All");
                  }}
                  className="text-xs font-bold text-green-600 hover:text-green-700 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFaqs.map((faq) => {
                  const isOpen = openFaq === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                        isOpen
                          ? "border-green-200 shadow-sm shadow-green-50"
                          : "border-slate-100 hover:border-green-100"
                      }`}
                    >
                      {/* Question header */}
                      <button
                        className="w-full text-left px-5 py-4 flex items-center gap-4 bg-white hover:bg-green-50/30 transition-colors"
                        onClick={() =>
                          setOpenFaq(isOpen ? null : faq.id)
                        }
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                            isOpen ? "bg-green-100" : "bg-slate-100"
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-[16px] transition-colors ${
                              isOpen ? "text-green-600" : "text-slate-400"
                            }`}
                            style={
                              isOpen
                                ? { fontVariationSettings: "'FILL' 1" }
                                : {}
                            }
                          >
                            help
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p
                            className={`text-sm font-bold transition-colors ${
                              isOpen ? "text-green-700" : "text-slate-700"
                            }`}
                          >
                            {faq.question}
                          </p>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {faq.category}
                          </span>
                        </div>
                        <span
                          className={`material-symbols-outlined text-[20px] flex-shrink-0 transition-all duration-200 ${
                            isOpen
                              ? "text-green-500 rotate-180"
                              : "text-slate-300"
                          }`}
                        >
                          expand_more
                        </span>
                      </button>

                      {/* Answer */}
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 bg-green-50/20 border-t border-green-100">
                          <div className="flex gap-3 pt-3">
                            <div className="w-1 bg-green-400 rounded-full flex-shrink-0 self-stretch" />
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                          <div className="mt-4 flex items-center gap-3">
                            <p className="text-[11px] text-slate-400 font-medium">
                              Was this helpful?
                            </p>
                            <button className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-green-600 bg-white border border-slate-200 hover:border-green-300 px-2.5 py-1 rounded-lg transition-colors">
                              <span className="material-symbols-outlined text-[14px]">
                                thumb_up
                              </span>
                              Yes
                            </button>
                            <button className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-red-500 bg-white border border-slate-200 hover:border-red-200 px-2.5 py-1 rounded-lg transition-colors">
                              <span className="material-symbols-outlined text-[14px]">
                                thumb_down
                              </span>
                              No
                            </button>
                            <button
                              onClick={() => {
                                setShowForm(true);
                                setActiveTab("tickets");
                              }}
                              className="ml-auto text-[11px] font-bold text-green-600 hover:text-green-700 transition-colors flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[13px]">
                                open_in_new
                              </span>
                              Still need help?
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Contact support CTA */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 mt-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span
                  className="material-symbols-outlined text-green-600 text-[24px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  support_agent
                </span>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="font-black text-slate-800 text-sm">
                  Couldn&apos;t find your answer?
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Our support team responds within 24 hours. Raise a ticket or
                  chat with a counselor for immediate assistance.
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setShowForm(true);
                    setActiveTab("tickets");
                  }}
                  className="px-4 py-2.5 bg-green-600 text-white text-xs font-black rounded-xl hover:bg-green-700 transition-colors shadow-md shadow-green-200 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    confirmation_number
                  </span>
                  Raise Ticket
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TICKETS TAB
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "tickets" && (
          <div className="p-5 space-y-5">

            {/* New ticket form */}
            {showForm && (
              <div className="bg-slate-50/50 border border-green-100 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 bg-green-50/60 border-b border-green-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-green-600 text-[16px]">
                        confirmation_number
                      </span>
                    </div>
                    <h2 className="font-black text-slate-800 text-[15px]">
                      New Support Ticket
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setForm({ ...EMPTY_TICKET });
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      close
                    </span>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  {/* Category + Priority */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-600 mb-1.5 uppercase tracking-wider">
                        Category
                      </label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-white appearance-none"
                      >
                        {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-600 mb-1.5 uppercase tracking-wider">
                        Priority
                      </label>
                      <select
                        name="priority"
                        value={form.priority}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-white appearance-none"
                      >
                        <option value="low">Low — General query</option>
                        <option value="medium">
                          Medium — Needs attention
                        </option>
                        <option value="high">High — Urgent issue</option>
                      </select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-black text-slate-600 mb-1.5 uppercase tracking-wider">
                      Subject <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      placeholder="Brief description of your issue..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-white"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-black text-slate-600 mb-1.5 uppercase tracking-wider">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Describe your issue in detail. Include any error messages, steps you tried, and your expected result..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-white resize-none"
                    />
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-slate-400">
                        {form.message.length} / 2000 characters
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Support ID will be emailed to{" "}
                        <strong>{user?.email}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setForm({ ...EMPTY_TICKET });
                      }}
                      className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        submitting ||
                        !form.subject.trim() ||
                        !form.message.trim()
                      }
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
                          Submit Ticket
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tickets list */}
            {tickets.length === 0 && !showForm ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-green-300">
                    confirmation_number
                  </span>
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-base font-black text-slate-700">No Support Tickets</h3>
                  <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                    Raise a ticket if you have any issues with your account, applications,
                    payments, or documents.
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-md shadow-green-200"
                >
                  <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                  Raise a Ticket
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 font-medium">
                    {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    New Ticket
                  </button>
                </div>
                {tickets.map((ticket) => {
                  const sm = STATUS_META[ticket.status];
                  const pm = PRIORITY_META[ticket.priority];
                  const smClass = "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider " + sm.color;
                  const pmClass = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold " + pm.color;
                  const dotClass = "w-1.5 h-1.5 rounded-full " + pm.dot;
                  return (
                    <div key={ticket.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:border-green-100 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-green-600 text-[16px]">confirmation_number</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{ticket.subject}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {ticket.category} &bull;{" "}
                              {new Date(ticket.created_at).toLocaleDateString("en-IN", {
                                day: "2-digit", month: "short", year: "numeric",
                              })}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2">{ticket.message}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className={smClass}>
                            <span className="material-symbols-outlined text-[11px]">{sm.icon}</span>
                            {sm.label}
                          </span>
                          <span className={pmClass}>
                            <span className={dotClass} />
                            {pm.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
