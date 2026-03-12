import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Disclaimer | AdmissionX",
  description:
    "Read the AdmissionX disclaimer. Understand the limitations of information provided on our platform regarding college admissions, fees, and exam details.",
};

// ─── Last Updated ─────────────────────────────────────────────────────────────

const LAST_UPDATED = "June 1, 2025";

// ─── Sections ─────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: "general",
    title: "1. General Information Only",
    body: [
      "The information provided on AdmissionX (admissionx.in) is intended for general informational and educational guidance purposes only. It does not constitute professional advice of any kind, including but not limited to legal, financial, academic, or career advice.",
      "While we make every effort to keep the information accurate, up to date, and complete, we make no representations or warranties of any kind — express or implied — about the completeness, accuracy, reliability, suitability, or availability of any information, products, services, or related graphics contained on the platform for any purpose.",
    ],
  },
  {
    id: "accuracy",
    title: "2. Accuracy of Information",
    body: [
      "AdmissionX aggregates data from multiple sources including official college websites, regulatory bodies, third-party databases, and user-submitted content. Although we strive for accuracy, we cannot guarantee that all information is current, complete, or error-free.",
      "College-specific information such as course availability, fee structures, seat availability, eligibility criteria, cutoff ranks, placement statistics, faculty details, and infrastructure may change without notice. Such changes are at the sole discretion of the respective educational institutions.",
      "Exam-related information including application dates, exam schedules, syllabi, result announcements, and counselling procedures is subject to updates by the conducting bodies. Always verify this information directly with the official examination authority or institution.",
    ],
  },
  {
    id: "fees",
    title: "3. Fee and Financial Information",
    body: [
      "All fee information displayed on AdmissionX — including tuition fees, hostel charges, examination fees, and other costs — is indicative only. Actual fees charged by institutions may differ and are subject to revision by the respective institutions, state governments, or regulatory bodies such as UGC, AICTE, MCI/NMC, BCI, etc.",
      "AdmissionX does not accept responsibility for any financial decisions made based on the fee information available on this platform. Students and parents are strongly advised to verify all costs directly with the institution before making any financial commitment.",
    ],
  },
  {
    id: "admissions",
    title: "4. No Guarantee of Admission",
    body: [
      "AdmissionX is an information and discovery platform. Using our platform, registering on our website, or submitting an application through our system does not guarantee admission to any college, university, course, or programme.",
      "Admission decisions are made solely by the respective educational institutions based on their own criteria, which may include entrance exam scores, merit, interviews, documents, and other factors beyond our control or knowledge.",
      "We do not represent, act on behalf of, or have any formal affiliation with any educational institution unless expressly stated. Any institution listed on our platform is listed for informational purposes only.",
    ],
  },
  {
    id: "external-links",
    title: "5. External Links and Third-Party Content",
    body: [
      "AdmissionX may contain links to external websites, official college portals, examination authority websites, and other third-party resources. These links are provided for convenience and informational purposes only.",
      "We have no control over the content, privacy policies, or practices of any third-party websites. We do not accept any responsibility or liability for any loss or damage that may arise from your use of those websites.",
      "The inclusion of any link does not necessarily imply a recommendation or endorsement of the views expressed within them.",
    ],
  },
  {
    id: "rankings",
    title: "6. Rankings and Ratings",
    body: [
      "College rankings, ratings, and comparative data displayed on AdmissionX may be sourced from government bodies (such as NIRF), accreditation organisations, third-party surveys, or our own internal algorithms based on available data points.",
      "Rankings are inherently subjective and may not reflect the actual quality of education or student experience at a given institution. Different students have different needs, and a top-ranked college in one category may not be the best fit for every individual.",
      "We strongly recommend that students conduct their own independent research, speak to alumni, visit campuses where possible, and consult qualified counsellors before making any college selection decision.",
    ],
  },
  {
    id: "user-content",
    title: "7. User-Generated Content",
    body: [
      "AdmissionX may display reviews, questions, answers, and other content submitted by registered users including students, alumni, and college representatives. This user-generated content represents the personal opinions of the authors and does not reflect the views of AdmissionX.",
      "We do not verify the accuracy or authenticity of user-submitted reviews or testimonials. AdmissionX reserves the right, but is not obligated, to review, edit, or remove any user-generated content that violates our terms of service or is otherwise deemed inappropriate.",
    ],
  },
  {
    id: "professional-advice",
    title: "8. No Substitute for Professional Counselling",
    body: [
      "The tools, calculators, career assessment quizzes, and college match features available on AdmissionX are provided as self-help aids only. They are not a substitute for personalised advice from a qualified educational counsellor, psychologist, or career guidance professional.",
      "Decisions about education, career paths, and financial investments in education are significant and should be made with careful consideration, ideally with support from qualified professionals who understand your individual circumstances.",
    ],
  },
  {
    id: "liability",
    title: "9. Limitation of Liability",
    body: [
      "To the maximum extent permitted by applicable law, AdmissionX and its officers, employees, agents, partners, and content providers shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from:",
      "— Your use of or inability to use the platform or any content on it",
      "— Any decision you make based on information obtained from the platform",
      "— Errors, omissions, interruptions, deletion of files, defects, delays in operation, or any failure of performance",
      "— Any college admission outcome or academic result",
      "In jurisdictions that do not allow the exclusion or limitation of incidental or consequential damages, the above limitation may not apply to you.",
    ],
  },
  {
    id: "changes",
    title: "10. Changes to This Disclaimer",
    body: [
      "AdmissionX reserves the right to update or modify this disclaimer at any time without prior notice. Changes will be effective immediately upon posting to the website. The 'Last Updated' date at the top of this page will reflect the most recent revision.",
      "Your continued use of the AdmissionX platform after any changes have been posted constitutes your acceptance of the updated disclaimer. We encourage you to review this page periodically.",
    ],
  },
  {
    id: "contact",
    title: "11. Contact Us",
    body: [
      "If you have questions or concerns about any information displayed on AdmissionX, or if you are an institution and believe any information about your college is inaccurate, please contact us. We are committed to maintaining accurate and fair representations of all institutions.",
      "Email: legal@admissionx.in | Support: support@admissionx.in",
      "AdmissionX, India",
    ],
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* ── Hero ── */}
      <div className="bg-neutral-900 pt-24 pb-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="text-neutral-300">Disclaimer</span>
          </nav>

          <div className="flex items-start gap-4">
            <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 items-center justify-center flex-shrink-0 mt-1">
              <span
                className="material-symbols-outlined text-[22px] text-orange-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                warning
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                  Legal
                </span>
                <span className="text-xs text-neutral-500">
                  Last updated: {LAST_UPDATED}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
                Disclaimer
              </h1>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl">
                Please read this disclaimer carefully before using the
                AdmissionX platform. By accessing our services, you acknowledge
                and agree to the limitations described herein.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick-nav strip ── */}
      <div className="bg-white border-b border-neutral-100 sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex-shrink-0 text-[11px] font-semibold text-neutral-500 hover:text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
              >
                {s.title.replace(/^\d+\.\s/, "")}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">

          {/* Notice banner */}
          <div className="bg-orange-50 border-b border-orange-100 px-8 py-4 flex items-start gap-3">
            <span
              className="material-symbols-outlined text-[18px] text-orange-500 flex-shrink-0 mt-0.5"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              info
            </span>
            <p className="text-sm text-orange-800 leading-relaxed">
              <strong>Important:</strong> AdmissionX is an information platform.
              All college, exam, and career data should be independently verified
              with the respective institutions before making any academic or
              financial decision.
            </p>
          </div>

          <div className="px-8 sm:px-10 py-10 space-y-10">
            {SECTIONS.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-20">
                <h2 className="text-lg font-black text-neutral-900 mb-4 pb-2 border-b border-neutral-100">
                  {section.title}
                </h2>
                <div className="space-y-3">
                  {section.body.map((para, i) => (
                    <p
                      key={i}
                      className={`text-sm leading-relaxed ${
                        para.startsWith("—")
                          ? "text-neutral-600 pl-4 border-l-2 border-orange-200"
                          : "text-neutral-600"
                      }`}
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            ))}

            {/* Divider */}
            <div className="border-t border-neutral-100 pt-8">
              <p className="text-xs text-neutral-400 text-center">
                This disclaimer was last updated on{" "}
                <strong className="text-neutral-600">{LAST_UPDATED}</strong>.
                AdmissionX reserves the right to update this disclaimer at any
                time. Continued use of the platform constitutes acceptance of
                the current version.
              </p>
            </div>
          </div>
        </div>

        {/* ── Related legal links ── */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Privacy Policy",
              desc: "How we handle your data",
              href: "/privacy-policy",
              icon: "lock",
              color: "text-blue-600",
              bg: "bg-blue-50",
              border: "border-blue-100",
            },
            {
              label: "Terms & Conditions",
              desc: "Rules for using our platform",
              href: "/terms-and-conditions",
              icon: "gavel",
              color: "text-violet-600",
              bg: "bg-violet-50",
              border: "border-violet-100",
            },
            {
              label: "Cancellation & Refunds",
              desc: "Subscription and refund policy",
              href: "/cancellation-refunds",
              icon: "receipt",
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              border: "border-emerald-100",
            },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`bg-white rounded-2xl border ${link.border} p-5 flex items-center gap-4 hover:shadow-md transition-all group`}
            >
              <div className={`${link.bg} ${link.color} p-2.5 rounded-xl flex-shrink-0`}>
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {link.icon}
                </span>
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-bold ${link.color} group-hover:underline`}>
                  {link.label}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">{link.desc}</p>
              </div>
              <span
                className={`material-symbols-outlined text-[18px] ${link.color} ml-auto opacity-0 group-hover:opacity-100 transition-opacity`}
              >
                arrow_forward
              </span>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
