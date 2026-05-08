import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Help Center | AdmissionX",
  description:
    "Find answers, browse help topics, and get support for applications, payments, exams, and more on AdmissionX.",
};

const quickTags = [
  { label: "Application Help", icon: "description", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
  { label: "Payments", icon: "payments", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  { label: "Study Abroad", icon: "travel", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
  { label: "Exams", icon: "school", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  { label: "Scholarships", icon: "workspace_premium", color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-100" },
];

const topicCards = [
  {
    title: "Admissions",
    description: "Application process, eligibility, documents, and deadlines.",
    icon: "school",
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
  },
  {
    title: "Payments",
    description: "Refunds, invoices, payment methods, and billing support.",
    icon: "account_balance_wallet",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    title: "Study Abroad",
    description: "Universities, visa help, applications, and counselling.",
    icon: "public",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  {
    title: "Applications",
    description: "Track applications, status updates, and submission issues.",
    icon: "assignment_turned_in",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
  },
  {
    title: "Exams & Results",
    description: "Exam info, admit cards, result updates, and notifications.",
    icon: "emoji_events",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
];

const popularQuestions = [
  "How do I apply to a college on AdmissionX?",
  "How can I download the brochure of a university?",
  "How can I track my application status?",
  "What payment methods do you accept?",
  "How do I reset my account password?",
];

const supportCards = [
  {
    title: "Ask AI Assistant",
    description: "Get instant answers to your questions 24/7 with our virtual guide.",
    cta: "Start Chat",
    href: "/contact-us",
    bg: "from-rose-50 via-white to-rose-100/80",
    border: "border-rose-100",
    accent: "text-rose-600",
    icon: "smart_toy",
  },
  {
    title: "Talk to an Expert",
    description: "Chat, email, or call our support team for personalized help.",
    cta: "Contact Support",
    href: "/contact-us",
    bg: "from-sky-50 via-white to-sky-100/80",
    border: "border-sky-100",
    accent: "text-sky-600",
    icon: "support_agent",
  },
];

const resourceCards = [
  {
    title: "Application Guide",
    description: "Step-by-step help for filling applications correctly and faster.",
    icon: "book_2",
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
  },
  {
    title: "Scholarship Guide",
    description: "Find scholarships, eligibility rules, and tips to apply better.",
    icon: "workspace_premium",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    title: "Study Abroad Guide",
    description: "Universities, visas, documents, and application timelines.",
    icon: "travel_explore",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  {
    title: "Exam Preparation",
    description: "Preparation tips, syllabus links, and important exam updates.",
    icon: "edit_note",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
  },
];

function SectionCard({
  title,
  description,
  icon,
  color,
  bg,
  border,
}: {
  title: string;
  description: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <div
      className={`rounded-[28px] border ${border} bg-white p-6 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.22)] transition-transform duration-200 hover:-translate-y-1`}
    >
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${bg} ${color}`}>
        <span className="material-symbols-outlined text-[24px]">{icon}</span>
      </div>
      <h3 className="text-[18px] font-extrabold text-slate-900">{title}</h3>
      <p className="mt-2 text-[13px] leading-6 text-slate-500">{description}</p>
      <div className={`mt-4 inline-flex items-center gap-2 text-[13px] font-bold ${color}`}>
        Learn more
        <span className="material-symbols-outlined text-[18px]">arrow_right_alt</span>
      </div>
    </div>
  );
}

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-[#f5f2ee]">
      <Header />

      <main className="relative overflow-hidden pt-24 lg:pt-[116px]">
        <div className="absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(245,242,238,0.92)_50%,_rgba(245,242,238,0)_100%)]" />
        <div className="absolute left-[-80px] top-32 h-48 w-48 rounded-full bg-rose-100/60 blur-3xl" />
        <div className="absolute right-[-60px] top-28 h-44 w-44 rounded-full bg-sky-100/70 blur-3xl" />

        <div className="relative w-full pb-20">
          <section className="w-full border-y border-white/70 bg-white/85 px-6 py-10 shadow-[0_32px_80px_-48px_rgba(15,23,42,0.28)] backdrop-blur sm:px-10 sm:py-14">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-rose-500">
                Help Center
              </p>
              <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
                How can we help you today?
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-[15px]">
                Search our articles or browse by category to find the help you need for
                admissions, payments, applications, exams, and support.
              </p>

              <form className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.3)] sm:flex-row">
                <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <span className="material-symbols-outlined text-[20px] text-slate-400">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search applications, colleges, exams, payments..."
                    className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-2xl bg-rose-500 px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-rose-600"
                >
                  Search
                </button>
              </form>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {quickTags.map((tag) => (
                  <span
                    key={tag.label}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${tag.color} ${tag.bg} ${tag.border}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{tag.icon}</span>
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>

            <section className="mt-14">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[24px] font-black text-slate-900">Browse Help Topics</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Pick a category and jump straight to the support you need.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
                {topicCards.map((card) => (
                  <SectionCard key={card.title} {...card} />
                ))}
              </div>
            </section>

            <section className="mt-14 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.25)] sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-[24px] font-black text-slate-900">Popular Questions</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Quick answers to the things students ask us most often.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {popularQuestions.map((question) => (
                    <Link
                      key={question}
                      href="/contact-us"
                      className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4 text-sm font-semibold text-slate-700 transition-colors hover:border-rose-100 hover:bg-rose-50/40"
                    >
                      <span>{question}</span>
                      <span className="material-symbols-outlined text-[18px] text-slate-400">
                        chevron_right
                      </span>
                    </Link>
                  ))}
                </div>

                <Link
                  href="/contact-us"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-rose-500"
                >
                  View all FAQs
                  <span className="material-symbols-outlined text-[18px]">arrow_right_alt</span>
                </Link>
              </div>

              <div className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.25)] sm:p-8">
                <h2 className="text-[24px] font-black text-slate-900">Get Instant Support</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choose the support option that works best for you.
                </p>

                <div className="mt-6 space-y-4">
                  {supportCards.map((card) => (
                    <div
                      key={card.title}
                      className={`rounded-[26px] border ${card.border} bg-gradient-to-br ${card.bg} p-5`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                          <span className={`material-symbols-outlined text-[28px] ${card.accent}`}>
                            {card.icon}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-[17px] font-extrabold text-slate-900">{card.title}</h3>
                          <p className="mt-2 text-[13px] leading-6 text-slate-500">{card.description}</p>
                          <Link
                            href={card.href}
                            className={`mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold shadow-sm ${card.accent}`}
                          >
                            {card.cta}
                            <span className="material-symbols-outlined text-[16px]">
                              arrow_forward
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-14 rounded-[30px] border border-slate-100 bg-white p-6 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.25)] sm:p-8">
              <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <h2 className="text-[24px] font-black text-slate-900">Track Your Support Ticket</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Enter your ticket number and email address to see your latest support updates.
                  </p>
                </div>

                <form className="grid gap-3 sm:grid-cols-3">
                  <input
                    type="text"
                    placeholder="Ticket ID"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    className="rounded-2xl bg-rose-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-rose-600"
                  >
                    Track Ticket
                  </button>
                </form>
              </div>
            </section>

            <section className="mt-14">
              <div className="mb-6">
                <h2 className="text-[24px] font-black text-slate-900">Help & Resources</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Guides and resources to help you move faster with confidence.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {resourceCards.map((card) => (
                  <SectionCard key={card.title} {...card} />
                ))}
              </div>
            </section>

            <section className="mt-14 rounded-[30px] border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-violet-50 p-6 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.25)] sm:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <span className="material-symbols-outlined text-[28px] text-violet-600">
                      groups
                    </span>
                  </div>
                  <div>
                    <h2 className="text-[22px] font-black text-slate-900">
                      Ask the Student Community
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      Join discussions, discover useful advice, and learn from students who
                      have already been through the same process.
                    </p>
                  </div>
                </div>

                <Link
                  href="/contact-us"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-200 bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-sm"
                >
                  Visit Community
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </section>

            <section className="mt-6 rounded-[30px] border border-rose-100 bg-gradient-to-r from-white via-rose-50/60 to-white p-6 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.25)] sm:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50">
                    <span className="material-symbols-outlined text-[28px] text-rose-600">
                      contact_support
                    </span>
                  </div>
                  <div>
                    <h2 className="text-[22px] font-black text-slate-900">
                      Can&apos;t find what you&apos;re looking for?
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      Our support team is here to help with any issue related to your account,
                      application, payments, or college discovery journey.
                    </p>
                  </div>
                </div>

                <Link
                  href="/contact-us"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-rose-600"
                >
                  Contact Us
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </section>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
