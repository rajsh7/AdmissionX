import pool from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Contact Us | AdmissionX",
  description:
    "Get in touch with the AdmissionX team. We're here to help with college admissions, exam guidance, and any platform queries.",
};

async function submitContactForm(formData: FormData): Promise<void> {
  "use server";

  const fullname = ((formData.get("fullname") as string) ?? "").trim();
  const emailaddress = ((formData.get("emailaddress") as string) ?? "").trim();
  const mobilenumber = ((formData.get("mobilenumber") as string) ?? "").trim();
  const subject = ((formData.get("subject") as string) ?? "").trim();
  const message = ((formData.get("message") as string) ?? "").trim();

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

const supportHighlights = [
  {
    title: "Quick Response",
    description: "We reply to all inquiries within 24 hours.",
    icon: "schedule",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
  },
  {
    title: "Expert Support",
    description: "Get help from experienced admission experts.",
    icon: "support_agent",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-500",
  },
  {
    title: "Trusted by Thousands",
    description: "Join thousands of students who trust us.",
    icon: "verified",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
  },
];

const contactCards = [
  {
    title: "Call Us",
    value: "+91 98765 43210",
    subtext: "Mon-Sat, 10 AM to 6 PM",
    action: "Call Now",
    href: "tel:+919876543210",
    icon: "call",
    accent: "text-rose-500",
    bg: "bg-rose-50",
  },
  {
    title: "WhatsApp",
    value: "Chat with our team",
    subtext: "Quick support, usually replies fast",
    action: "Chat Now",
    href: "https://wa.me/919876543210",
    icon: "forum",
    accent: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    title: "Email Us",
    value: "info@admissionx.in",
    subtext: "We usually reply within 24 hours",
    action: "Write Email",
    href: "mailto:info@admissionx.in",
    icon: "mail",
    accent: "text-sky-500",
    bg: "bg-sky-50",
  },
  {
    title: "Office Address",
    value: "AdmissionX, Mumbai",
    subtext: "Maharashtra 400001",
    action: "Get Directions",
    href: "/contact-us",
    icon: "location_on",
    accent: "text-violet-500",
    bg: "bg-violet-50",
  },
];

const faqs = [
  "How can I apply to a college?",
  "What documents are required for admission?",
  "Can I get a refund if I cancel my application?",
  "How long does the admission process take?",
  "How can I track my application status?",
];

const subjectOptions = [
  "General Enquiry",
  "College Admission Help",
  "Exam Information",
  "College Partner / Registration",
  "Technical Support",
  "Billing & Payments",
  "Report a Problem",
  "Other",
];

function ContactInfoCard({
  title,
  value,
  subtext,
  action,
  href,
  icon,
  accent,
  bg,
}: {
  title: string;
  value: string;
  subtext: string;
  action: string;
  href: string;
  icon: string;
  accent: string;
  bg: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#efe7e0] bg-white px-5 py-4 shadow-[0_20px_40px_-34px_rgba(15,23,42,0.22)]">
      <div className="flex items-start gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${bg}`}>
          <span className={`material-symbols-outlined text-[20px] ${accent}`}>{icon}</span>
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-slate-900">{title}</p>
          <p className="mt-1 text-[13px] font-semibold text-slate-700">{value}</p>
          <p className="mt-1 text-[11px] leading-5 text-slate-400">{subtext}</p>
          <a
            href={href}
            className={`mt-3 inline-flex items-center gap-1 text-[11px] font-bold ${accent}`}
          >
            {action}
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default async function ContactUsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const sent = sp.sent === "1";
  const error = sp.error ?? "";

  return (
    <div className="min-h-screen bg-[#f7f3ef]">
      <Header />

      <main className="relative overflow-hidden pt-24 lg:pt-[116px]">
        <div className="absolute inset-x-0 top-0 h-[260px] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(247,243,239,0.92)_50%,_rgba(247,243,239,0)_100%)]" />
        <div className="absolute right-0 top-16 h-72 w-72 rounded-full bg-rose-100/50 blur-3xl" />
        <div className="absolute left-10 top-44 h-56 w-56 rounded-full bg-sky-100/40 blur-3xl" />

        <div className="relative w-full">
          <div className="overflow-hidden border-y border-[#ece5de] bg-white/90 shadow-[0_30px_90px_-50px_rgba(15,23,42,0.28)] backdrop-blur">
            <section className="relative px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
              <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_top_right,_rgba(251,113,133,0.12),_rgba(255,255,255,0)_60%)]" />

              <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
                <div className="relative text-center lg:text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-rose-500">
                    Contact Us
                  </p>
                  <h1 className="mt-4 mx-auto max-w-md text-[34px] font-black leading-[1.05] text-slate-900 sm:text-[42px] lg:mx-0">
                    We&apos;re here to help you
                  </h1>
                  <p className="mt-4 mx-auto max-w-lg text-[14px] leading-7 text-slate-500 lg:mx-0">
                    Have a question or need assistance? Our team is ready to help you
                    with anything from admissions and exams to account and platform support.
                  </p>

                  <div className="mt-7 space-y-4">
                    {supportHighlights.map((item) => (
                      <div key={item.title} className="flex items-start gap-3 text-left">
                        <div
                          className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-full ${item.iconBg}`}
                        >
                          <span
                            className={`material-symbols-outlined text-[18px] ${item.iconColor}`}
                          >
                            {item.icon}
                          </span>
                        </div>
                        <div>
                          <h2 className="text-[14px] font-bold text-slate-900">{item.title}</h2>
                          <p className="mt-1 text-[12px] leading-6 text-slate-500">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative rounded-[26px] border border-[#efe7e0] bg-white p-5 shadow-[0_22px_60px_-36px_rgba(15,23,42,0.24)] sm:p-6">
                  <h2 className="text-[18px] font-black text-slate-900">Send us a Message</h2>

                  {sent && (
                    <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <p className="text-[13px] font-bold text-emerald-800">
                        Message sent successfully.
                      </p>
                      <p className="mt-1 text-[12px] text-emerald-700">
                        Our team will get back to you within 24 hours.
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                      <p className="text-[13px] font-bold text-red-800">
                        {error === "missing"
                          ? "Please fill in all required fields."
                          : "Something went wrong. Please try again."}
                      </p>
                    </div>
                  )}

                  {!sent ? (
                    <form action={submitContactForm} className="mt-5 space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          name="fullname"
                          type="text"
                          required
                          placeholder="Full Name"
                          className="w-full rounded-[14px] border border-[#ece6e0] bg-[#fcfaf8] px-4 py-3 text-[13px] text-slate-700 outline-none transition focus:border-rose-300 focus:bg-white"
                        />
                        <input
                          name="emailaddress"
                          type="email"
                          required
                          placeholder="Email Address"
                          className="w-full rounded-[14px] border border-[#ece6e0] bg-[#fcfaf8] px-4 py-3 text-[13px] text-slate-700 outline-none transition focus:border-rose-300 focus:bg-white"
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          name="mobilenumber"
                          type="tel"
                          placeholder="Phone Number"
                          className="w-full rounded-[14px] border border-[#ece6e0] bg-[#fcfaf8] px-4 py-3 text-[13px] text-slate-700 outline-none transition focus:border-rose-300 focus:bg-white"
                        />
                        <select
                          name="subject"
                          className="w-full rounded-[14px] border border-[#ece6e0] bg-[#fcfaf8] px-4 py-3 text-[13px] text-slate-700 outline-none transition focus:border-rose-300 focus:bg-white"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Subject
                          </option>
                          {subjectOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <textarea
                        name="message"
                        required
                        rows={5}
                        placeholder="How can we help you?"
                        className="w-full resize-none rounded-[16px] border border-[#ece6e0] bg-[#fcfaf8] px-4 py-3 text-[13px] text-slate-700 outline-none transition focus:border-rose-300 focus:bg-white"
                      />

                      <button
                        type="submit"
                        className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#ff3b30] px-5 py-3 text-[13px] font-bold text-white transition-colors hover:bg-[#ef3126]"
                      >
                        Send Message
                        <span className="material-symbols-outlined text-[16px]">send</span>
                      </button>

                      <p className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="material-symbols-outlined text-[14px]">info</span>
                        Your information is safe with us. We&apos;ll never share your data.
                      </p>
                    </form>
                  ) : (
                    <div className="mt-5">
                      <Link
                        href="/contact-us"
                        className="inline-flex items-center gap-2 text-[13px] font-bold text-rose-500"
                      >
                        Send another message
                        <span className="material-symbols-outlined text-[16px]">refresh</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="border-t border-[#f2ebe5] px-5 py-6 sm:px-8 lg:px-10">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {contactCards.map((card) => (
                  <ContactInfoCard key={card.title} {...card} />
                ))}
              </div>
            </section>

            <section className="border-t border-[#f2ebe5] px-5 py-7 sm:px-8 lg:px-10">
              <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
                <div>
                  <h2 className="text-[18px] font-black text-slate-900">
                    Frequently Asked Questions
                  </h2>

                  <div className="mt-4 space-y-3">
                    {faqs.map((faq) => (
                      <Link
                        key={faq}
                        href="/help-center"
                        className="flex items-center justify-between rounded-[16px] border border-[#eee7e1] bg-white px-4 py-3 text-[13px] font-medium text-slate-700 transition-colors hover:border-rose-200 hover:bg-rose-50/40"
                      >
                        <span>{faq}</span>
                        <span className="material-symbols-outlined text-[18px] text-slate-400">
                          chevron_right
                        </span>
                      </Link>
                    ))}
                  </div>

                  <Link
                    href="/help-center"
                    className="mt-4 inline-flex items-center gap-2 text-[12px] font-bold text-[#ff3b30]"
                  >
                    View all FAQs
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>

                <div>
                  <h2 className="text-[18px] font-black text-slate-900">Our Office</h2>

                  <div className="mt-4 overflow-hidden rounded-[20px] border border-[#eee7e1] bg-white shadow-[0_18px_40px_-34px_rgba(15,23,42,0.22)]">
                    <div className="relative h-[210px] overflow-hidden bg-[linear-gradient(0deg,rgba(245,241,235,0.95),rgba(245,241,235,0.95)),linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:100%_100%,36px_36px,36px_36px] bg-center">
                      <div className="absolute left-[14%] top-[22%] h-24 w-[1px] rotate-[18deg] bg-slate-300/50" />
                      <div className="absolute left-[34%] top-[6%] h-[260px] w-[1px] rotate-[8deg] bg-slate-300/50" />
                      <div className="absolute left-[58%] top-[12%] h-28 w-[1px] -rotate-[24deg] bg-slate-300/50" />
                      <div className="absolute left-[8%] top-[38%] h-[1px] w-[84%] -rotate-[6deg] bg-slate-300/50" />
                      <div className="absolute left-[20%] top-[62%] h-[1px] w-[56%] rotate-[10deg] bg-slate-300/50" />
                      <div className="absolute left-[68%] top-[36%] flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg">
                        <span className="material-symbols-outlined text-[26px] text-[#ff3b30]">
                          location_on
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 border-t border-[#f2ebe5] px-4 py-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50">
                        <span className="material-symbols-outlined text-[20px] text-rose-500">
                          apartment
                        </span>
                      </div>
                      <div>
                        <h3 className="text-[13px] font-bold text-slate-900">
                          AdmissionX Head Office
                        </h3>
                        <p className="mt-1 text-[12px] leading-6 text-slate-500">
                          123 Education Street, Mumbai,
                          <br />
                          Maharashtra 400001, India
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="border-t border-[#f2ebe5] px-5 py-7 sm:px-8 lg:px-10">
              <div className="flex flex-col gap-5 rounded-[24px] border border-[#f1d8d2] bg-[linear-gradient(90deg,rgba(255,247,244,0.95),rgba(255,255,255,0.98),rgba(255,244,244,0.95))] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <span className="material-symbols-outlined text-[22px] text-[#ff3b30]">
                      support_agent
                    </span>
                  </div>
                  <div>
                    <h2 className="text-[16px] font-black text-slate-900">
                      Need help immediately?
                    </h2>
                    <p className="mt-1 text-[12px] leading-6 text-slate-500">
                      Chat with our support team for quick answers to your questions.
                    </p>
                  </div>
                </div>

                <Link
                  href="/contact-us"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#ffb8b1] bg-white px-5 py-2.5 text-[12px] font-bold text-[#ff3b30]"
                >
                  Chat Live Now
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
