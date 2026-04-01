import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Help Center — FAQs & Support | AdmissionX",
  description:
    "Find answers to common questions about AdmissionX — student registration, college signups, applications, technical issues, and billing.",
  keywords:
    "AdmissionX help, FAQs, support, student questions, college questions, account help",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface FAQ {
  q: string;
  a: string;
}

interface Category {
  id: string;
  icon: string;
  label: string;
  color: string;
  bg: string;
  border: string;
  faqs: FAQ[];
}

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: "students",
    icon: "school",
    label: "For Students",
    color: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
    faqs: [
      {
        q: "How do I create a student account on AdmissionX?",
        a: "Click the 'Sign Up' button in the top navigation and select 'Student'. Fill in your name, email address, and a secure password. You will receive a confirmation email — click the link inside to activate your account and complete your profile.",
      },
      {
        q: "Is student registration free?",
        a: "Yes. Creating a student account, browsing colleges, exploring exams, and reading all content on AdmissionX is completely free for students. There are no hidden charges for any student-facing features.",
      },
      {
        q: "How do I search and filter colleges?",
        a: "Visit the 'Search Colleges' page and use the filter panel on the left to narrow results by stream, degree, city, state, fees range, college type, and more. You can also sort results by rating, ranking, or number of students.",
      },
      {
        q: "How do I apply to a college through AdmissionX?",
        a: "Navigate to the college's profile page and click 'Apply Now'. You will need to complete your student profile first (including academic marks and documents), then fill in the application form and submit. You can track your application status from your dashboard under 'My Applications'.",
      },
      {
        q: "Can I save colleges I am interested in?",
        a: "Yes — click the bookmark icon on any college card or profile page to save it. All bookmarked colleges appear in your student dashboard under the 'Bookmarks' tab for easy reference.",
      },
      {
        q: "How do I update my academic information and documents?",
        a: "Log in and go to your Student Dashboard. Under the 'Profile' tab, you can update personal details and academic marks. Under the 'Documents' tab, you can upload mark sheets, certificates, and identity documents that are shared with colleges when you apply.",
      },
      {
        q: "I forgot my password. How do I reset it?",
        a: "Click 'Login', then 'Forgot Password'. Enter the email address linked to your account and we will send a password-reset link. The link is valid for 1 hour. Check your spam folder if you do not receive the email within a few minutes.",
      },
      {
        q: "Can I apply to multiple colleges at the same time?",
        a: "Yes, there is no limit on the number of colleges you can apply to. All your applications appear in your dashboard with individual status tracking so you can monitor each one independently.",
      },
      {
        q: "How will I know if a college responds to my application?",
        a: "Your application status is updated in real time in your dashboard. Colleges can update the status to 'Reviewing', 'Accepted', 'Rejected', or 'Waitlisted'. We recommend checking your dashboard regularly during the admission season.",
      },
      {
        q: "Is my personal information shared without my consent?",
        a: "No. Your personal information is only shared with a college when you explicitly submit an application to that college. Please read our Privacy Policy for full details on how your data is handled.",
      },
    ],
  },
  {
    id: "colleges",
    icon: "apartment",
    label: "For Colleges",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    faqs: [
      {
        q: "How does a college register on AdmissionX?",
        a: "Visit the 'College Sign Up' page and fill in your institution's details — name, email, phone number, and basic college information. Our team will review your application and approve or contact you within 2–3 business days. You will receive login credentials once approved.",
      },
      {
        q: "What information can a college add to its profile?",
        a: "Colleges can add their full profile including banner image, description, establishment year, campus address, website, accreditation, courses offered, fee structure, facilities, faculty details, gallery images, placements data, scholarships, and more. A complete profile significantly improves visibility to students.",
      },
      {
        q: "How do college subscription packages work?",
        a: "AdmissionX offers tiered subscription packages for colleges that include profile visibility, student application access, analytics, and promotional placement. Package pricing and duration details are shared during the approval process. You can view your current package in the college dashboard under Settings.",
      },
      {
        q: "Can a college update its own profile after it is live?",
        a: "Yes. Once logged in, college administrators can edit all sections of their profile at any time through the College Dashboard. Changes are reflected on the live listing within minutes.",
      },
      {
        q: "How does a college receive and manage student applications?",
        a: "All incoming applications appear in the 'Applications' section of the College Dashboard. You can view the student's profile, academic records, and submitted documents, then update the application status (Reviewing / Accepted / Rejected / Waitlisted).",
      },
      {
        q: "What happens if my college's signup is rejected?",
        a: "Our admin team may reject a signup if the submitted information is incomplete, unverifiable, or does not meet our listing criteria. You will receive an email explaining the reason. You may resubmit after correcting the issues, or contact our support team for clarification.",
      },
      {
        q: "How can I add courses and fee details to my college profile?",
        a: "Go to College Dashboard → Courses section. Click 'Add Course' and fill in the course name, degree type, duration, fees, and eligibility criteria. You can add multiple courses. Detailed fee information helps students make informed decisions and improves application quality.",
      },
      {
        q: "How do I contact AdmissionX support as a college partner?",
        a: "You can reach us at colleges@admissionx.in or through the Contact Us page. College partners with active subscriptions receive priority support with a dedicated response within 24 hours on business days.",
      },
    ],
  },
  {
    id: "technical",
    icon: "build",
    label: "Technical Issues",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    faqs: [
      {
        q: "I can't log in to my account. What should I do?",
        a: "First, ensure you are using the correct email address and that Caps Lock is off. Try resetting your password via 'Forgot Password'. If you still cannot log in after resetting, clear your browser cache and cookies, then try again. If the problem persists, contact us at support@admissionx.in with your registered email.",
      },
      {
        q: "The website is not loading properly. How do I fix this?",
        a: "Try a hard refresh (Ctrl + Shift + R on Windows, Cmd + Shift + R on Mac). If that does not help, clear your browser cache, disable any browser extensions, and try again. AdmissionX works best on the latest versions of Chrome, Firefox, Safari, and Edge.",
      },
      {
        q: "My profile changes are not being saved. What is wrong?",
        a: "Make sure all required fields are filled in correctly before clicking 'Save'. If you see an error message, address the highlighted fields and try again. If the issue continues, log out, log back in, and retry. Contact support if the problem is persistent.",
      },
      {
        q: "I uploaded a document but it is not appearing. What should I do?",
        a: "Check that your file meets the requirements: PDF or image format (JPG/PNG), and no larger than 5 MB. Uploading very large files may time out on slower connections. Try compressing the file and re-uploading. If the issue continues, try a different browser.",
      },
      {
        q: "I received an error message during application submission. Was it submitted?",
        a: "If you see a clear error message, your application was likely not submitted. Check the 'My Applications' section in your dashboard — if it does not appear there, the submission did not go through. Try submitting again. If you continue to see errors, take a screenshot and email it to support@admissionx.in.",
      },
      {
        q: "Is AdmissionX available as a mobile app?",
        a: "AdmissionX is currently available as a fully responsive web application accessible from any smartphone browser. A dedicated mobile app is planned for a future release. You can add the website to your home screen for an app-like experience.",
      },
      {
        q: "How do I change the email address on my account?",
        a: "Email address changes must be verified for security. Go to Dashboard → Settings, click 'Change Email', and enter your new email address. A verification link will be sent to the new address. Confirm it to complete the change.",
      },
      {
        q: "How do I delete my account?",
        a: "Account deletion requests can be submitted through the Contact Us page or by emailing privacy@admissionx.in. Please note that deleting your account will permanently remove all your data, applications, and bookmarks. We process deletion requests within 7 business days.",
      },
    ],
  },
  {
    id: "billing",
    icon: "payments",
    label: "Billing & Payments",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    faqs: [
      {
        q: "Is AdmissionX free for students?",
        a: "Yes, completely. Students can register, search colleges, explore exams, read blogs, and submit applications at no cost. AdmissionX will always remain free for students.",
      },
      {
        q: "What payment methods are accepted for college subscriptions?",
        a: "We accept all major credit and debit cards, UPI (GPay, PhonePe, Paytm), net banking, and NEFT/RTGS bank transfers for college subscription payments. All transactions are secured by industry-standard SSL encryption.",
      },
      {
        q: "Where can I find my payment receipts and invoices?",
        a: "College administrators can access all payment history, receipts, and GST invoices from the College Dashboard under Settings → Billing. Receipts are also emailed to the registered college email address after each successful transaction.",
      },
      {
        q: "What is the cancellation and refund policy for college packages?",
        a: "College subscription packages can be cancelled within 7 days of purchase for a full refund, provided the college profile has not been published live. After 7 days or once the profile is live, a partial refund may be available on a pro-rated basis for the unused period. Please read our full Cancellation & Refunds Policy for complete details.",
      },
      {
        q: "My payment was deducted but my package is not active. What do I do?",
        a: "Payments occasionally take up to 2 hours to reflect due to bank processing times. If your package is still not activated after 2 hours, please email billing@admissionx.in with your transaction ID, payment date, and amount. We will resolve it within 1 business day.",
      },
      {
        q: "Does AdmissionX charge GST on college subscription packages?",
        a: "Yes, GST at 18% is applicable on all college subscription packages as per Indian tax regulations. The GST amount is displayed clearly during checkout and is included in the invoice issued after payment.",
      },
      {
        q: "Can I upgrade or downgrade my college subscription package?",
        a: "Yes. Contact our team at colleges@admissionx.in or through the Contact Us page to request a package change. Upgrades take effect immediately with a pro-rated charge. Downgrades take effect at the end of your current billing cycle.",
      },
      {
        q: "What happens when my college subscription expires?",
        a: "Your college profile will remain visible in search results but will be deprioritised in ranking. You will not receive new student applications until the subscription is renewed. Your profile data and application history are preserved for 90 days, after which they may be archived.",
      },
    ],
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HelpCenterPage() {
  const totalFaqs = CATEGORIES.reduce((s, c) => s + c.faqs.length, 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="bg-neutral-900 pt-24 pb-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="text-neutral-300">Help Center</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                  <span className="material-symbols-outlined text-[13px]">
                    help
                  </span>
                  Support
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
                Help{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">
                  Center
                </span>
              </h1>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-lg">
                Find answers to frequently asked questions. Can't find what
                you're looking for?{" "}
                <Link
                  href="/contact-us"
                  className="text-sky-400 hover:text-sky-300 underline underline-offset-2"
                >
                  Contact our support team
                </Link>
                .
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-4 flex-shrink-0">
              <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center min-w-[90px]">
                <p className="text-2xl font-black text-white">{CATEGORIES.length}</p>
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mt-0.5">
                  Topics
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center min-w-[90px]">
                <p className="text-2xl font-black text-white">{totalFaqs}</p>
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mt-0.5">
                  FAQs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category quick-jump strip ──────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-100 sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full border transition-colors hover:shadow-sm ${cat.bg} ${cat.color} ${cat.border}`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {cat.icon}
                </span>
                {cat.label}
              </a>
            ))}
            <a
              href="/contact-us"
              className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 transition-colors ml-2"
            >
              <span className="material-symbols-outlined text-[15px]">
                support_agent
              </span>
              Contact Support
            </a>
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 space-y-16">
        {CATEGORIES.map((cat) => (
          <section key={cat.id} id={cat.id} className="scroll-mt-20">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-10 h-10 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center flex-shrink-0`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {cat.icon}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-black text-neutral-900">
                  {cat.label}
                </h2>
                <p className="text-xs text-neutral-400 font-medium">
                  {cat.faqs.length} questions
                </p>
              </div>
            </div>

            {/* Accordion list */}
            <div className="space-y-2">
              {cat.faqs.map((faq, idx) => (
                <details
                  key={idx}
                  className="group bg-white border border-neutral-100 rounded-2xl overflow-hidden hover:border-neutral-200 transition-colors"
                >
                  <summary
                    className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none"
                    // Remove default browser triangle
                  >
                    <span className="text-sm font-semibold text-neutral-800 leading-snug">
                      {faq.q}
                    </span>
                    {/* Plus/minus icon via CSS group-open */}
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-100 group-open:bg-red-100 flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-[16px] text-neutral-500 group-open:text-red-600 transition-colors group-open:[content:'remove'] ">
                        add
                      </span>
                    </span>
                  </summary>
                  <div className="px-5 pb-5">
                    <div className="pt-1 border-t border-neutral-100">
                      <p className="text-sm text-neutral-600 leading-relaxed pt-3">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}

        {/* ── Still need help? ─────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[28px] text-white">
              support_agent
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-black text-white mb-1">
              Still can't find what you're looking for?
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Our support team is available Monday–Saturday, 10 AM–6 PM IST.
              Average response time is under 4 hours on business days.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              href="/contact-us"
              className="inline-flex items-center gap-2 bg-white text-neutral-900 hover:bg-neutral-100 font-bold text-sm px-5 py-3 rounded-xl transition-colors shadow-sm whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[17px]">
                mail
              </span>
              Contact Us
            </Link>
            <a
              href="mailto:support@admissionx.in"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm px-5 py-3 rounded-xl transition-colors whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[17px]">
                email
              </span>
              Email Support
            </a>
          </div>
        </div>

        {/* ── Quick links ───────────────────────────────────────────────────── */}
        <div>
          <h3 className="text-sm font-black text-neutral-500 uppercase tracking-wider mb-4">
            Quick Links
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Search Colleges",      href: "/search",              icon: "search"           },
              { label: "Browse Exams",         href: "/examination",         icon: "quiz"             },
              { label: "Explore Streams",      href: "/stream",              icon: "category"         },
              { label: "Popular Careers",      href: "/popular-careers",     icon: "work"             },
              { label: "Education Blogs",      href: "/education-blogs",     icon: "article"          },
              { label: "Latest News",          href: "/news",                icon: "newspaper"        },
              { label: "Student Signup",       href: "/signup/student",      icon: "person_add"       },
              { label: "College Signup",       href: "/signup/college",      icon: "apartment"        },
              { label: "Privacy Policy",       href: "/privacy-policy",      icon: "policy"           },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2.5 bg-white border border-neutral-100 rounded-xl px-4 py-3 text-xs font-semibold text-neutral-700 hover:border-red-200 hover:text-red-600 hover:bg-red-50/50 transition-all group"
              >
                <span className="material-symbols-outlined text-[16px] text-neutral-400 group-hover:text-red-500 transition-colors">
                  {link.icon}
                </span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}




