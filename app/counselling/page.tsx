import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Free Counselling — Expert Admission Guidance | AdmissionX",
  description:
    "Get free expert counselling for JEE, NEET, CAT, CLAT and all major entrance exams. Our counsellors help you choose the right college and course.",
};

const COUNSELLING_TYPES = [
  {
    id: "jee",
    icon: "engineering",
    color: "from-blue-500 to-blue-700",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    label: "JEE / Engineering",
    body: "JOSAA, JAC & State JEE counselling for B.Tech admissions.",
    exams: ["JEE Main", "JEE Advanced", "BITSAT", "VITEEE"],
  },
  {
    id: "neet",
    icon: "medical_services",
    color: "from-red-500 to-rose-700",
    bg: "bg-red-50",
    iconColor: "text-red-600",
    label: "NEET / Medical",
    body: "MCC AIQ & state NEET counselling for MBBS, BDS, BAMS.",
    exams: ["NEET UG", "NEET PG", "AIIMS", "JIPMER"],
  },
  {
    id: "mba",
    icon: "trending_up",
    color: "from-purple-500 to-indigo-700",
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
    label: "CAT / MBA",
    body: "IIM & top MBA institute admissions via CAT, XAT, GMAT.",
    exams: ["CAT", "XAT", "SNAP", "NMAT"],
  },
  {
    id: "law",
    icon: "gavel",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    label: "CLAT / Law",
    body: "NLU admissions and top law college guidance via CLAT.",
    exams: ["CLAT", "AILET", "LSAT", "SLAT"],
  },
  {
    id: "state",
    icon: "location_city",
    color: "from-emerald-500 to-teal-700",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    label: "State Counselling",
    body: "State-specific merit-based counselling for all streams.",
    exams: ["MHT-CET", "KCET", "AP EAMCET", "TS EAMCET"],
  },
  {
    id: "abroad",
    icon: "public",
    color: "from-cyan-500 to-blue-600",
    bg: "bg-cyan-50",
    iconColor: "text-cyan-600",
    label: "Study Abroad",
    body: "UK, USA, Canada, Australia university admissions guidance.",
    exams: ["IELTS", "TOEFL", "GRE", "SAT"],
  },
];

const STEPS = [
  { icon: "person_add", label: "Register Free", desc: "Create your free student account on AdmissionX." },
  { icon: "quiz", label: "Share Your Profile", desc: "Tell us your exam scores, preferences and budget." },
  { icon: "support_agent", label: "Talk to a Counsellor", desc: "Get matched with an expert counsellor for your stream." },
  { icon: "check_circle", label: "Get Shortlisted Colleges", desc: "Receive a personalised list of colleges to apply to." },
];

export default function CounsellingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 relative">
      <div className="fixed inset-0 z-0 text-[0px] font-[0] leading-[0]">
        <Image
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000"
          alt="Campus Background" fill priority sizes="100vw" quality={80} className="object-cover"
        />
        <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10">
        <Header />

        {/* ── Hero ── */}
        <div className="pt-24 pb-16">
          <div className="w-full px-4 lg:px-8 xl:px-12 flex flex-col items-center text-center">
            <nav className="flex items-center justify-center gap-2 text-xs text-neutral-500 mb-6 font-medium">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-neutral-300">Counselling</span>
            </nav>

            <div className="w-full max-w-3xl flex flex-col items-center">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                  <span className="material-symbols-outlined text-[13px]">support_agent</span>
                  Free Counselling
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                Expert Guidance for{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                  Every Exam
                </span>
              </h1>
              <p className="text-neutral-400 text-base max-w-2xl leading-relaxed mb-8">
                Get free, personalised counselling for JEE, NEET, CAT, CLAT and all major entrance exams.
                Our experts help you choose the right college and course for your career goals.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/signup/student"
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-colors shadow-lg shadow-teal-600/20"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  Get Free Counselling
                </Link>
                <Link
                  href="/examination"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-colors border border-white/10"
                >
                  <span className="material-symbols-outlined text-[18px]">quiz</span>
                  Browse Exams
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full px-4 lg:px-8 xl:px-12 py-10 space-y-14">

          {/* ── How it works ── */}
          <section>
            <div className="mb-8 text-center">
              <h2 className="text-xl font-black text-white">How It Works</h2>
              <p className="text-sm text-neutral-300 mt-1">4 simple steps to get your personalised guidance</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {STEPS.map((step, i) => (
                <div key={step.label} className="bg-white rounded-2xl border border-neutral-100 p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-4 relative">
                    <span className="material-symbols-outlined text-[24px] text-teal-600" style={{ fontVariationSettings: "'FILL' 1" }}>{step.icon}</span>
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-black flex items-center justify-center">{i + 1}</span>
                  </div>
                  <h3 className="text-sm font-black text-neutral-900 mb-1">{step.label}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Counselling types ── */}
          <section>
            <div className="mb-8">
              <h2 className="text-xl font-black text-white">Counselling by Stream</h2>
              <p className="text-sm text-neutral-300 mt-1">Expert guidance for every major entrance exam</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {COUNSELLING_TYPES.map((type) => (
                <div key={type.id} className="bg-white rounded-2xl border border-neutral-100 p-6 hover:shadow-lg hover:border-teal-100 transition-all duration-200">
                  <div className={`w-12 h-12 rounded-2xl ${type.bg} flex items-center justify-center mb-4`}>
                    <span className={`material-symbols-outlined text-[24px] ${type.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{type.icon}</span>
                  </div>
                  <h3 className="text-base font-black text-neutral-900 mb-1">{type.label}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed mb-4">{type.body}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {type.exams.map((exam) => (
                      <span key={exam} className="text-[10px] font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">{exam}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="bg-gradient-to-r from-teal-900 to-neutral-900 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4 max-w-xl">
              <div className="w-12 h-12 rounded-2xl bg-teal-600/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[24px] text-teal-400" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
              </div>
              <div>
                <h3 className="text-white font-black text-lg mb-1">Talk to a Counsellor Today</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Register as a student and get matched with an expert counsellor for your stream — completely free.
                </p>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link
                href="/signup/student"
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors shadow-lg shadow-teal-600/20"
              >
                <span className="material-symbols-outlined text-[17px]">person_add</span>
                Register Free
              </Link>
              <Link
                href="/top-colleges"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors border border-white/10"
              >
                <span className="material-symbols-outlined text-[17px]">apartment</span>
                Top Colleges
              </Link>
            </div>
          </section>
        </div>

        <Footer />
      </div>
    </div>
  );
}




