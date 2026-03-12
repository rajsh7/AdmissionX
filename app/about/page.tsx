import pool from "@/lib/db";
import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "About Us — AdmissionX | India's College Discovery Platform",
  description:
    "Learn about AdmissionX — our mission to democratise access to quality education information, our story, and the team behind India's trusted college admissions platform.",
  keywords:
    "about admissionx, college admissions platform, education technology india, admissionx team, college discovery",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function safeCount(sql: string): Promise<number> {
  try {
    const [rows] = (await pool.query(sql)) as [{ cnt: number }[], unknown];
    return Number(rows[0]?.cnt ?? 0);
  } catch {
    return 0;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AboutPage() {
  const [colleges, students, exams, courses] = await Promise.all([
    safeCount("SELECT COUNT(*) AS cnt FROM collegeprofile"),
    safeCount("SELECT COUNT(*) AS cnt FROM next_student_signups"),
    safeCount("SELECT COUNT(*) AS cnt FROM examination_details WHERE status = 1"),
    safeCount("SELECT COUNT(*) AS cnt FROM course WHERE name IS NOT NULL AND name != ''"),
  ]);

  const STATS = [
    { value: Math.max(colleges, 100),  suffix: "+", label: "Partner Colleges",     icon: "account_balance" },
    { value: Math.max(students, 500),  suffix: "+", label: "Students Registered",  icon: "group"           },
    { value: Math.max(exams, 50),      suffix: "+", label: "Entrance Exams Listed",icon: "quiz"            },
    { value: Math.max(courses, 200),   suffix: "+", label: "Courses Available",    icon: "menu_book"       },
  ];

  const FEATURES = [
    {
      icon: "search",
      title: "Smart College Search",
      desc: "Filter by stream, degree, location, fees, and ranking to find colleges that match exactly what you're looking for.",
      color: "bg-red-50 text-red-600",
    },
    {
      icon: "quiz",
      title: "Entrance Exam Hub",
      desc: "Comprehensive exam guides covering eligibility, syllabus, important dates, admit cards, and results — all in one place.",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: "description",
      title: "Online Applications",
      desc: "Apply to multiple colleges through a single unified application process, track your status in real time.",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: "travel_explore",
      title: "Study Abroad",
      desc: "Explore top international universities across the US, UK, Australia, Canada, Germany, and more.",
      color: "bg-violet-50 text-violet-600",
    },
    {
      icon: "work",
      title: "Career Guidance",
      desc: "Discover career paths matched to your interests — with salary insights, skill requirements, and top colleges for each role.",
      color: "bg-amber-50 text-amber-600",
    },
    {
      icon: "newspaper",
      title: "Education News & Blogs",
      desc: "Stay updated with the latest admission notifications, policy changes, scholarship announcements, and expert articles.",
      color: "bg-teal-50 text-teal-600",
    },
  ];

  const VALUES = [
    {
      icon: "diversity_3",
      title: "Accessibility First",
      desc: "Every student, regardless of background or location, deserves clear, accurate information about their educational options.",
    },
    {
      icon: "verified",
      title: "Accuracy & Trust",
      desc: "We work directly with institutions to verify college profiles, fees, and admission data before publishing.",
    },
    {
      icon: "bolt",
      title: "Student-Centric Speed",
      desc: "Deadlines don't wait. Our platform surfaces the most time-sensitive information — exam dates, application windows, results — at a glance.",
    },
    {
      icon: "open_source",
      title: "Transparency",
      desc: "No hidden rankings, no paid placements in search results. Our listings are ordered on merit and relevance to the student.",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-neutral-900 pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-8">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-neutral-300">About Us</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide mb-5">
              <span className="material-symbols-outlined text-[13px]">info</span>
              Our Story
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-5">
              Helping Every Student Find{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                Their Right College
              </span>
            </h1>
            <p className="text-neutral-400 text-base leading-relaxed max-w-2xl">
              AdmissionX is India&apos;s trusted college discovery and admissions platform.
              We connect ambitious students with the right institutions, exams, and career
              paths — simplifying one of the most important decisions of their lives.
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-neutral-100">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center justify-center gap-1.5 py-8 px-4 text-center">
                <span
                  className="material-symbols-outlined text-[28px] text-red-500 mb-1"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {stat.icon}
                </span>
                <p className="text-3xl font-black text-neutral-900">
                  {stat.value.toLocaleString("en-IN")}{stat.suffix}
                </p>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mission & Vision ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Mission */}
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-8 lg:p-10">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
              <span
                className="material-symbols-outlined text-[26px] text-red-500"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                target
              </span>
            </div>
            <h2 className="text-xl font-black text-neutral-900 mb-3">Our Mission</h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              To democratise access to quality education information for every student in
              India — regardless of geography, background, or resources. We believe that
              choosing the right college should be driven by knowledge, not guesswork.
            </p>
            <p className="text-neutral-600 leading-relaxed">
              We aggregate, verify, and present college, exam, and career data in a format
              that is actionable and easy to understand — so students can make confident,
              well-informed decisions.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-8 lg:p-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-5">
              <span
                className="material-symbols-outlined text-[26px] text-amber-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                visibility
              </span>
            </div>
            <h2 className="text-xl font-black text-white mb-3">Our Vision</h2>
            <p className="text-neutral-400 leading-relaxed mb-4">
              To become the definitive starting point for every student&apos;s higher
              education journey — from discovering the right stream in Class 11 to
              enrolling in a college that sets them up for a fulfilling career.
            </p>
            <p className="text-neutral-400 leading-relaxed">
              We envision a future where every Indian student has a personalised, data-driven
              roadmap for their academic and professional life — and AdmissionX is the
              platform that makes it possible.
            </p>
          </div>
        </div>
      </div>

      {/* ── What We Offer ─────────────────────────────────────────────────── */}
      <div className="bg-white border-y border-neutral-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-600 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide mb-4">
              <span className="material-symbols-outlined text-[13px]">apps</span>
              Platform Features
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-3">
              Everything You Need, In One Place
            </h2>
            <p className="text-neutral-500 text-sm max-w-xl mx-auto leading-relaxed">
              AdmissionX brings together all the tools a student needs to research, apply,
              and secure admission — without switching between multiple platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group bg-white rounded-2xl border border-neutral-100 hover:border-neutral-200 hover:shadow-md transition-all duration-300 p-6"
              >
                <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  <span
                    className="material-symbols-outlined text-[22px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {f.icon}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-neutral-900 mb-2">{f.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Our Values ───────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-600 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide mb-4">
            <span className="material-symbols-outlined text-[13px]">favorite</span>
            What We Stand For
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-3">
            Our Core Values
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="flex items-start gap-5 bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm"
            >
              <div className="w-11 h-11 rounded-xl bg-neutral-900 flex items-center justify-center flex-shrink-0">
                <span
                  className="material-symbols-outlined text-[20px] text-white"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {v.icon}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 mb-1.5">{v.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Our Story ────────────────────────────────────────────────────── */}
      <div className="bg-white border-y border-neutral-100 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-600 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide mb-5">
            <span className="material-symbols-outlined text-[13px]">history</span>
            How We Started
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-6">
            Built by Students, for Students
          </h2>
          <div className="space-y-4 text-neutral-600 text-sm leading-relaxed text-left">
            <p>
              AdmissionX was founded after witnessing firsthand the confusion students face
              when navigating the college admission process in India. With hundreds of
              colleges, dozens of entrance exams, and ever-changing cutoffs, the process is
              overwhelming — especially for students from smaller cities and towns who lack
              access to professional counselling.
            </p>
            <p>
              We started by building a simple college search tool. As more students began
              using the platform, we expanded into exam information, career guidance, and
              eventually a full admissions management system that lets colleges and students
              connect directly.
            </p>
            <p>
              Today, AdmissionX serves students across India, with partner colleges spanning
              engineering, medical, management, law, arts, and sciences — offering a
              comprehensive view of the Indian higher education landscape under one roof.
            </p>
          </div>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-10 lg:p-14 text-center border border-neutral-700">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
            Ready to find your ideal college?
          </h2>
          <p className="text-neutral-400 text-sm max-w-lg mx-auto mb-8 leading-relaxed">
            Join thousands of students who have used AdmissionX to discover colleges,
            prepare for exams, and take the next step in their academic journey.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-sm whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[17px]">search</span>
              Search Colleges
            </Link>
            <Link
              href="/contact-us"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[17px]">mail</span>
              Get in Touch
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
