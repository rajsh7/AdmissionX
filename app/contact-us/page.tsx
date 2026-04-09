import pool from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Contact Us | AdmissionX",
  description:
    "Get in touch with the AdmissionX team. We're here to help with college admissions, exam guidance, and any platform queries.",
};

// ─── Server Action ────────────────────────────────────────────────────────────

async function submitContactForm(formData: FormData): Promise<void> {
  "use server";

  const fullname     = (formData.get("fullname")     as string ?? "").trim();
  const emailaddress = (formData.get("emailaddress") as string ?? "").trim();
  const mobilenumber = (formData.get("mobilenumber") as string ?? "").trim();
  const subject      = (formData.get("subject")      as string ?? "").trim();
  const message      = (formData.get("message")      as string ?? "").trim();

  if (!fullname || !emailaddress || !message) {
    redirect("/contact-us?error=missing");
  }

  try {
    await pool.query(
      `INSERT INTO landing_page_query_forms
         (fullname, emailaddress, mobilenumber, subject, message, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [fullname, emailaddress, mobilenumber, subject, message],
    );
  } catch (e) {
    console.error("[contact-us submitContactForm]", e);
    redirect("/contact-us?error=server");
  }

  redirect("/contact-us?sent=1");
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ContactUsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp   = await searchParams;
  const sent  = sp.sent  === "1";
  const error = sp.error ?? "";

  const CONTACT_ITEMS = [
    {
      icon: "mail",
      label: "Email Us",
      value: "info@admissionx.in",
      href: "mailto:info@admissionx.in",
      sub: "We reply within 24 hours",
    },
    {
      icon: "support_agent",
      label: "Support",
      value: "support@admissionx.in",
      href: "mailto:support@admissionx.in",
      sub: "For technical issues",
    },
    {
      icon: "apartment",
      label: "Office",
      value: "Mumbai, Maharashtra, India",
      href: null,
      sub: "Mon – Sat, 10 AM – 6 PM",
    },
    {
      icon: "public",
      label: "Website",
      value: "www.admissionx.in",
      href: "https://admissionx.in",
      sub: "Explore the platform",
    },
  ];

  const SUBJECT_OPTIONS = [
    "General Enquiry",
    "College Admission Help",
    "Exam Information",
    "College Partner / Registration",
    "Technical Support",
    "Billing & Payments",
    "Report a Problem",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-neutral-900 pt-24 pb-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="text-neutral-300">Contact Us</span>
          </nav>

          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                <span className="material-symbols-outlined text-[13px]">
                  contact_support
                </span>
                Get in Touch
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
              We&apos;re here to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                help you
              </span>
            </h1>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-lg">
              Have a question about college admissions, exams, or the platform?
              Send us a message and our team will get back to you promptly.
            </p>
          </div>
        </div>
      </div>

      {/* ── Main grid ────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── Left: contact info ─────────────────────────────────────── */}
          <div className="space-y-5">
            <h2 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-1">
              Contact Information
            </h2>

            {CONTACT_ITEMS.map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-2xl border border-neutral-100 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl flex-shrink-0">
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {item.icon}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide mb-0.5">
                    {item.label}
                  </p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-sm font-semibold text-neutral-800 hover:text-blue-600 transition-colors truncate block"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-neutral-800">
                      {item.value}
                    </p>
                  )}
                  <p className="text-xs text-neutral-400 mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}

            {/* Quick links */}
            <div className="bg-neutral-900 rounded-2xl p-5 space-y-3">
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
                Quick Links
              </p>
              {[
                { icon: "quiz",         label: "Browse Exams",      href: "/examination"     },
                { icon: "school",       label: "Find Colleges",     href: "/top-colleges"    },
                { icon: "help_center",  label: "Help Center",       href: "/help-center"     },
                { icon: "article",      label: "Read Blogs",        href: "/education-blogs" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 text-sm text-neutral-300 hover:text-white transition-colors group"
                >
                  <span
                    className="material-symbols-outlined text-[16px] text-neutral-500 group-hover:text-blue-400 transition-colors"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {link.icon}
                  </span>
                  {link.label}
                  <span className="material-symbols-outlined text-[14px] ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    arrow_forward
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Right: form (spans 2 cols) ──────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">

              {/* Form header */}
              <div className="px-6 py-5 border-b border-neutral-100 flex items-center gap-3">
                <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    edit_note
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-black text-neutral-800">
                    Send us a message
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Fill in the form below and we&apos;ll be in touch soon.
                  </p>
                </div>
              </div>

              <div className="px-6 py-6">
                {/* ── Success banner ──────────────────────────────────── */}
                {sent && (
                  <div className="mb-6 flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4">
                    <span
                      className="material-symbols-outlined text-emerald-500 text-[22px] flex-shrink-0 mt-0.5"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    <div>
                      <p className="text-sm font-bold text-emerald-800">
                        Message sent successfully!
                      </p>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        Thank you for reaching out. We&apos;ll get back to you
                        within 24 hours.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Error banner ────────────────────────────────────── */}
                {error && (
                  <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
                    <span
                      className="material-symbols-outlined text-red-500 text-[22px] flex-shrink-0 mt-0.5"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      error
                    </span>
                    <div>
                      <p className="text-sm font-bold text-red-800">
                        {error === "missing"
                          ? "Please fill in all required fields."
                          : "Something went wrong. Please try again."}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Contact form ─────────────────────────────────────── */}
                {!sent && (
                  <form action={submitContactForm} className="space-y-5">
                    {/* Row 1: Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="fullname"
                          className="block text-xs font-bold text-neutral-600 mb-1.5"
                        >
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="fullname"
                          name="fullname"
                          type="text"
                          required
                          placeholder="e.g. Arjun Sharma"
                          className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition placeholder:text-neutral-400"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="emailaddress"
                          className="block text-xs font-bold text-neutral-600 mb-1.5"
                        >
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="emailaddress"
                          name="emailaddress"
                          type="email"
                          required
                          placeholder="you@example.com"
                          className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition placeholder:text-neutral-400"
                        />
                      </div>
                    </div>

                    {/* Row 2: Phone + Subject */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="mobilenumber"
                          className="block text-xs font-bold text-neutral-600 mb-1.5"
                        >
                          Phone Number{" "}
                          <span className="text-neutral-400 font-normal">
                            (optional)
                          </span>
                        </label>
                        <input
                          id="mobilenumber"
                          name="mobilenumber"
                          type="tel"
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition placeholder:text-neutral-400"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="subject"
                          className="block text-xs font-bold text-neutral-600 mb-1.5"
                        >
                          Subject
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition text-neutral-700"
                        >
                          <option value="">Select a subject…</option>
                          {SUBJECT_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="message"
                        className="block text-xs font-bold text-neutral-600 mb-1.5"
                      >
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        placeholder="Describe your query in detail…"
                        className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition resize-none placeholder:text-neutral-400"
                      />
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-between gap-4 pt-1">
                      <p className="text-xs text-neutral-400">
                        <span className="text-red-500">*</span> required fields
                      </p>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-sm shadow-blue-200 whitespace-nowrap"
                      >
                        <span
                          className="material-symbols-outlined text-[17px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          send
                        </span>
                        Send Message
                      </button>
                    </div>
                  </form>
                )}

                {/* After sent — show send another link */}
                {sent && (
                  <div className="text-center py-4">
                    <Link
                      href="/contact-us"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        refresh
                      </span>
                      Send another message
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Response time note */}
            <p className="text-xs text-neutral-400 text-center mt-4">
              Average response time:{" "}
              <strong className="text-neutral-600">under 24 hours</strong> on
              business days.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}




