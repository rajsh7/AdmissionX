import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | AdmissionX",
  description:
    "Learn how AdmissionX collects, uses, and protects your personal information. Our privacy policy is aligned with the Information Technology Act, 2000.",
};

const LAST_UPDATED = "June 1, 2025";

// ─── Section component ────────────────────────────────────────────────────────

function Section({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={`s${num}`} className="scroll-mt-24">
      <h2 className="flex items-baseline gap-3 text-lg font-black text-neutral-900 mb-4">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-xs font-black text-red-600">
          {num}
        </span>
        {title}
      </h2>
      <div className="pl-11 space-y-3 text-sm text-neutral-600 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 list-none">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ─── TOC entries ──────────────────────────────────────────────────────────────

const TOC = [
  { num: "1",  title: "Introduction" },
  { num: "2",  title: "Information We Collect" },
  { num: "3",  title: "How We Use Your Information" },
  { num: "4",  title: "Information Sharing & Disclosure" },
  { num: "5",  title: "Cookies & Tracking Technologies" },
  { num: "6",  title: "Data Security" },
  { num: "7",  title: "Data Retention" },
  { num: "8",  title: "Your Rights & Choices" },
  { num: "9",  title: "Children's Privacy" },
  { num: "10", title: "Third-Party Links" },
  { num: "11", title: "Changes to This Policy" },
  { num: "12", title: "Grievance Officer & Contact" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* ── Hero ── */}
      <div className="bg-neutral-900 pt-24 pb-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="text-neutral-300">Privacy Policy</span>
          </nav>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-red-400 text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shield
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white leading-tight mb-2">
                Privacy Policy
              </h1>
              <p className="text-neutral-400 text-sm">
                Last updated: <span className="text-neutral-300 font-semibold">{LAST_UPDATED}</span>
                &ensp;·&ensp;Effective immediately upon publication
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 items-start">

          {/* Sticky TOC */}
          <aside className="hidden lg:block sticky top-24">
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">
                On this page
              </p>
              <nav className="space-y-1">
                {TOC.map((item) => (
                  <a
                    key={item.num}
                    href={`#s${item.num}`}
                    className="flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-red-600 transition-colors py-1"
                  >
                    <span className="text-[10px] font-black text-neutral-300 w-5 text-right">
                      {item.num}.
                    </span>
                    {item.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Document */}
          <article className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-7 sm:p-10 space-y-10">

            {/* Preamble */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 text-sm text-neutral-600 leading-relaxed">
              AdmissionX (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the website{" "}
              <strong className="text-neutral-800">admissionx.in</strong> and related mobile applications
              (collectively, the &ldquo;Platform&rdquo;). This Privacy Policy describes how we collect,
              use, store, share, and protect your personal information when you use our Platform.
              By accessing or using the Platform, you agree to the terms of this Privacy Policy.
              Please read this document carefully.
            </div>

            <Section num="1" title="Introduction">
              <P>
                AdmissionX is an education technology platform that connects students with colleges,
                universities, and career guidance resources across India. We are committed to protecting
                your privacy and processing your personal data in accordance with applicable Indian laws,
                including the Information Technology Act, 2000 (&ldquo;IT Act&rdquo;), the Information
                Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or
                Information) Rules, 2011 (&ldquo;SPDI Rules&rdquo;), and the Digital Personal Data
                Protection Act, 2023 (&ldquo;DPDPA&rdquo;).
              </P>
              <P>
                This Policy applies to all users of our Platform, including prospective students, enrolled
                students, college partners, and visitors. If you do not agree with this Policy, please
                discontinue use of the Platform immediately.
              </P>
            </Section>

            <Section num="2" title="Information We Collect">
              <P>We collect the following categories of personal information:</P>
              <p className="font-semibold text-neutral-800 !mt-4">A. Information You Provide Directly</p>
              <Ul items={[
                "Account registration details: name, email address, mobile number, date of birth, and gender.",
                "Academic information: board results, entrance exam scores, stream preferences, degree interests, and target colleges.",
                "Profile information: profile photo, address, state of residence, and educational background.",
                "Application data: documents uploaded as part of college admission applications.",
                "Communications: messages sent to us via contact forms, support queries, or email.",
                "College partner information: institution name, authorised representative details, college registration documents.",
              ]} />
              <p className="font-semibold text-neutral-800 !mt-4">B. Information Collected Automatically</p>
              <Ul items={[
                "Log data: IP address, browser type and version, pages visited, referring URL, and access timestamps.",
                "Device information: device type, operating system, screen resolution, and unique device identifiers.",
                "Usage data: search queries entered, colleges viewed, exams explored, and interactions with content.",
                "Location data: coarse location derived from IP address (we do not collect precise GPS location without explicit consent).",
                "Cookies and similar technologies (see Section 5).",
              ]} />
              <p className="font-semibold text-neutral-800 !mt-4">C. Information from Third Parties</p>
              <Ul items={[
                "Social login providers (Google, Facebook) if you choose to sign in through them.",
                "Payment processors for college partner subscription transactions.",
                "Analytics partners for aggregated and anonymised usage insights.",
              ]} />
            </Section>

            <Section num="3" title="How We Use Your Information">
              <P>We use the information we collect for the following purposes:</P>
              <Ul items={[
                "To create, maintain, and authenticate your account on the Platform.",
                "To personalise college and course recommendations based on your academic profile.",
                "To facilitate admission applications and connect you with partner colleges.",
                "To send transactional notifications such as application status updates, exam alerts, and deadline reminders.",
                "To send promotional communications about new features, colleges, scholarships, and events (with your consent; you may opt out at any time).",
                "To process payments for college partner subscriptions and issue receipts.",
                "To improve Platform performance, fix bugs, conduct A/B testing, and develop new features.",
                "To generate anonymised and aggregated statistics about Platform usage.",
                "To comply with legal obligations, resolve disputes, and enforce our Terms & Conditions.",
                "To detect and prevent fraud, abuse, and security incidents.",
              ]} />
              <P>
                We process your data on the legal basis of <strong>contract performance</strong> (to provide
                services you requested), <strong>legitimate interests</strong> (platform security, fraud
                prevention, and analytics), <strong>legal obligation</strong> (compliance with applicable law),
                and <strong>consent</strong> (marketing communications and optional features).
              </P>
            </Section>

            <Section num="4" title="Information Sharing & Disclosure">
              <P>
                We do not sell your personal information. We share your data only in the following
                limited circumstances:
              </P>
              <Ul items={[
                "College partners: When you submit an admission enquiry or application, your name, contact details, and academic profile are shared with the relevant college(s) to process your application.",
                "Service providers: We engage third-party vendors for hosting, payment processing, email delivery, analytics, and customer support. These parties access your data only to perform services on our behalf and are bound by confidentiality obligations.",
                "Legal compliance: We may disclose your information if required by law, court order, or government authority, or to protect the rights, property, or safety of AdmissionX, our users, or others.",
                "Business transfers: In the event of a merger, acquisition, or asset sale, your information may be transferred to the acquiring entity, which will be bound by this Privacy Policy.",
                "With your consent: We may share your information for other purposes with your explicit prior consent.",
              ]} />
            </Section>

            <Section num="5" title="Cookies & Tracking Technologies">
              <P>
                We use cookies, web beacons, and similar tracking technologies to operate the Platform,
                analyse usage patterns, and improve user experience. The types of cookies we use include:
              </P>
              <Ul items={[
                "Essential cookies: required for core Platform functionality such as login sessions and security.",
                "Preference cookies: remember your language, theme, and personalisation settings.",
                "Analytics cookies: collect anonymised data about page views and navigation patterns (e.g., via Google Analytics).",
                "Marketing cookies: used to deliver relevant advertisements on third-party platforms (only where you have consented).",
              ]} />
              <P>
                You can manage cookie preferences through your browser settings. Disabling essential cookies
                may impair Platform functionality. A Cookie Consent Manager is available on the Platform for
                more granular control.
              </P>
            </Section>

            <Section num="6" title="Data Security">
              <P>
                We implement appropriate technical and organisational security measures to protect your
                personal data against unauthorised access, disclosure, alteration, and destruction. These
                measures include:
              </P>
              <Ul items={[
                "HTTPS/TLS encryption for all data transmitted between your browser and our servers.",
                "Passwords stored using industry-standard one-way hashing algorithms (bcrypt).",
                "Role-based access controls limiting employee access to personal data on a need-to-know basis.",
                "Regular security audits and vulnerability assessments.",
                "Data backup and disaster recovery procedures.",
              ]} />
              <P>
                Despite our best efforts, no system is completely secure. In the event of a data breach
                that is likely to result in a high risk to your rights and freedoms, we will notify you
                and the appropriate regulatory authority as required by applicable law.
              </P>
            </Section>

            <Section num="7" title="Data Retention">
              <P>
                We retain your personal data for as long as your account is active or as necessary to
                provide services and comply with our legal obligations. Specifically:
              </P>
              <Ul items={[
                "Active accounts: data is retained throughout the lifetime of your account.",
                "Deleted accounts: most personal data is deleted within 90 days of account deletion. Certain data (e.g., transaction records) may be retained longer to comply with financial and tax laws.",
                "Application data: retained for a minimum of 3 years to facilitate admission history and dispute resolution.",
                "Server logs: retained for up to 12 months for security and debugging purposes.",
                "Anonymised analytics data: retained indefinitely in aggregate form.",
              ]} />
            </Section>

            <Section num="8" title="Your Rights & Choices">
              <P>
                Subject to applicable law, you have the following rights with respect to your personal data:
              </P>
              <Ul items={[
                "Right of access: request a copy of the personal data we hold about you.",
                "Right to correction: request that inaccurate or incomplete data be rectified.",
                "Right to erasure: request deletion of your personal data (subject to legal retention requirements).",
                "Right to data portability: receive your data in a structured, machine-readable format.",
                "Right to withdraw consent: withdraw consent for marketing communications at any time via the unsubscribe link in emails or account settings.",
                "Right to object: object to processing based on our legitimate interests.",
                "Right to grievance redressal: lodge a complaint with our Grievance Officer (see Section 12).",
              ]} />
              <P>
                To exercise any of these rights, please contact our Grievance Officer at the details in
                Section 12. We will respond within 30 days of receipt of a verifiable request.
              </P>
            </Section>

            <Section num="9" title="Children's Privacy">
              <P>
                Our Platform is not directed at children under the age of 13. We do not knowingly collect
                personal information from children under 13 without verifiable parental consent. If you
                believe we have inadvertently collected data from a child under 13, please contact us
                immediately and we will take steps to delete such information promptly.
              </P>
              <P>
                Students aged 13–18 may use the Platform with parental or guardian consent. Colleges
                and institutions should ensure that any information submitted on behalf of minor
                applicants has been authorised by a parent or legal guardian.
              </P>
            </Section>

            <Section num="10" title="Third-Party Links">
              <P>
                Our Platform may contain links to third-party websites, including college websites,
                government portals, and scholarship platforms. We are not responsible for the privacy
                practices or content of these external sites. We encourage you to review the privacy
                policies of any third-party sites you visit.
              </P>
            </Section>

            <Section num="11" title="Changes to This Policy">
              <P>
                We may update this Privacy Policy from time to time to reflect changes in our practices,
                technology, legal requirements, or other factors. When we make material changes, we will:
              </P>
              <Ul items={[
                "Update the &ldquo;Last updated&rdquo; date at the top of this page.",
                "Display a prominent notice on the Platform or send a notification to your registered email address.",
                "Where required by law, seek your fresh consent.",
              ]} />
              <P>
                Your continued use of the Platform after the effective date of any changes constitutes
                your acceptance of the updated Policy.
              </P>
            </Section>

            <Section num="12" title="Grievance Officer & Contact">
              <P>
                In accordance with the Information Technology Act, 2000 and the SPDI Rules, 2011,
                we have designated a Grievance Officer to address your privacy-related concerns:
              </P>
              <div className="!mt-4 bg-neutral-50 border border-neutral-200 rounded-xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-[16px] text-neutral-400">person</span>
                  <span className="text-neutral-700 font-semibold">Grievance Officer, AdmissionX</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-[16px] text-neutral-400">mail</span>
                  <a href="mailto:privacy@admissionx.in" className="text-red-600 hover:underline">
                    privacy@admissionx.in
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-[16px] text-neutral-400">location_on</span>
                  <span className="text-neutral-600">AdmissionX, India</span>
                </div>
              </div>
              <P>
                We will acknowledge your grievance within 48 hours and aim to resolve it within
                30 days of receipt. If you are dissatisfied with our response, you may approach
                the relevant data protection authority under applicable Indian law.
              </P>
            </Section>

            {/* Footer strip */}
            <div className="border-t border-neutral-100 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-xs text-neutral-400">
                © 2025 AdmissionX. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-xs">
                <Link href="/terms-and-conditions" className="text-neutral-500 hover:text-red-600 transition-colors">
                  Terms &amp; Conditions
                </Link>
                <Link href="/disclaimer" className="text-neutral-500 hover:text-red-600 transition-colors">
                  Disclaimer
                </Link>
                <Link href="/contact-us" className="text-neutral-500 hover:text-red-600 transition-colors">
                  Contact Us
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>

      <Footer />
    </div>
  );
}




