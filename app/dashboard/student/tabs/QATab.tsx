"use client";

import { useState } from "react";

interface Props {
  user: { id: string | number; name: string; email: string } | null;
  type: "questions" | "answers" | "comments" | "reviews";
}

const TYPE_META = {
  questions: {
    label: "Questions",
    icon: "quiz",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    emptyTitle: "No Questions Yet",
    emptyDesc: "Ask questions about colleges, courses, fees, admissions and get answers from students and experts.",
    actionLabel: "Ask a Question",
    actionIcon: "help",
    placeholder: "e.g. What is the cutoff for B.Tech CSE at VIT Vellore?",
    formTitle: "Ask a Question",
  },
  answers: {
    label: "Answers",
    icon: "question_answer",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-100",
    emptyTitle: "No Answers Yet",
    emptyDesc: "You haven't answered any questions yet. Help fellow students by sharing your knowledge and experience.",
    actionLabel: "Browse Questions",
    actionIcon: "forum",
    placeholder: "",
    formTitle: "",
  },
  comments: {
    label: "Comments",
    icon: "comment",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
    emptyTitle: "No Comments Yet",
    emptyDesc: "Your comments on college pages, blogs, and discussions will appear here.",
    actionLabel: "Browse Colleges",
    actionIcon: "account_balance",
    placeholder: "",
    formTitle: "",
  },
  reviews: {
    label: "Your Reviews",
    icon: "rate_review",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    emptyTitle: "No Reviews Yet",
    emptyDesc: "Share your experience about colleges, courses, or the admission process to help other students.",
    actionLabel: "Write a Review",
    actionIcon: "edit",
    placeholder: "e.g. Share your experience with this college...",
    formTitle: "Write a Review",
  },
};

interface QAItem {
  id: number;
  content: string;
  title?: string;
  college?: string;
  votes: number;
  answers?: number;
  rating?: number;
  created_at: string;
  tags?: string[];
}

