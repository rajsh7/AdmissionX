"use client";

import { useState, useEffect, useRef } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props { college: CollegeUser }

const FILL = { fontVariationSettings: "'FILL' 1" };

const TERMS_SECTIONS = [
  {
    icon: "info",
    title: "1. Acceptance of Terms",
    body: "By registering and using the AdmissionX platform as a college partner, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you must discontinue use of the platform immediately. These terms apply to all users of the college dashboard including administrators and authorised staff.",
  },
  {
    icon: "manage_accounts",
    title: "2. Account Registration & Security",
    body: "You are responsible for maintaining the confidentiality of your login credentials. You must notify AdmissionX immediately of any unauthorised use of your account. AdmissionX will not be liable for any loss resulting from unauthorised use of your account. Each institution may only maintain one active college account.",
  },
  {
    icon: "edit_document",
    title: "3. Accurate Information",
    body: "You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate. AdmissionX reserves the right to suspend or terminate accounts found to contain false, misleading, or outdated information that may harm students or the platform.",
  },
  {
    icon: "school",
    title: "4. Use of Platform",
    body: "The platform may only be used for lawful purposes related to college admissions, student engagement, and institutional promotion. You may not use the platform to: (a) send unsolicited communications; (b) collect student data for purposes other than admissions; (c) post content that is defamatory, obscene, or violates any law; (d) interfere with the platform's operation.",
  },
  {
    icon: "payments",
    title: "5. Fees & Payments",
    body: "Access to certain features of the platform may require payment of fees as per the pricing plan selected. All fees are non-refundable unless otherwise stated. AdmissionX reserves the right to change pricing with 30 days notice. Failure to pay applicable fees may result in suspension of premium features.",
  },
  {
    icon: "photo_library",
    title: "6. Content & Intellectual Property",
    body: "You retain ownership of all content you upload to the platform. By uploading content, you grant AdmissionX a worldwide, non-exclusive, royalty-free licence to use, display, and distribute such content for platform purposes. You must not upload content that infringes third-party intellectual property rights.",
  },
  {
    icon: "privacy_tip",
    title: "7. Privacy & Data Protection",
    body: "AdmissionX collects and processes data in accordance with its Privacy Policy. As a college partner, you are responsible for ensuring that your use of student data obtained through the platform complies with applicable data protection laws including the Information Technology Act, 2000 and any applicable data protection regulations.",
  },
  {
    icon: "verified_user",
    title: "8. Student Interactions",
    body: "You agree to interact with students professionally and ethically. You must respond to student queries within a reasonable timeframe. You must not discriminate against students on the basis of caste, religion, gender, disability, or any other protected characteristic. Misleading students about courses, fees, or placements is strictly prohibited.",
  },
  {
    icon: "block",
    title: "9. Prohibited Activities",
    body: "The following activities are strictly prohibited: (a) creating fake reviews or ratings; (b) manipulating application data; (c) accessing other institutions' data without authorisation; (d) reverse engineering the platform; (e) using automated tools to scrape data; (f) any activity that violates applicable law or harms other users.",
  },
  {
    icon: "gavel",
    title: "10. Suspension & Termination",
    body: "AdmissionX reserves the right to suspend or terminate your account at any time for violation of these terms, fraudulent activity, or conduct detrimental to students or the platform. Upon termination, your right to access the platform ceases immediately. Data may be retained as required by law.",
  },
  {
    icon: "balance",
    title: "11. Disclaimer of Warranties",
    body: "The platform is provided on an 'as is' and 'as available' basis without warranties of any kind. AdmissionX does not warrant that the platform will be uninterrupted, error-free, or free of viruses. AdmissionX disclaims all warranties, express or implied, including merchantability and fitness for a particular purpose.",
  },
  {
    icon: "shield",
    title: "12. Limitation of Liability",
    body: "To the maximum extent permitted by law, AdmissionX shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount paid by you to AdmissionX in the three months preceding the claim.",
  },
  {
    icon: "update",
    title: "13. Changes to Terms",
    body: "AdmissionX may update these Terms and Conditions at any time. We will notify you of significant changes via email or a prominent notice on the platform. Your continued use of the platform after changes are posted constitutes your acceptance of the revised terms.",
  },
  {
    icon: "location_city",
    title: "14. Governing Law",
    body: "These Terms and Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in New Delhi, India. You agree to submit to personal jurisdiction in such courts for the purpose of litigating any such claim.",
  },
  {
    icon: "contact_support",
    title: "15. Contact Us",
    body: "If you have any questions about these Terms and Conditions, please contact us at legal@admissionx.in or write to AdmissionX Technologies Pvt. Ltd., New Delhi, India. We aim to respond to all queries within 5 business days.",
  },
];

