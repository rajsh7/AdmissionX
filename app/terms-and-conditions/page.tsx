import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Terms and Conditions | AdmissionX",
  description:
    "Read the terms and conditions governing your use of the AdmissionX platform, including rules for students, college partners, and visitors.",
};

const LAST_UPDATED = "June 1, 2025";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="bg-neutral-900 pt-24 pb-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-neutral-300">Terms &amp; Conditions</span>
          </nav>

          <div className="flex items-start gap-4">
            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-2xl flex-shrink-0">
              <span
                className="material-symbols-outlined text-blue-400 text-[28px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                gavel
              </span>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-2">
                Terms &amp; Conditions
              </h1>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-xl">
                Please read these terms carefully before using the AdmissionX
                platform. By accessing or using our services, you agree to be
                bound by these terms.
              </p>
              <p className="text-xs text-neutral-500 mt-3">
                Last updated:{" "}
                <span className="text-neutral-300 font-semibold">
                  {LAST_UPDATED}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick nav ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-100 sticky top-0 z-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-3 overflow-x-auto">
          <div className="flex items-center gap-1 text-xs font-semibold whitespace-nowrap">
            {[
              ["#acceptance", "Acceptance"],
              ["#services", "Services"],
              ["#accounts", "Accounts"],
              ["#college-partners", "College Partners"],
              ["#prohibited", "Prohibited Use"],
              ["#ip", "Intellectual Property"],
              ["#liability", "Liability"],
              ["#governing-law", "Governing Law"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
          {/* Alert banner */}
          <div className="bg-blue-50 border-b border-blue-100 px-8 py-4 flex items-start gap-3">
            <span
              className="material-symbols-outlined text-blue-500 text-[18px] flex-shrink-0 mt-0.5"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              info
            </span>
            <p className="text-sm text-blue-800">
              These Terms constitute a legally binding agreement between you and
              AdmissionX. If you do not agree to these Terms, please do not use
              our platform.
            </p>
          </div>

          <div className="px-8 sm:px-12 py-10 space-y-12">

            {/* 1. Acceptance */}
            <section id="acceptance">
              <SectionHeading number="1" title="Acceptance of Terms" />
              <Prose>
                By accessing or using the AdmissionX website (
                <strong>admissionx.in</strong>) and related services
                (collectively, the &ldquo;Platform&rdquo;), you confirm that
                you have read, understood, and agree to be bound by these Terms
                and Conditions (&ldquo;Terms&rdquo;) and our Privacy Policy. If
                you are accessing the Platform on behalf of an institution, you
                represent that you have the authority to bind that institution
                to these Terms.
              </Prose>
              <Prose>
                We reserve the right to modify these Terms at any time. Your
                continued use of the Platform after any such changes constitutes
                your acceptance of the revised Terms. We will provide notice of
                material changes by updating the &ldquo;Last updated&rdquo;
                date at the top of this page.
              </Prose>
            </section>

            <Divider />

            {/* 2. Services */}
            <section id="services">
              <SectionHeading number="2" title="Description of Services" />
              <Prose>
                AdmissionX provides an online platform that connects students
                with educational institutions across India. Our services
                include:
              </Prose>
              <BulletList
                items={[
                  "College and university discovery and comparison tools",
                  "Information on entrance examinations, eligibility, and syllabi",
                  "Career guidance and stream exploration resources",
                  "Study abroad information and resources",
                  "College application facilitation",
                  "Educational blogs, news, and articles",
                  "Ask & Answer community forums",
                  "Student and college partner accounts and dashboards",
                ]}
              />
              <Prose>
                The Platform is provided on an informational basis. AdmissionX
                does not guarantee admission to any institution and does not
                act as an agent or representative of any college or university
                listed on the Platform.
              </Prose>
            </section>

            <Divider />

            {/* 3. Accounts */}
            <section id="accounts">
              <SectionHeading number="3" title="User Registration &amp; Accounts" />

              <SubHeading>3.1 Student Accounts</SubHeading>
              <Prose>
                Students may register for a free account on AdmissionX. By
                registering, you agree to:
              </Prose>
              <BulletList
                items={[
                  "Provide accurate, current, and complete registration information",
                  "Maintain the security of your account credentials",
                  "Promptly update your information if it changes",
                  "Accept responsibility for all activities that occur under your account",
                  "Notify us immediately of any unauthorized use of your account",
                ]}
              />

              <SubHeading>3.2 College Partner Accounts</SubHeading>
              <Prose>
                Educational institutions (&ldquo;College Partners&rdquo;) may
                register for a paid partner account. College Partners agree to:
              </Prose>
              <BulletList
                items={[
                  "Provide truthful and accurate information about their institution",
                  "Ensure all published course, fee, and admission information is current",
                  "Respond to student inquiries in a timely manner",
                  "Comply with applicable laws and regulations governing educational institutions",
                  "Not misrepresent affiliation, accreditation, or ranking status",
                ]}
              />

              <SubHeading>3.3 Account Termination</SubHeading>
              <Prose>
                We reserve the right to suspend or terminate any account at our
                sole discretion if we determine that a user has violated these
                Terms, engaged in fraudulent activity, or otherwise acted in a
                manner harmful to the Platform or its users. Upon termination,
                your right to use the Platform ceases immediately.
              </Prose>
            </section>

            <Divider />

            {/* 4. College Partners */}
            <section id="college-partners">
              <SectionHeading number="4" title="College Partner Terms" />
              <Prose>
                College Partners accessing paid features of the Platform are
                subject to the following additional terms:
              </Prose>
              <NumberedList
                items={[
                  "Subscription fees are as specified in your partner agreement and are subject to applicable taxes.",
                  "College Partners are solely responsible for the accuracy of all content they publish on their institution's profile.",
                  "AdmissionX reserves the right to remove any content that is misleading, inaccurate, or violates these Terms.",
                  "College Partners may not use the Platform to spam, solicit, or harass students.",
                  "Partner accounts may not be transferred or sub-licensed to third parties.",
                  "AdmissionX may feature partner institutions in promotional materials. Partners may opt out by contacting us.",
                ]}
              />
            </section>

            <Divider />

            {/* 5. Prohibited Activities */}
            <section id="prohibited">
              <SectionHeading number="5" title="Prohibited Activities" />
              <Prose>
                You agree not to engage in any of the following activities:
              </Prose>
              <BulletList
                items={[
                  "Violating any applicable local, state, national, or international law or regulation",
                  "Posting false, misleading, or fraudulent information",
                  "Impersonating any person, institution, or entity",
                  "Harvesting or scraping user data without express written permission",
                  "Transmitting unsolicited commercial communications (spam)",
                  "Attempting to gain unauthorized access to any part of the Platform",
                  "Interfering with or disrupting the integrity or performance of the Platform",
                  "Uploading malware, viruses, or any other malicious code",
                  "Engaging in any form of automated data collection without prior written consent",
                  "Using the Platform for any unlawful, harmful, threatening, or abusive purpose",
                ]}
              />
              <Prose>
                Violation of these prohibitions may result in immediate account
                termination and may expose you to civil or criminal liability.
              </Prose>
            </section>

            <Divider />

            {/* 6. Intellectual Property */}
            <section id="ip">
              <SectionHeading number="6" title="Intellectual Property" />

              <SubHeading>6.1 Our Content</SubHeading>
              <Prose>
                All content on the Platform, including but not limited to text,
                graphics, logos, images, audio clips, digital downloads, data
                compilations, and software, is the property of AdmissionX or
                its content suppliers and is protected by applicable Indian and
                international intellectual property laws.
              </Prose>

              <SubHeading>6.2 User Content</SubHeading>
              <Prose>
                By submitting content to the Platform (including reviews,
                questions, answers, or profile information), you grant
                AdmissionX a non-exclusive, worldwide, royalty-free,
                perpetual, and sub-licensable license to use, reproduce,
                modify, adapt, publish, translate, and distribute such content
                in connection with operating and promoting the Platform.
              </Prose>

              <SubHeading>6.3 Restrictions</SubHeading>
              <Prose>
                You may not copy, reproduce, republish, upload, post,
                transmit, or distribute any Platform content without our prior
                written permission, except for personal, non-commercial use.
                Unauthorized use of Platform content may give rise to a claim
                for damages and/or criminal offences.
              </Prose>
            </section>

            <Divider />

            {/* 7. Disclaimers */}
            <section>
              <SectionHeading number="7" title="Disclaimers" />
              <Prose>
                THE PLATFORM AND ITS CONTENT ARE PROVIDED ON AN &ldquo;AS
                IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT ANY
                WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING
                BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR
                A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </Prose>
              <Prose>
                AdmissionX does not warrant that:
              </Prose>
              <BulletList
                items={[
                  "The Platform will be uninterrupted, error-free, or secure",
                  "Any information on the Platform is accurate, complete, or current",
                  "The Platform will meet your requirements or expectations",
                  "Any defects in the Platform will be corrected",
                  "Admission to any institution will result from using the Platform",
                ]}
              />
            </section>

            <Divider />

            {/* 8. Limitation of Liability */}
            <section id="liability">
              <SectionHeading number="8" title="Limitation of Liability" />
              <Prose>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, ADMISSIONX
                AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT
                BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
                OR PUNITIVE DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR
                USE OF THE PLATFORM.
              </Prose>
              <Prose>
                In no event shall our total liability to you for all damages
                exceed the amount paid by you, if any, for accessing or using
                the Platform in the twelve (12) months preceding the claim.
                This limitation applies even if AdmissionX has been advised of
                the possibility of such damages.
              </Prose>
            </section>

            <Divider />

            {/* 9. Indemnification */}
            <section>
              <SectionHeading number="9" title="Indemnification" />
              <Prose>
                You agree to defend, indemnify, and hold harmless AdmissionX
                and its officers, directors, employees, contractors, agents,
                licensors, and suppliers from and against any claims,
                liabilities, damages, judgments, awards, losses, costs,
                expenses, or fees (including reasonable legal fees) arising out
                of or relating to your violation of these Terms or your use of
                the Platform, including but not limited to your submissions,
                any use of Platform content other than as expressly authorised,
                or your violation of any third-party rights.
              </Prose>
            </section>

            <Divider />

            {/* 10. Governing Law */}
            <section id="governing-law">
              <SectionHeading number="10" title="Governing Law &amp; Dispute Resolution" />
              <Prose>
                These Terms shall be governed by and construed in accordance
                with the laws of India, without regard to its conflict of law
                provisions. The courts of{" "}
                <strong>Maharashtra, India</strong> shall have exclusive
                jurisdiction over any dispute arising out of or in connection
                with these Terms or the use of the Platform.
              </Prose>
              <Prose>
                In the event of any dispute, both parties agree to first
                attempt resolution through good-faith negotiations for a period
                of thirty (30) days before resorting to formal legal
                proceedings.
              </Prose>
            </section>

            <Divider />

            {/* 11. Third-Party Links */}
            <section>
              <SectionHeading number="11" title="Third-Party Links &amp; Services" />
              <Prose>
                The Platform may contain links to third-party websites,
                resources, or services. These links are provided for
                convenience only. AdmissionX has no control over and assumes
                no responsibility for the content, privacy policies, or
                practices of any third-party websites. We encourage you to
                review the privacy policies and terms of any third-party sites
                you visit.
              </Prose>
            </section>

            <Divider />

            {/* 12. Changes */}
            <section>
              <SectionHeading number="12" title="Changes to These Terms" />
              <Prose>
                We reserve the right to modify these Terms at any time. We
                will notify registered users of significant changes via email
                or a prominent notice on the Platform. Your continued use of
                the Platform after such notification constitutes acceptance of
                the updated Terms. If you do not agree to the updated Terms,
                you must discontinue use of the Platform and, if applicable,
                close your account.
              </Prose>
            </section>

            <Divider />

            {/* 13. Contact */}
            <section>
              <SectionHeading number="13" title="Contact Information" />
              <Prose>
                If you have any questions about these Terms, please contact us:
              </Prose>
              <div className="mt-4 bg-neutral-50 rounded-2xl border border-neutral-100 p-6 space-y-3">
                {[
                  { icon: "business", label: "Company", value: "AdmissionX" },
                  {
                    icon: "mail",
                    label: "Email",
                    value: "legal@admissionx.in",
                  },
                  {
                    icon: "language",
                    label: "Website",
                    value: "admissionx.in",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span
                      className="material-symbols-outlined text-neutral-400 text-[18px] flex-shrink-0"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {item.icon}
                    </span>
                    <span className="text-sm text-neutral-500 w-20 font-semibold">
                      {item.label}
                    </span>
                    <span className="text-sm text-neutral-700">{item.value}</span>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Footer strip */}
          <div className="border-t border-neutral-100 bg-neutral-50 px-8 sm:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-neutral-400">
              Last updated: <strong className="text-neutral-600">{LAST_UPDATED}</strong>
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/privacy-policy"
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-neutral-300">·</span>
              <Link
                href="/disclaimer"
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
              >
                Disclaimer
              </Link>
              <span className="text-neutral-300">·</span>
              <Link
                href="/cancellation-refunds"
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
              >
                Cancellation &amp; Refunds
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function SectionHeading({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <h2 className="text-lg font-black text-neutral-900 mb-4 flex items-start gap-3">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 text-blue-700 text-xs font-black flex-shrink-0 mt-0.5">
        {number}
      </span>
      <span dangerouslySetInnerHTML={{ __html: title }} />
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold text-neutral-700 mt-6 mb-2">{children}</h3>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-neutral-600 leading-relaxed mb-3">{children}</p>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 mb-4 space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-600">
          <span
            className="material-symbols-outlined text-blue-400 text-[15px] flex-shrink-0 mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="mt-2 mb-4 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-neutral-600">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-neutral-100 text-neutral-500 text-[10px] font-bold flex-shrink-0 mt-0.5">
            {i + 1}
          </span>
          {item}
        </li>
      ))}
    </ol>
  );
}

function Divider() {
  return <hr className="border-neutral-100" />;
}