export default function QATab({ user, type }: Props) {
  const meta = TYPE_META[type];
  const [items]    = useState<QAItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", college: "", rating: 5, tags: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setSubmitted(true);
    setShowForm(false);
    setFormData({ title: "", content: "", college: "", rating: 5, tags: "" });
    setTimeout(() => setSubmitted(false), 4000);
  }

  const canSubmit = type === "questions" || type === "reviews";

  return (
    <div className="space-y-6 max-w-4xl">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${meta.bg} rounded-xl flex items-center justify-center`}>
            <span className={`material-symbols-outlined ${meta.color} text-[22px]`}>
              {meta.icon}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">{meta.label}</h1>
            <p className="text-xs text-slate-400 font-medium">
              {type === "questions"  && "Questions you have asked on AdmissionX"}
              {type === "answers"    && "Questions you have answered"}
              {type === "comments"   && "Comments you have posted"}
              {type === "reviews"    && "College and course reviews you have written"}
            </p>
          </div>
        </div>

        {canSubmit && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-md shadow-green-200"
          >
            <span className="material-symbols-outlined text-[18px]">{meta.actionIcon}</span>
            {meta.actionLabel}
          </button>
        )}
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
            {type === "questions"
              ? "Your question has been submitted! Our community will respond shortly."
              : "Your review has been submitted successfully!"}
          </p>
        </div>
      )}

      {/* ── Coming Soon notice ── */}
      <div className="bg-gradient-to-r from-slate-50 to-green-50/40 border border-green-100 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <span
            className="material-symbols-outlined text-green-600 text-[22px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            forum
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-black text-slate-800">Q&amp;A Community — Coming Soon</p>
            <span className="text-[10px] font-black text-green-600 bg-green-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Beta
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            The full community Q&amp;A platform is under development. You will be able to ask questions,
            post answers, comment on college pages, and write detailed reviews — all synced with your
            AdmissionX profile.
          </p>
          {/* Stats preview */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: "quiz",            label: "Questions",    count: "0", color: "text-blue-500"   },
              { icon: "question_answer", label: "Answers",      count: "0", color: "text-green-500"  },
              { icon: "comment",         label: "Comments",     count: "0", color: "text-purple-500" },
              { icon: "star",            label: "Reviews",      count: "0", color: "text-amber-500"  },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl border border-green-50 shadow-sm p-3 flex items-center gap-2"
              >
                <span className={`material-symbols-outlined text-[18px] ${stat.color}`}>
                  {stat.icon}
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-400">{stat.label}</p>
                  <p className="text-lg font-black text-slate-700">{stat.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Question / Review Form ── */}
      {canSubmit && showForm && (
        <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 bg-green-50/40">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-[16px]">
                  {meta.actionIcon}
                </span>
              </div>
              <h2 className="font-black text-slate-800 text-[15px]">{meta.formTitle}</h2>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* Title (for questions) */}
            {type === "questions" && (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Question Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={meta.placeholder}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-slate-50/50"
                />
              </div>
            )}

            {/* College (for reviews) */}
            {type === "reviews" && (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  College / Course Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="e.g. IIT Bombay — B.Tech Computer Science"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-slate-50/50"
                />
              </div>
            )}

            {/* Star Rating (for reviews) */}
            {type === "reviews" && (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                  Overall Rating <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, rating: star }))}
                      className="transition-transform hover:scale-110"
                    >
                      <span
                        className={`material-symbols-outlined text-[32px] transition-colors ${
                          star <= formData.rating ? "text-amber-400" : "text-slate-200"
                        }`}
                        style={
                          star <= formData.rating
                            ? { fontVariationSettings: "'FILL' 1" }
                            : {}
                        }
                      >
                        star
                      </span>
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-bold text-slate-600">
                    {formData.rating === 5
                      ? "Excellent"
                      : formData.rating === 4
                      ? "Very Good"
                      : formData.rating === 3
                      ? "Average"
                      : formData.rating === 2
                      ? "Below Average"
                      : "Poor"}
                  </span>
                </div>
              </div>
            )}

            {/* Description / Content */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                {type === "questions" ? "Describe your question" : "Your Review"}
                <span className="text-red-400"> *</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={5}
                required
                placeholder={
                  type === "questions"
                    ? "Provide more details about your question. Include specific context like year, branch, location, etc."
                    : "Share your honest experience — academics, faculty, placements, infrastructure, campus life..."
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-slate-50/50 resize-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {formData.content.length} / 2000 characters
              </p>
            </div>

            {/* Tags (for questions) */}
            {type === "questions" && (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g. B.Tech, Admission, Cutoff, Maharashtra"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-slate-50/50"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-50">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-black hover:bg-green-700 transition-colors shadow-md shadow-green-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    Submit
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Empty state ── */}
      {items.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl border border-green-50 shadow-sm">
          <div className="flex flex-col items-center justify-center py-20 px-6 gap-4">

            {/* Illustration */}
            <div className={`w-24 h-24 ${meta.bg} rounded-3xl flex items-center justify-center`}>
              <span className={`material-symbols-outlined text-5xl ${meta.color} opacity-60`}>
                {meta.icon}
              </span>
            </div>

            <div className="text-center space-y-2 max-w-sm">
              <h3 className="text-lg font-black text-slate-700">{meta.emptyTitle}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{meta.emptyDesc}</p>
            </div>

            {canSubmit ? (
              <button
                onClick={() => setShowForm(true)}
                className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-md shadow-green-200"
              >
                <span className="material-symbols-outlined text-[18px]">{meta.actionIcon}</span>
                {meta.actionLabel}
              </button>
            ) : (
              <a
                href="/colleges"
                className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-md shadow-green-200"
              >
                <span className="material-symbols-outlined text-[18px]">{meta.actionIcon}</span>
                {meta.actionLabel}
              </a>
            )}

            {/* Badges */}
            <div className="flex items-center gap-3 mt-2 flex-wrap justify-center">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                Verified Responses
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <span className="material-symbols-outlined text-[14px]">groups</span>
                Community Driven
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <span className="material-symbols-outlined text-[14px]">star</span>
                Expert Answers
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