export default function TermsTab({ college }: Props) {
  const [accepted, setAccepted] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const slug = college.slug;

  useEffect(() => {
    fetch(`/api/college/dashboard/${slug}/terms`)
      .then(r => r.json())
      .then(d => {
        setAccepted(d.accepted ?? false);
        setAcceptedAt(d.accepted_at ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      setScrolledToBottom(true);
    }
  }

  async function handleAccept() {
    if (!scrolledToBottom) { setError("Please scroll through all the terms before accepting."); return; }
    setError("");
    setAccepting(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/terms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accepted: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setAccepted(true);
      setAcceptedAt(new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept terms");
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-100 rounded-xl w-64" />
        <div className="h-96 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="pb-24 font-poppins space-y-6 max-w-4xl">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="w-1.5 h-6 bg-[#FF3D3D] rounded-full" />
          <h2 className="text-[24px] font-black text-slate-800 uppercase tracking-tight">Terms & Conditions</h2>
        </div>
        <p className="text-slate-500 text-sm font-medium">
          Please read all terms carefully. You must accept these terms to use the AdmissionX College Dashboard.
        </p>
      </div>

      {/* Accepted banner */}
      {accepted && acceptedAt && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[26px] text-emerald-600" style={FILL}>task_alt</span>
          </div>
          <div>
            <p className="font-black text-emerald-800">Terms & Conditions Accepted</p>
            <p className="text-sm text-emerald-700 mt-0.5">
              Accepted by <strong>{college.name || college.email}</strong> on {acceptedAt}
            </p>
          </div>
          <span className="ml-auto text-[10px] font-black text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-full uppercase tracking-wider shrink-0">
            Active
          </span>
        </div>
      )}

      {/* Success toast */}
      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-center gap-3 text-emerald-700">
          <span className="material-symbols-outlined text-xl" style={FILL}>check_circle</span>
          <span className="text-sm font-bold">Terms accepted successfully!</span>
        </div>
      )}

      {/* Last updated notice */}
      <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
        <span className="material-symbols-outlined text-[18px] text-blue-500" style={FILL}>info</span>
        <p className="text-xs font-semibold text-blue-700">
          Last updated: <strong>January 1, 2025</strong> &nbsp;·&nbsp; Version 1.0 &nbsp;·&nbsp; Effective immediately upon acceptance
        </p>
      </div>

      {/* Terms document */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Doc header */}
        <div className="bg-[#1e293b] px-8 py-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-[28px] text-white/80" style={FILL}>gavel</span>
            <div>
              <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest">AdmissionX Platform</p>
              <h3 className="text-xl font-black text-white">Terms & Conditions</h3>
            </div>
          </div>
          <p className="text-[12px] text-white/50 mt-1">
            These terms govern your use of the AdmissionX College Dashboard and all associated services.
          </p>
        </div>

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-[520px] overflow-y-auto"
          style={{ scrollbarWidth: "thin" }}
        >
          {/* Intro */}
          <div className="px-8 pt-6 pb-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <p className="text-sm leading-relaxed text-slate-600">
                Welcome to AdmissionX. These Terms and Conditions govern your use of the AdmissionX College Dashboard
                and all related services provided by <strong>AdmissionX Technologies Pvt. Ltd.</strong> By accessing
                or using our platform, you agree to be bound by these terms. Please read them carefully.
              </p>
            </div>
          </div>

          {/* Accordion sections */}
          <div className="px-8 pb-6 space-y-2">
            {TERMS_SECTIONS.map((section, i) => (
              <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === i ? null : i)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[16px] text-slate-500" style={FILL}>{section.icon}</span>
                  </div>
                  <span className="flex-1 font-bold text-slate-800 text-sm">{section.title}</span>
                  <span className={`material-symbols-outlined text-[20px] text-slate-400 transition-transform ${openSection === i ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                </button>
                {openSection === i && (
                  <div className="px-5 pb-5 pt-1 bg-slate-50/50 border-t border-slate-100">
                    <p className="text-sm leading-relaxed text-slate-600">{section.body}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          {!scrolledToBottom && (
            <div className="flex items-center justify-center gap-2 py-6 text-slate-400">
              <span className="material-symbols-outlined text-[18px] animate-bounce">keyboard_arrow_down</span>
              <span className="text-xs font-semibold">Scroll to read all terms</span>
            </div>
          )}
        </div>

        {/* Scroll progress bar */}
        <div className="px-8 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full shrink-0 ${scrolledToBottom ? "bg-emerald-500" : "bg-slate-300"}`} />
          <span className={`text-xs font-bold ${scrolledToBottom ? "text-emerald-600" : "text-slate-400"}`}>
            {scrolledToBottom ? "You have read all the terms" : "Please scroll to the bottom to continue"}
          </span>
        </div>
      </div>

      {/* Accept section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[22px] text-[#FF3D3D]" style={FILL}>fact_check</span>
          <h3 className="font-black text-slate-800 text-base">
            {accepted ? "Terms Accepted" : "Accept Terms & Conditions"}
          </h3>
        </div>

        {!accepted ? (
          <>
            {/* Scroll warning */}
            {!scrolledToBottom && (
              <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
                <span className="material-symbols-outlined text-[18px]" style={FILL}>warning</span>
                <span className="text-xs font-bold">Please scroll through all the terms above before accepting.</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600">
                <span className="material-symbols-outlined text-[18px]" style={FILL}>error</span>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Summary of what they agree to */}
            <div className="space-y-2">
              {[
                "I have read and understood all the Terms and Conditions",
                "I agree to provide accurate and up-to-date institutional information",
                "I agree to interact with students professionally and ethically",
                "I understand that violation of these terms may result in account suspension",
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                  <span className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${scrolledToBottom ? "text-emerald-500" : "text-slate-300"}`} style={FILL}>
                    {scrolledToBottom ? "check_circle" : "radio_button_unchecked"}
                  </span>
                  <span className="text-sm text-slate-600 font-medium">{point}</span>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 text-slate-400 pt-1">
              <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">info</span>
              <p className="text-[11px] leading-relaxed">
                By clicking &ldquo;Accept Terms&rdquo;, you confirm that you have read, understood, and agree to be bound
                by these Terms and Conditions on behalf of your institution. Your acceptance will be recorded with a timestamp.
              </p>
            </div>

            <button
              onClick={handleAccept}
              disabled={accepting || !scrolledToBottom}
              className="w-full flex items-center justify-center gap-3 py-4 bg-[#1e293b] hover:bg-slate-700 text-white font-black text-sm rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
              {accepting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Accepting…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]" style={FILL}>fact_check</span>
                  Accept Terms & Conditions
                </>
              )}
            </button>
          </>
        ) : (
          /* Already accepted */
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Accepted By",  value: college.name || college.email, icon: "person" },
                { label: "Accepted On",  value: acceptedAt ?? "—",             icon: "calendar_today" },
                { label: "Version",      value: "Version 1.0",                 icon: "description" },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="material-symbols-outlined text-[18px] text-slate-400 shrink-0 mt-0.5" style={FILL}>{item.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <p className="text-sm font-bold text-slate-700 mt-0.5 truncate">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="material-symbols-outlined text-[16px] text-slate-400">info</span>
              <p className="text-xs text-slate-500 font-medium">
                You will be notified by email if these terms are updated. Continued use of the platform constitutes acceptance of any revised terms.
              </p>
            </div>

            {/* Re-accept option */}
            <details>
              <summary className="text-xs font-bold text-slate-400 cursor-pointer hover:text-slate-600 transition-colors select-none">
                Re-accept updated terms?
              </summary>
              <div className="mt-3">
                {!scrolledToBottom && (
                  <p className="text-xs text-amber-600 font-semibold mb-3">
                    Please scroll through the terms document above first.
                  </p>
                )}
                <button
                  onClick={handleAccept}
                  disabled={accepting || !scrolledToBottom}
                  className="flex items-center gap-2 px-6 py-2.5 bg-slate-700 text-white text-sm font-bold rounded-xl disabled:opacity-40 hover:bg-slate-800 transition-colors"
                >
                  {accepting ? "Updating…" : "Re-accept Terms"}
                </button>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
