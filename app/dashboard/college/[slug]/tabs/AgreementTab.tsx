"use client";

import { useState, useEffect, useRef } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props { college: CollegeUser }

interface AgreementStatus {
  signed: boolean;
  agreement: {
    signed_at: string | null;
    signed_by_name: string;
    signed_by_email: string;
    ip_address: string;
    version: string;
  } | null;
}

const FILL = { fontVariationSettings: "'FILL' 1" };

const AGREEMENT_CLAUSES = [
  {
    title: '1. Partnership Overview',
    body: 'This College Partner Agreement ("Agreement") is entered into between AdmissionX ("Platform") and the college/institution ("Partner") accessing the AdmissionX College Dashboard. By signing this Agreement, the Partner acknowledges and agrees to the terms and conditions set forth herein.',
  },
  {
    title: '2. Platform Services',
    body: 'AdmissionX provides the Partner with access to a digital dashboard to manage college profile information, student applications, queries, reviews, FAQs, events, placements, and other institutional data. The Platform reserves the right to modify, suspend, or discontinue any feature with reasonable notice.',
  },
  {
    title: '3. Partner Obligations',
    body: 'The Partner agrees to: (a) provide accurate, complete, and up-to-date information about the institution; (b) respond to student queries and applications in a timely manner; (c) not misrepresent courses, fees, placements, or any other institutional data; (d) comply with all applicable laws and regulations governing educational institutions in India.',
  },
  {
    title: '4. Data Accuracy & Responsibility',
    body: 'The Partner is solely responsible for the accuracy of all data published on the Platform. AdmissionX shall not be held liable for any loss, damage, or claim arising from inaccurate, misleading, or incomplete information provided by the Partner. The Partner indemnifies AdmissionX against any third-party claims arising from such data.',
  },
  {
    title: '5. Student Applications & Fees',
    body: 'The Partner agrees to process student applications received through the Platform in good faith. Any application fees collected through the Platform are subject to the fee-sharing arrangement agreed upon separately. The Partner shall not charge students any undisclosed fees beyond what is listed on the Platform.',
  },
  {
    title: '6. Intellectual Property',
    body: "The Partner grants AdmissionX a non-exclusive, royalty-free license to display, reproduce, and distribute the Partner's name, logo, images, and institutional content on the Platform for the purpose of promoting the institution to prospective students. The Partner retains ownership of all submitted content.",
  },
  {
    title: '7. Confidentiality',
    body: "Both parties agree to keep confidential any proprietary information shared during the course of this partnership. Student personal data collected through the Platform shall be handled in accordance with applicable data protection laws and AdmissionX's Privacy Policy.",
  },
  {
    title: '8. Term & Termination',
    body: "This Agreement is effective from the date of signing and continues until terminated by either party with 30 days' written notice. AdmissionX reserves the right to immediately terminate access in case of breach of these terms, fraudulent activity, or conduct harmful to students or the Platform's reputation.",
  },
  {
    title: '9. Limitation of Liability',
    body: "AdmissionX's total liability to the Partner under this Agreement shall not exceed the fees paid by the Partner to AdmissionX in the preceding three months. AdmissionX shall not be liable for indirect, incidental, or consequential damages of any kind.",
  },
  {
    title: '10. Governing Law & Dispute Resolution',
    body: 'This Agreement shall be governed by the laws of India. Any disputes arising out of or in connection with this Agreement shall first be attempted to be resolved through mutual negotiation. If unresolved within 30 days, disputes shall be referred to arbitration in accordance with the Arbitration and Conciliation Act, 1996, with the seat of arbitration in New Delhi.',
  },
  {
    title: '11. Amendments',
    body: 'AdmissionX reserves the right to amend this Agreement at any time. The Partner will be notified of material changes via the registered email address. Continued use of the Platform after notification constitutes acceptance of the amended terms.',
  },
  {
    title: '12. Entire Agreement',
    body: 'This Agreement constitutes the entire understanding between the parties with respect to its subject matter and supersedes all prior agreements, representations, and understandings. If any provision is found to be unenforceable, the remaining provisions shall continue in full force and effect.',
  },
];

