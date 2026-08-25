import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Site Map | AdmissionX",
  description: "Browse all directories, colleges, entrance exams, courses, and educational blogs on AdmissionX.",
};

const SITEMAP_SECTIONS = [
  {
    title: "Discover Colleges & Universities",
    links: [
      { label: "Top Colleges", href: "/top-colleges" },
      { label: "Top Universities", href: "/top-university" },
      { label: "Engineering Colleges", href: "/top-colleges?stream=engineering" },
      { label: "Management Colleges", href: "/top-colleges?stream=management" },
      { label: "Medical Colleges", href: "/top-colleges?stream=medicine" },
      { label: "Study Abroad", href: "/study-abroad" },
    ],
  },
  {
    title: "Exams & Courses",
    links: [
      { label: "Entrance Examinations", href: "/examination" },
      { label: "JEE Main", href: "/examination/engineering/jee-main" },
      { label: "NEET", href: "/examination/medicine/neet" },
      { label: "CAT", href: "/examination/management/cat" },
      { label: "Search Courses", href: "/search" },
    ],
  },
  {
    title: "Resources & News",
    links: [
      { label: "Education Blogs", href: "/blogs" },
      { label: "News & Announcements", href: "/news" },
      { label: "Frequently Asked Questions (FAQ)", href: "/faq" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Company & Legal",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact-us" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
      { label: "Cancellation & Refund Policy", href: "/cancellation-refunds" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
  },
];

export default function SiteMapPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-16 sm:py-24">
        <div className="mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            Directory
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-4 text-slate-900">
            AdmissionX Site Map
          </h1>
          <p className="text-slate-600 mt-2 text-base">
            Quickly navigate across all major sections, resources, and discovery hubs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SITEMAP_SECTIONS.map((section, idx) => (
            <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                {section.title}
              </h2>
              <ul className="space-y-2.5">
                {section.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 hover:text-primary transition-colors block py-0.5"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
