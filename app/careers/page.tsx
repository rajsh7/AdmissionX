import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Careers at AdmissionX | Join Our Team",
  description: "Explore exciting career opportunities at AdmissionX and help shape the future of higher education discovery and admissions.",
};

const POSITIONS = [
  {
    title: "Senior Full Stack Engineer (Next.js / Node.js)",
    department: "Engineering",
    location: "Remote / Hybrid (Noida, India)",
    type: "Full-Time",
  },
  {
    title: "Academic & College Relations Manager",
    department: "Institutional Partnerships",
    location: "Noida / Delhi NCR, India",
    type: "Full-Time",
  },
  {
    title: "Education Content & SEO Strategist",
    department: "Marketing",
    location: "Remote / Hybrid",
    type: "Full-Time",
  },
  {
    title: "Student Admissions & Counselling Specialist",
    department: "Student Support",
    location: "Noida, India",
    type: "Full-Time",
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            We are hiring
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-4 text-slate-900">
            Build the Future of Education with Us
          </h1>
          <p className="text-slate-600 mt-4 text-base sm:text-lg max-w-2xl mx-auto">
            At AdmissionX, we are empowering millions of students to find the best universities, courses, and scholarships worldwide.
          </p>
        </div>

        <div className="space-y-4">
          {POSITIONS.map((pos, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition-colors"
            >
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {pos.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-slate-500 font-medium">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">{pos.department}</span>
                  <span>•</span>
                  <span>{pos.location}</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-semibold">{pos.type}</span>
                </div>
              </div>
              <Link
                href="/contact-us"
                className="inline-flex items-center justify-center h-11 px-6 bg-slate-900 hover:bg-primary text-white text-sm font-semibold rounded-xl transition-colors shrink-0"
              >
                Apply Now
              </Link>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
