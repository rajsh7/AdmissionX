import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Cancellation & Refunds Policy | AdmissionX",
  description:
    "Learn about AdmissionX's cancellation and refund policy for college partner subscriptions and other paid services.",
};

const LAST_UPDATED = "June 1, 2025";

// ─── Shared prose helpers ─────────────────────────────────────────────────────

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-start gap-4 mb-4">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-xs font-black text-red-600">
          {number}
        </span>
        <h2 className="text-lg font-black text-neutral-900 leading-snug pt-1">
          {title}
        </h2>
      </div>
      <div className="ml-12 space-y-3 text-sm text-neutral-600 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

function UL({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-1.5" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function InfoBox({
  icon,
  color,
  title,
  children,
}: {
  icon: string;
  color: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 flex gap-4 ${color}`}
    >
      <span
        className="material-symbols-outlined text-[22px] flex-shrink-0 mt-0.5"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {icon}
      </span>
      <div className="text-sm leading-relaxed">
        <p className="font-bold mb-1">{title}</p>
        {children}
      </div>
    </div>
  );
}

// ─── Table of contents ────────────────────────────────────────────────────────

const TOC = [
  { id: "overview",       number: "1", label: "Overview" },
  { id: "subscriptions",  number: "2", label: "College Partner Subscriptions" },
  { id: "cancellation",   number: "3", label: "Cancellation Policy" },
  { id: "refunds",        number: "4", label: "Refund Policy" },
  { id: "non-refundable", number: "5", label: "Non-Refundable Situations" },
  { id: "process",        number: "6", label: "Refund Process" },
  { id: "contact",        number: "7", label: "Contact Us" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CancellationRefundsPage() {
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
            <span className="text-neutral-300">Cancellation &amp; Refunds</span>
          </nav>

          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-red-400 text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                receipt_long
              </span>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Cancellation &amp; Refunds
              </h1>
              <p className="text-neutral-400 text-sm mt-2 leading-relaxed max-w-xl">
                Our policy on cancellations and refunds for college partner
                subscriptions and paid services on AdmissionX.
              </p>
            </div>
          </div>

          <p className="text-xs text-neutral-500 mt-6">
            Last updated:{" "}
            <span className="text-neutral-300 font-semibold">{LAST_UPDATED}</span>
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Sidebar TOC */}
          <aside className="lg:sticky lg:top-24 lg:w-56 flex-shrink-0 bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 hidden lg:block">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">
              Contents
            </p>
            <nav className="space-y-1">
              {TOC.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-red-600 py-1 transition-colors"
                >
                  <span className="w-4 h-4 rounded bg-neutral-100 flex items-center justify-center text-[9px] font-black text-neutral-400 flex-shrink-0">
                    {item.number}
                  </span>
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Main body */}
          <div className="flex-1 min-w-0 bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 space-y-10">

            {/* Key callout box */}
            <InfoBox
              icon="info"
              color="bg-blue-50 border-blue-200 text-blue-800"
              title="Quick Summary"
            >
              <p>
                Student registration on AdmissionX is <strong>100% free</strong>{" "}
                with no cancellation needed. This policy applies only to
                <strong> college partner subscriptions</strong> and other paid
                services purchased by institutions.
              </p>
            </InfoBox>

            {/* 1. Overview */}
            <Section id="overview" number="1" title="Overview">
              <P>
                AdmissionX (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or
                &ldquo;us&rdquo;) provides a digital platform connecting
                students with educational institutions across India and abroad.
                Our revenue model is based on subscription packages sold to
                college and university partners (&ldquo;College Partners&rdquo;).
              </P>
              <P>
                This Cancellation &amp; Refund Policy governs all financial
                transactions on the AdmissionX platform. By purchasing any paid
                service, you agree to the terms set out in this policy. Please
                read it carefully before completing any purchase.
              </P>
              <P>
                This policy is governed by applicable Indian law, including the
                Consumer Protection Act, 2019 and the Information Technology Act,
                2000.
              </P>
            </Section>

            {/* 2. College Partner Subscriptions */}
            <Section
              id="subscriptions"
              number="2"
              title="College Partner Subscriptions"
            >
              <P>
                AdmissionX offers College Partners access to the platform through
                paid subscription packages. These packages may include:
              </P>
              <UL
                items={[
                  "College profile listing and visibility on search results",
                  "Student application management dashboard",
                  "Analytics and performance insights",
                  "Priority placement in search rankings",
                  "Dedicated account management support",
                  "Advertisement placements on the platform",
                  "Featured listings on category and stream pages",
                ]}
              />
              <P>
                Subscription packages are available on monthly, quarterly, and
                annual terms. Pricing, inclusions, and package details are
                communicated at the time of purchase through your account
                manager or the platform dashboard.
              </P>
            </Section>

            {/* 3. Cancellation Policy */}
            <Section id="cancellation" number="3" title="Cancellation Policy">
              <P>
                College Partners wishing to cancel their subscription may do so
                according to the following terms:
              </P>

              <div className="space-y-4">
                <div className="rounded-xl border border-neutral-100 overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-100">
                    <p className="text-xs font-black text-neutral-600 uppercase tracking-wide">
                      Within 7 Days of Purchase
                    </p>
                  </div>
                  <div className="px-4 py-3 text-sm text-neutral-600">
                    You may cancel your subscription within 7 (seven) calendar
                    days of the initial purchase date for a full refund, provided
                    no substantial use of the platform services has occurred (see
                    Non-Refundable Situations below).
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-100 overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-100">
                    <p className="text-xs font-black text-neutral-600 uppercase tracking-wide">
                      After 7 Days
                    </p>
                  </div>
                  <div className="px-4 py-3 text-sm text-neutral-600">
                    Cancellation requests submitted after 7 days from the
                    purchase date are subject to a partial refund calculated on a
                    pro-rata basis for unused subscription days, minus any
                    applicable processing fees.
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-100 overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-100">
                    <p className="text-xs font-black text-neutral-600 uppercase tracking-wide">
                      Auto-Renewal Cancellation
                    </p>
                  </div>
                  <div className="px-4 py-3 text-sm text-neutral-600">
                    If your subscription includes auto-renewal, you must cancel
                    at least 3 (three) business days before the renewal date to
                    avoid being charged for the next billing cycle. Cancellation
                    after renewal charge will be treated as a new subscription
                    cancellation from the renewal date.
                  </div>
                </div>
              </div>

              <P>
                To initiate a cancellation, please contact us at{" "}
                <a
                  href="mailto:support@admissionx.in"
                  className="text-red-600 font-semibold hover:underline"
                >
                  support@admissionx.in
                </a>{" "}
                with your registered email address, College Partner ID, and the
                reason for cancellation.
              </P>
            </Section>

            {/* 4. Refund Policy */}
            <Section id="refunds" number="4" title="Refund Policy">
              <P>
                Refunds, where applicable, will be processed according to the
                schedule below:
              </P>

              <div className="overflow-x-auto rounded-xl border border-neutral-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-100 text-[11px] font-bold text-neutral-500 uppercase tracking-wide">
                      <th className="px-4 py-3 text-left">Cancellation Window</th>
                      <th className="px-4 py-3 text-left">Refund Amount</th>
                      <th className="px-4 py-3 text-left">Processing Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    <tr>
                      <td className="px-4 py-3 text-neutral-700 font-medium">
                        0–7 days (no significant usage)
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                          100% refund
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        7–10 business days
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-neutral-700 font-medium">
                        8–30 days
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
                          Pro-rata refund
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        10–14 business days
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-neutral-700 font-medium">
                        31+ days
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
                          Case-by-case
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        Subject to review
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <P>
                All refunds will be credited to the original payment method used
                at the time of purchase. We reserve the right to deduct a payment
                gateway processing fee (typically 2–3%) from the refund amount.
              </P>
              <P>
                In the event the original payment method is no longer available,
                refunds will be processed via NEFT/RTGS bank transfer to a
                verified bank account provided by the College Partner.
              </P>
            </Section>

            {/* 5. Non-Refundable Situations */}
            <Section
              id="non-refundable"
              number="5"
              title="Non-Refundable Situations"
            >
              <P>
                Refunds will <strong>not</strong> be issued in the following
                circumstances:
              </P>
              <UL
                items={[
                  "The subscription has been active for more than 90 days with regular use",
                  "The college profile has received more than 50 student views during the subscription period",
                  "Student applications have been received and processed through the platform",
                  "Advertisement campaigns have been activated and served to users",
                  "The account has been suspended or terminated due to violations of our Terms & Conditions",
                  "Cancellation request is made after the subscription renewal has already been processed and the new term has begun",
                  "Customised or bespoke packages that were specifically developed for a College Partner",
                  "Failure to use the services is not a valid ground for refund once the 7-day window has passed",
                ]}
              />

              <InfoBox
                icon="warning"
                color="bg-amber-50 border-amber-200 text-amber-800"
                title="Important Note on Partial Usage"
              >
                <p>
                  If you have partially used the service (e.g., your college
                  profile has been published and received student traffic), a
                  pro-rata deduction will be applied even within the 7-day
                  window. The deduction is calculated based on the number of days
                  elapsed and usage metrics.
                </p>
              </InfoBox>
            </Section>

            {/* 6. Refund Process */}
            <Section id="process" number="6" title="Refund Process">
              <P>
                To request a refund, please follow these steps:
              </P>

              <div className="space-y-3">
                {[
                  {
                    step: "1",
                    title: "Submit a Refund Request",
                    desc: "Email support@admissionx.in with the subject line \"Refund Request — [Your College Name]\". Include your College Partner ID, registered email address, transaction ID, and reason for the refund.",
                  },
                  {
                    step: "2",
                    title: "Acknowledgement",
                    desc: "We will acknowledge your request within 2 business days and provide a reference number for tracking.",
                  },
                  {
                    step: "3",
                    title: "Review",
                    desc: "Our team will review the request against this policy and usage data. We may contact you for additional information.",
                  },
                  {
                    step: "4",
                    title: "Decision",
                    desc: "You will receive a decision within 7 business days of our acknowledgement. If approved, the refund will be processed within the timelines stated above.",
                  },
                  {
                    step: "5",
                    title: "Credit",
                    desc: "Refunds are credited to the original payment method. You will receive an email confirmation once the credit has been initiated.",
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="flex items-start gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-100"
                  >
                    <span className="w-7 h-7 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                      {item.step}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-neutral-800 mb-0.5">
                        {item.title}
                      </p>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* 7. Contact */}
            <Section id="contact" number="7" title="Contact Us">
              <P>
                For all cancellation and refund queries, please contact us
                through the following channels:
              </P>

              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                {[
                  {
                    icon: "mail",
                    label: "Email",
                    value: "support@admissionx.in",
                    href: "mailto:support@admissionx.in",
                  },
                  {
                    icon: "schedule",
                    label: "Response Time",
                    value: "Within 2 business days",
                    href: null,
                  },
                  {
                    icon: "business",
                    label: "Billing Queries",
                    value: "billing@admissionx.in",
                    href: "mailto:billing@admissionx.in",
                  },
                  {
                    icon: "support_agent",
                    label: "Support Hours",
                    value: "Mon–Sat, 9 AM – 6 PM IST",
                    href: null,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-100"
                  >
                    <span
                      className="material-symbols-outlined text-red-500 text-[20px] flex-shrink-0"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {item.icon}
                    </span>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-sm font-semibold text-red-600 hover:underline"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-neutral-700">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <P>
                AdmissionX reserves the right to modify this policy at any time.
                Changes will be communicated via email to registered College
                Partners and posted on this page with an updated effective date.
                Continued use of the platform following any changes constitutes
                acceptance of the revised policy.
              </P>
            </Section>

            {/* Related links */}
            <div className="pt-6 border-t border-neutral-100">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">
                Related Policies
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "Privacy Policy",       href: "/privacy-policy"       },
                  { label: "Terms & Conditions",   href: "/terms-and-conditions" },
                  { label: "Disclaimer",           href: "/disclaimer"           },
                  { label: "Contact Us",           href: "/contact-us"           },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 bg-neutral-100 hover:bg-red-50 hover:text-red-600 px-3.5 py-2 rounded-xl transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      open_in_new
                    </span>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