export default function AgreementTab({ college }: Props) {
  const slug = college.slug;
  const [status, setStatus] = useState<AgreementStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sign form
  const [signatoryName, setSignatoryName] = useState(college.name ?? "");
  const [agreed, setAgreed] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/college/dashboard/${slug}/agreement`)
      .then(r => r.json())
      .then(d => setStatus(d))
      .catch(() => setError("Failed to load agreement status"))
      .finally(() => setLoading(false));
  }, [slug]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      setScrolledToBottom(true);
    }
  }

  async function handleSign(e: React.FormEvent) {
    e.preventDefault();
    setSignError("");
    if (!signatoryName.trim()) { setSignError("Please enter the authorised signatory name."); return; }
    if (!agreed) { setSignError("You must read and agree to the terms before signing."); return; }
    if (!scrolledToBottom) { setSignError("Please scroll through the entire agreement before signing."); return; }

    setSigning(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/agreement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signed_by_name: signatoryName.trim(), agreed: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to sign");
      setShowSuccess(true);
      // Reload status
      const r2 = await fetch(`/api/college/dashboard/${slug}/agreement`);
      setStatus(await r2.json());
    } catch (err) {
      setSignError(err instanceof Error ? err.message : "Failed to sign");
    } finally {
      setSigning(false);
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

  if (error) {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-red-700">
        <span className="material-symbols-outlined text-xl">error</span>
        <span className="text-sm font-medium">{error}</span>
      </div>
    );
  }

  return (
    <div className="pb-24 font-poppins space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="w-1.5 h-6 bg-[#FF3D3D] rounded-full" />
          <h2 className="text-[24px] font-black text-slate-800 uppercase tracking-tight">College Partner Agreement</h2>
        </div>
        <p className="text-slate-500 text-sm font-medium">
          Please read the agreement carefully and sign to activate your full partnership benefits.
        </p>
      </div>

      {/* Signed banner */}
      {status?.signed && status.agreement && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[26px] text-emerald-600" style={FILL}>verified</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-emerald-800 text-base">Agreement Signed & Active</p>
            <p className="text-sm text-emerald-700 mt-0.5">
              Signed by <strong>{status.agreement.signed_by_name}</strong> ({status.agreement.signed_by_email})
            </p>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                {status.agreement.signed_at}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">description</span>
                Version {status.agreement.version}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-full uppercase tracking-wider shrink-0">
            Active
          </span>
        </div>
      )}

      {/* Success toast */}
      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-center gap-3 text-emerald-700">
          <span className="material-symbols-outlined text-xl" style={FILL}>check_circle</span>
          <span className="text-sm font-bold">Agreement signed successfully! Your partnership is now active.</span>
        </div>
      )}

      {/* Agreement document */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Doc header */}
        <div className="bg-slate-800 px-8 py-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-[28px] text-white/80" style={FILL}>handshake</span>
            <div>
              <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest">AdmissionX Platform</p>
              <h3 className="text-xl font-black text-white">College Partner Agreement</h3>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap mt-2">
            <span className="text-[11px] text-white/60 font-semibold">Version 1.0</span>
            <span className="text-white/30">·</span>
            <span className="text-[11px] text-white/60 font-semibold">Effective: January 2025</span>
            <span className="text-white/30">·</span>
            <span className="text-[11px] text-white/60 font-semibold">Governed by Laws of India</span>
          </div>
        </div>

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-[480px] overflow-y-auto px-8 py-6 space-y-6 text-slate-700"
          style={{ scrollbarWidth: "thin" }}
        >
          {/* Preamble */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <p className="text-sm leading-relaxed text-slate-600">
              This Agreement is made between <strong>AdmissionX Technologies Pvt. Ltd.</strong> (&ldquo;AdmissionX&rdquo;, &ldquo;Platform&rdquo;, &ldquo;We&rdquo;)
              and <strong>{college.name || 'the College'}</strong> (&ldquo;Partner&rdquo;, &ldquo;College&rdquo;, &ldquo;You&rdquo;), collectively referred to as the &ldquo;Parties&rdquo;.
              This Agreement governs the use of the AdmissionX College Dashboard and all associated services.
            </p>
          </div>

          {/* Clauses */}
          {AGREEMENT_CLAUSES.map((clause, i) => (
            <div key={i} className="space-y-2">
              <h4 className="font-black text-slate-800 text-[15px]">{clause.title}</h4>
              <p className="text-sm leading-relaxed text-slate-600">{clause.body}</p>
            </div>
          ))}

          {/* Signature block preview */}
          <div className="border-t-2 border-dashed border-slate-200 pt-6 mt-6">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Signature Block</p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">For AdmissionX Technologies Pvt. Ltd.</p>
                <div className="h-12 border-b-2 border-slate-300 mb-1" />
                <p className="text-xs text-slate-400">Authorised Signatory</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">For {college.name || 'Partner Institution'}</p>
                <div className="h-12 border-b-2 border-slate-300 mb-1" />
                <p className="text-xs text-slate-400">Authorised Signatory</p>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          {!scrolledToBottom && (
            <div className="flex items-center justify-center gap-2 py-4 text-slate-400">
              <span className="material-symbols-outlined text-[18px] animate-bounce">keyboard_arrow_down</span>
              <span className="text-xs font-semibold">Scroll to read the full agreement</span>
            </div>
          )}
        </div>

        {/* Scroll progress indicator */}
        <div className="px-8 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${scrolledToBottom ? "bg-emerald-500" : "bg-slate-300"}`} />
          <span className={`text-xs font-bold ${scrolledToBottom ? "text-emerald-600" : "text-slate-400"}`}>
            {scrolledToBottom ? "You have read the full agreement" : "Please scroll to the bottom to continue"}
          </span>
        </div>
      </div>

      {/* Sign form */}
      {!status?.signed ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[22px] text-[#FF3D3D]" style={FILL}>draw</span>
            <h3 className="font-black text-slate-800 text-base">Sign the Agreement</h3>
          </div>

          <form onSubmit={handleSign} className="space-y-5">
            {/* Signatory name */}
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                Authorised Signatory Name <span className="text-[#FF3D3D]">*</span>
              </label>
              <input
                type="text"
                value={signatoryName}
                onChange={e => setSignatoryName(e.target.value)}
                placeholder="Full name of the authorised person"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF3D3D]/20 focus:border-[#FF3D3D] transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                This should be the Principal, Director, or authorised representative of the institution.
              </p>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                Registered Email
              </label>
              <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 font-medium">
                {college.email}
              </div>
            </div>

            {/* Agreement checkbox */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              agreed ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"
            }`}>
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                agreed ? "bg-emerald-500 border-emerald-500" : "border-slate-300 bg-white"
              }`}>
                {agreed && <span className="material-symbols-outlined text-white text-[14px]" style={FILL}>check</span>}
              </div>
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="sr-only"
              />
              <span className="text-sm font-medium text-slate-700 leading-relaxed">
                I, <strong>{signatoryName || 'the authorised signatory'}</strong>, on behalf of <strong>{college.name || 'the institution'}</strong>,
                have read, understood, and agree to be bound by all the terms and conditions of this College Partner Agreement.
                I confirm that I am authorised to sign this agreement on behalf of the institution.
              </span>
            </label>

            {/* Scroll warning */}
            {!scrolledToBottom && (
              <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
                <span className="material-symbols-outlined text-[18px]" style={FILL}>warning</span>
                <span className="text-xs font-bold">Please scroll through the entire agreement document above before signing.</span>
              </div>
            )}

            {signError && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600">
                <span className="material-symbols-outlined text-[18px]" style={FILL}>error</span>
                <span className="text-sm font-medium">{signError}</span>
              </div>
            )}

            {/* Legal note */}
            <div className="flex items-start gap-2 text-slate-400">
              <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">info</span>
              <p className="text-[11px] leading-relaxed">
                By clicking &ldquo;Sign Agreement&rdquo;, you are providing a legally binding electronic signature.
                Your IP address, timestamp, and email will be recorded as proof of acceptance.
              </p>
            </div>

            <button
              type="submit"
              disabled={signing || !agreed || !scrolledToBottom || !signatoryName.trim()}
              className="w-full flex items-center justify-center gap-3 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black text-sm rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
              {signing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]" style={FILL}>draw</span>
                  Sign Agreement
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Already signed — show re-sign option */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-[22px] text-emerald-600" style={FILL}>task_alt</span>
            <h3 className="font-black text-slate-800 text-base">Agreement Details</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Signed By",    value: status.agreement?.signed_by_name,  icon: "person" },
              { label: "Email",        value: status.agreement?.signed_by_email, icon: "email" },
              { label: "Signed On",    value: status.agreement?.signed_at,       icon: "calendar_today" },
              { label: "Agreement Ver",value: `Version ${status.agreement?.version}`, icon: "description" },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="material-symbols-outlined text-[18px] text-slate-400 shrink-0 mt-0.5" style={FILL}>{item.icon}</span>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                  <p className="text-sm font-bold text-slate-700 mt-0.5 truncate">{item.value || "—"}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Re-sign option */}
          <details className="mt-5">
            <summary className="text-xs font-bold text-slate-400 cursor-pointer hover:text-slate-600 transition-colors select-none">
              Need to re-sign with updated details?
            </summary>
            <form onSubmit={handleSign} className="mt-4 space-y-4">
              <input
                type="text"
                value={signatoryName}
                onChange={e => setSignatoryName(e.target.value)}
                placeholder="Authorised signatory name"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF3D3D]/20 focus:border-[#FF3D3D] transition-all"
              />
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="w-4 h-4 accent-[#FF3D3D]" />
                <span className="text-sm text-slate-600 font-medium">I agree to the terms and conditions</span>
              </label>
              {signError && <p className="text-xs text-red-500">{signError}</p>}
              <button
                type="submit"
                disabled={signing || !agreed || !scrolledToBottom || !signatoryName.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-700 text-white text-sm font-bold rounded-xl disabled:opacity-40 hover:bg-slate-800 transition-colors"
              >
                {signing ? "Updating…" : "Update Signature"}
              </button>
            </form>
          </details>
        </div>
      )}
    </div>
  );
}
