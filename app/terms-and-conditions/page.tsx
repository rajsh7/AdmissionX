import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Terms and Conditions | AdmissionX",
  description: "Read the terms and conditions governing your use of the AdmissionX platform.",
};

const LAST_UPDATED = "June 1, 2026";

const TOC = [
  { id: "acceptance",       label: "1. Acceptance of Terms" },
  { id: "services",         label: "2. Description of Services" },
  { id: "accounts",         label: "3. User Accounts" },
  { id: "college-partners", label: "4. College Partner Terms" },
  { id: "prohibited",       label: "5. Prohibited Activities" },
  { id: "ip",               label: "6. Intellectual Property" },
  { id: "disclaimers",      label: "7. Disclaimers" },
  { id: "liability",        label: "8. Limitation of Liability" },
  { id: "indemnification",  label: "9. Indemnification" },
  { id: "governing-law",    label: "10. Governing Law" },
  { id: "third-party",      label: "11. Third-Party Links" },
  { id: "changes",          label: "12. Changes to Terms" },
  { id: "contact",          label: "13. Contact Information" },
];

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Header />

      {/* Hero */}
      <div className="pt-[100px] lg:pt-[104px] bg-white border-b border-neutral-100 relative overflow-hidden">
        
        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 text-neutral-500 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
            Legal Document
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 mb-4 leading-tight">Terms &amp; Conditions</h1>
          <p className="text-neutral-500 text-base max-w-xl mx-auto leading-relaxed">
            Please read these terms carefully before using the AdmissionX platform.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 bg-neutral-100 border border-neutral-200 rounded-full px-4 py-1.5 text-neutral-600">
              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
              Last updated: {LAST_UPDATED}
            </span>
            <span className="flex items-center gap-1.5 bg-neutral-100 border border-neutral-200 rounded-full px-4 py-1.5 text-neutral-600">
              <span className="material-symbols-outlined text-[14px]">business</span>
              Saroj Entertainment Pvt. Ltd.
            </span>
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 py-3 flex items-center gap-3">
          <span className="material-symbols-outlined text-blue-500 text-[18px] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
          <p className="text-sm text-blue-800">These Terms constitute a legally binding agreement between you and <strong>Saroj Entertainment Pvt. Ltd.</strong> (owner &amp; operator of AdmissionX). By using the platform, you agree to these terms.</p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="flex gap-10 items-start">

          {/* Sticky Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-[112px] self-start">
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
              <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-4">Contents</p>
              <nav className="space-y-0.5">
                {TOC.map((item) => (
                  <a key={item.id} href={`#${item.id}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-medium text-neutral-500 hover:text-[#FF3C3C] hover:bg-red-50 transition-all group">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 group-hover:bg-[#FF3C3C] transition-colors flex-shrink-0" />
                    {item.label}
                  </a>
                ))}
              </nav>
              <div className="mt-5 pt-4 border-t border-neutral-100">
                <Link href="/privacy-policy" className="flex items-center gap-2 text-[12px] font-bold text-[#FF3C3C] hover:underline">
                  <span className="material-symbols-outlined text-[14px]">shield</span>
                  Privacy Policy
                </Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0 space-y-5">

            <Sec id="acceptance" number="1" title="Acceptance of Terms">
              <P>By accessing or using the AdmissionX website (<strong>admissionx.in</strong>) and related services (collectively, the &ldquo;Platform&rdquo;), you confirm that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.</P>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 my-3">
                <p className="text-[13px] font-bold text-blue-800 mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>business</span>
                  Platform Ownership
                </p>
                <p className="text-[13px] text-blue-700">The AdmissionX Platform is owned, operated, and maintained by <strong>Saroj Entertainment Pvt. Ltd.</strong>, an Indian company registered under the Companies Act, 2013, with registered office at 123 Education Street, Mumbai, Maharashtra 400001, India. All references to &ldquo;AdmissionX&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo; refer to Saroj Entertainment Pvt. Ltd.</p>
              </div>
              <P>We reserve the right to modify these Terms at any time. Continued use of the Platform constitutes acceptance of revised Terms.</P>
            </Sec>

            <Sec id="services" number="2" title="Description of Services">
              <P>AdmissionX provides an online platform connecting students with educational institutions across India. Our services include:</P>
              <BL items={["College and university discovery and comparison tools","Entrance examination information, eligibility, and syllabi","Career guidance and stream exploration resources","Study abroad information and resources","College application facilitation","Educational blogs, news, and articles","Ask & Answer community forums","Student and college partner accounts and dashboards"]} />
              <P>The Platform is informational in nature. AdmissionX does not guarantee admission to any institution.</P>
            </Sec>

            <Sec id="accounts" number="3" title="User Registration & Accounts">
              <Sub>3.1 Student Accounts</Sub>
              <P>Students may register for a free account. By registering, you agree to:</P>
              <BL items={["Provide accurate, current, and complete registration information","Maintain the security of your account credentials","Promptly update your information if it changes","Accept responsibility for all activities under your account","Notify us immediately of any unauthorized account use"]} />
              <Sub>3.2 College Partner Accounts</Sub>
              <P>Educational institutions may register for a paid partner account. College Partners agree to:</P>
              <BL items={["Provide truthful and accurate institutional information","Ensure all published course, fee, and admission data is current","Respond to student inquiries in a timely manner","Comply with applicable laws governing educational institutions","Not misrepresent affiliation, accreditation, or ranking status"]} />
              <Sub>3.3 Account Termination</Sub>
              <P>We reserve the right to suspend or terminate any account for violation of these Terms, fraudulent activity, or conduct harmful to the Platform or its users.</P>
            </Sec>

            <Sec id="college-partners" number="4" title="College Partner Terms">
              <P>College Partners accessing paid features are subject to the following additional terms:</P>
              <NL items={["Subscription fees are as specified in your partner agreement and subject to applicable taxes.","College Partners are solely responsible for accuracy of all content published on their profile.","AdmissionX reserves the right to remove misleading, inaccurate, or violating content.","College Partners may not use the Platform to spam, solicit, or harass students.","Partner accounts may not be transferred or sub-licensed to third parties.","AdmissionX may feature partner institutions in promotional materials. Partners may opt out by contacting us."]} />
            </Sec>

            <Sec id="prohibited" number="5" title="Prohibited Activities">
              <P>You agree not to engage in any of the following:</P>
              <BL items={["Violating any applicable local, state, national, or international law","Posting false, misleading, or fraudulent information","Impersonating any person, institution, or entity","Harvesting or scraping user data without express written permission","Transmitting unsolicited commercial communications (spam)","Attempting to gain unauthorized access to any part of the Platform","Interfering with or disrupting the integrity or performance of the Platform","Uploading malware, viruses, or malicious code","Engaging in automated data collection without prior written consent","Using the Platform for any unlawful, harmful, or abusive purpose"]} />
            </Sec>

            <Sec id="ip" number="6" title="Intellectual Property">
              <Sub>6.1 Our Content</Sub>
              <P>All Platform content — text, graphics, logos, images, and software — is the property of AdmissionX or its content suppliers and is protected by applicable intellectual property laws.</P>
              <Sub>6.2 User Content</Sub>
              <P>By submitting content (reviews, questions, profile information), you grant AdmissionX a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and distribute such content for Platform operations.</P>
              <Sub>6.3 Restrictions</Sub>
              <P>You may not copy, reproduce, or distribute Platform content without prior written permission, except for personal, non-commercial use.</P>
            </Sec>

            <Sec id="disclaimers" number="7" title="Disclaimers">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
                <p className="text-[13px] text-amber-800 font-medium">The Platform and its content are provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranties of any kind, either express or implied.</p>
              </div>
              <P>AdmissionX does not warrant that:</P>
              <BL items={["The Platform will be uninterrupted, error-free, or secure","Any information on the Platform is accurate, complete, or current","The Platform will meet your requirements or expectations","Any defects in the Platform will be corrected","Admission to any institution will result from using the Platform"]} />
            </Sec>

            <Sec id="liability" number="8" title="Limitation of Liability">
              <P>TO THE MAXIMUM EXTENT PERMITTED BY LAW, ADMISSIONX AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.</P>
              <P>In no event shall total liability exceed the amount paid by you, if any, in the twelve (12) months preceding the claim.</P>
            </Sec>

            <Sec id="indemnification" number="9" title="Indemnification">
              <P>You agree to defend, indemnify, and hold harmless AdmissionX and its officers, directors, employees, contractors, agents, licensors, and suppliers from any claims, liabilities, damages, losses, costs, or fees arising from your violation of these Terms or use of the Platform.</P>
            </Sec>

            <Sec id="governing-law" number="10" title="Governing Law & Dispute Resolution">
              <P>These Terms shall be governed by the laws of India. The courts of <strong>Maharashtra, India</strong> shall have exclusive jurisdiction over any dispute arising from these Terms or use of the Platform.</P>
              <P>Both parties agree to first attempt good-faith negotiation for 30 days before resorting to formal legal proceedings.</P>
            </Sec>

            <Sec id="third-party" number="11" title="Third-Party Links & Services">
              <P>The Platform may contain links to third-party websites provided for convenience only. AdmissionX has no control over, and assumes no responsibility for, the content or privacy policies of any third-party websites.</P>
            </Sec>

            <Sec id="changes" number="12" title="Changes to These Terms">
              <P>We reserve the right to modify these Terms at any time. Registered users will be notified of significant changes via email or a prominent notice on the Platform. Continued use after notification constitutes acceptance.</P>
            </Sec>

            {/* Section 13 Contact */}
            <div id="contact" className="bg-gradient-to-r from-[#1a1a2e] to-[#0f3460] rounded-2xl p-6 text-white scroll-mt-32">
              <h2 className="text-[16px] font-black mb-5 flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/10 text-white text-xs font-black flex-shrink-0">13</span>
                Contact Information
              </h2>
              <p className="text-[13px] text-white/60 mb-5">If you have any questions about these Terms, please contact us:</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: "business",     label: "Company", value: "Saroj Entertainment Pvt. Ltd." },
                  { icon: "location_on",  label: "Address", value: "123 Education Street, Mumbai, MH 400001" },
                  { icon: "mail",         label: "Email",   value: "welcome@admissionx.info", href: "mailto:welcome@admissionx.info" },
                  { icon: "language",     label: "Website", value: "admissionx.com",        href: "https://admissionx.in" },
                ].map((item) => (
                  <div key={item.label} className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
                    <span className="material-symbols-outlined text-white/50 text-[16px] block mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                    <p className="text-[11px] font-bold text-white/50 uppercase tracking-wide mb-0.5">{item.label}</p>
                    {item.href
                      ? <a href={item.href} className="text-[13px] font-semibold text-white hover:underline break-all">{item.value}</a>
                      : <p className="text-[13px] font-semibold text-white">{item.value}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer strip */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-200">
              <p className="text-xs text-neutral-400">Last updated: <strong className="text-neutral-600">{LAST_UPDATED}</strong> · © 2026 Saroj Entertainment Pvt. Ltd.</p>
              <div className="flex items-center gap-3 text-xs">
                <Link href="/privacy-policy" className="text-neutral-500 hover:text-[#FF3C3C] font-semibold transition-colors">Privacy Policy</Link>
                <span className="text-neutral-300">·</span>
                <Link href="/cancellation-refunds" className="text-neutral-500 hover:text-[#FF3C3C] font-semibold transition-colors">Cancellation &amp; Refunds</Link>
              </div>
            </div>

          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Sec({ id, number, title, children }: { id: string; number: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden scroll-mt-32">
      <div className="flex items-center gap-3 px-6 py-4 bg-neutral-50 border-b border-neutral-100">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#FF3C3C] text-white text-xs font-black flex-shrink-0">{number}</span>
        <h2 className="text-[15px] font-black text-neutral-800">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-3">{children}</div>
    </div>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[13px] font-black text-neutral-700 pt-2">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] text-neutral-600 leading-relaxed">{children}</p>;
}

function BL({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[13px] text-neutral-600">
          <span className="material-symbols-outlined text-[#FF3C3C] text-[15px] flex-shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function NL({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-[13px] text-neutral-600">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#FF3C3C]/10 text-[#FF3C3C] text-[10px] font-black flex-shrink-0 mt-0.5">{i + 1}</span>
          {item}
        </li>
      ))}
    </ol>
  );
}
