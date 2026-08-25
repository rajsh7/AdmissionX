import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) | AdmissionX",
  description: "Find answers to frequently asked questions about college admissions, application tracking, fees, and counselling on AdmissionX.",
};

const FAQS = [
  {
    q: "What is AdmissionX?",
    a: "AdmissionX is an all-in-one college discovery and admission portal connecting aspiring students with verified colleges, universities, and specialized courses across India and abroad.",
  },
  {
    q: "How do I apply for a college through AdmissionX?",
    a: "Search for your desired course or college, click 'Apply Now', complete your profile with basic educational information, upload required documents, and submit your application online.",
  },
  {
    q: "Is there any application fee for applying?",
    a: "Many colleges on AdmissionX offer free applications. For colleges with application or processing fees, you can securely pay online via our integrated Easebuzz payment gateway.",
  },
  {
    q: "How do I track my admission and document verification status?",
    a: "Log in to your Student Dashboard to view real-time status updates, document verification notes, seat reservation confirmations, and counselling schedules.",
  },
  {
    q: "How can colleges partner with AdmissionX?",
    a: "Colleges and universities can register via the College Portal. Once approved by our team, partner institutions receive dedicated dashboard access to review applications and manage student admissions.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            Help & Support
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-4 text-slate-900">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-600 mt-3 text-base sm:text-lg">
            Have questions? We have answers. Find everything you need to know about navigating AdmissionX.
          </p>
        </div>

        <div className="space-y-6">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 flex items-start gap-3">
                <span className="text-primary font-black text-lg">Q.</span>
                <span>{faq.q}</span>
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed pl-7">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
