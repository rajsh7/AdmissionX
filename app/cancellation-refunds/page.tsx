import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Cancellation, Refunds & Admission Registration Policy | AdmissionX",
  description:
    "Read AdmissionX's cancellation, refund, and admission registration policy for students, institutions, and service providers.",
};

const LAST_UPDATED = "May 8, 2026";

export default function CancellationRefundsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <div className="bg-neutral-900 pb-14 pt-24 lg:pt-[116px]">
        <div className="w-full px-6 sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <div className="flex-shrink-0 rounded-2xl border border-red-500/20 bg-red-500/10 p-3">
              <span
                className="material-symbols-outlined text-[28px] text-red-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                receipt_long
              </span>
            </div>
            <div className="mt-4">
              <h1 className="mb-2 text-3xl font-black leading-tight text-white sm:text-4xl">
                Cancellation, Refunds & Admission Registration Policy
              </h1>
              <p className="mx-auto max-w-3xl text-sm leading-relaxed text-neutral-400">
                Read our no refund, no return, admission cancellation, and
                registration policy applicable to students, institutions, and
                service providers using AdmissionX.
              </p>
              <p className="mt-3 text-xs text-neutral-500">
                Last updated:{" "}
                <span className="font-semibold text-neutral-300">{LAST_UPDATED}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-[58px] z-20 border-b border-neutral-100 bg-white lg:top-[116px]">
        <div className="w-full overflow-x-auto px-6 py-3 sm:px-8 lg:px-10">
          <div className="flex items-center gap-1 whitespace-nowrap text-xs font-semibold">
            {[
              ["#refunds", "Refunds"],
              ["#cancellation", "Cancellation & Return"],
              ["#registration", "Admission Registration Policy"],
              ["#contact", "Contact"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-lg px-3 py-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full py-12">
        <div className="overflow-hidden border-y border-neutral-100 bg-white shadow-sm">
          <div className="flex items-start gap-3 border-b border-blue-100 bg-blue-50 px-6 py-4 sm:px-8 lg:px-10">
            <span
              className="material-symbols-outlined mt-0.5 flex-shrink-0 text-[18px] text-blue-500"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              info
            </span>
            <p className="text-sm text-blue-800">
              Please review this policy carefully before booking admission or
              purchasing any services through AdmissionX.
            </p>
          </div>

          <div className="space-y-12 px-6 py-10 sm:px-8 lg:px-10">
            <section id="refunds">
              <SectionHeading number="1" title="Refunds" />
              <Prose>
                Customers agree that we follow a &ldquo;No Refund
                Policy&rdquo; at www.admissionx.com. Service providers agree
                that www.admissionx.com is not responsible for refunding the
                amount paid for acquiring the enlisting services under the
                varied packages on the website.
              </Prose>
              <Prose>
                The customer support team of www.admissionx.com should be
                approached in case of any feedback, complaint, or suggestions.
                The Support Team will take responsibility for resolution of a
                problem within 15 days.
              </Prose>
              <InfoBox title="Refund Summary">
                <BulletList
                  items={[
                    "AdmissionX follows a No Refund Policy by default.",
                    "Service providers are responsible for understanding that listing or package payments are non-refundable unless explicitly stated otherwise.",
                    "Support-related complaints, feedback, or suggestions should be sent to the AdmissionX support team.",
                    "The support team will aim to resolve reported issues within 15 days.",
                  ]}
                />
              </InfoBox>
            </section>

            <Divider />

            <section id="cancellation">
              <SectionHeading number="2" title="Cancellation and Return" />
              <Prose>
                Once a student is registered or admitted in an
                institute/university for admission, cancellation of the
                admission is not possible under any circumstances.
              </Prose>
              <Prose>
                We strictly follow a &ldquo;No Return Policy&rdquo; at
                admissionx.com.
              </Prose>
              <InfoBox title="Cancellation Summary">
                <BulletList
                  items={[
                    "Admission cancellation is not possible once registration or admission has been completed.",
                    "AdmissionX follows a strict No Return Policy.",
                  ]}
                />
              </InfoBox>
            </section>

            <Divider />

            <section id="registration">
              <SectionHeading number="3" title="Admission Registration Policy" />
              <BulletList
                items={[
                  "The admission registration will be deemed void if any details provided by the student are false. It is then the institution's discretion to accept or reject the application.",
                  "The annual fee for the student for any academic year, during the entire course, will not exceed the annual fee amount mentioned in the provisional admission letter.",
                  "If the student fails to report to the institution for document verification and completing the remaining formalities by the due date, then the provisional admission will be deemed void and any fee paid to AdmissionX shall be forfeited.",
                  "At the time of booking admission online, the student pays Rs. 499 as a part of the annual fee of the institution. The institution agrees to deduct this amount from the 1st year fee chargeable to the student.",
                  "The institution cannot deny admission to any student who is in possession of a valid provisional admission letter issued by AdmissionX. However, the institution has the right to deny admission to any student who appears after the due date.",
                  "The student is not entitled to a refund of the amount paid to AdmissionX if they cancel their admission after the generation of the provisional admission letter.",
                  "However, the student is entitled to a half refund minus transaction charges if they cancel the admission within 3 working days of applying for such admission.",
                ]}
              />
            </section>

            <Divider />

            <section id="contact">
              <SectionHeading number="4" title="Contact for Feedback or Complaints" />
              <Prose>
                The customer support team of www.admissionx.com should be
                approached in case of any feedback, complaint, or suggestions.
              </Prose>
              <Prose>
                If you have questions about this policy, please contact the
                support team for assistance. The Support Team will take
                responsibility for resolution of a problem within 15 days.
              </Prose>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
                <div className="space-y-2 text-sm text-neutral-600">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-neutral-400">
                      language
                    </span>
                    <span>www.admissionx.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-neutral-400">
                      mail
                    </span>
                    <span>Contact AdmissionX support team for complaints and feedback</span>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex flex-col items-start justify-between gap-4 border-t border-neutral-100 pt-8 sm:flex-row sm:items-center">
              <p className="text-xs text-neutral-400">
                © 2025 AdmissionX. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-xs">
                <Link
                  href="/privacy-policy"
                  className="text-neutral-500 transition-colors hover:text-red-600"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/contact-us"
                  className="text-neutral-500 transition-colors hover:text-red-600"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function SectionHeading({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <h2 className="mb-4 flex items-start gap-3 text-lg font-black text-neutral-900">
      <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-xs font-black text-red-600">
        {number}
      </span>
      <span>{title}</span>
    </h2>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-sm leading-relaxed text-neutral-600">{children}</p>;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-600">
          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function InfoBox({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
      <h3 className="mb-3 text-sm font-bold text-neutral-800">{title}</h3>
      {children}
    </div>
  );
}

function Divider() {
  return <hr className="border-neutral-100" />;
}
