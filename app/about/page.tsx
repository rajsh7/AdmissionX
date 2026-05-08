import pool from "@/lib/db";
import Image from "next/image";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "About Us - AdmissionX | India's College Discovery Platform",
  description:
    "AdmissionX is a first of its kind platform based in New Delhi that connects students and institutions for admissions across courses, colleges, and cities.",
  keywords:
    "about admissionx, college admissions platform, education technology india, admissionx team, college discovery",
};

async function safeCount(sql: string): Promise<number> {
  try {
    const [rows] = (await pool.query(sql)) as [{ cnt: number }[], unknown];
    return Number(rows[0]?.cnt ?? 0);
  } catch {
    return 0;
  }
}

const values = [
  {
    title: "Student First",
    description:
      "We make every decision with student success, clarity, and confidence in mind.",
    icon: "favorite",
    color: "text-rose-500",
    bg: "bg-rose-50",
  },
  {
    title: "Truth & Transparency",
    description:
      "Clear information and trustworthy guidance are at the center of our platform.",
    icon: "verified_user",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    title: "Innovation",
    description:
      "We blend technology with human insight to make college discovery simpler.",
    icon: "lightbulb",
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
  {
    title: "Empowerment",
    description:
      "Students should feel informed, supported, and ready for what comes next.",
    icon: "workspace_premium",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
];

const journey = [
  { year: "2019", title: "Idea born", description: "Started with a simple mission to simplify admissions." },
  { year: "2020", title: "Platform launch", description: "Built the first version of our college discovery platform." },
  { year: "2022", title: "Nationwide growth", description: "Expanded reach across streams, cities, and counselling needs." },
  { year: "2024", title: "Trusted brand", description: "Serving students with verified data and admission support." },
];

export default async function AboutPage() {
  const [colleges, students, exams, courses] = await Promise.all([
    safeCount("SELECT COUNT(*) AS cnt FROM collegeprofile"),
    safeCount("SELECT COUNT(*) AS cnt FROM next_student_signups"),
    safeCount("SELECT COUNT(*) AS cnt FROM examination_details WHERE status = 1"),
    safeCount("SELECT COUNT(*) AS cnt FROM course WHERE name IS NOT NULL AND name != ''"),
  ]);

  const stats = [
    {
      value: `${Math.max(students, 12000).toLocaleString("en-IN")}+`,
      label: "Trusted Students",
      icon: "school",
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
    {
      value: `${Math.max(colleges, 300)}+`,
      label: "College Partners",
      icon: "apartment",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      value: `${Math.max(exams, 50)}+`,
      label: "Entrance Exams",
      icon: "workspace_premium",
      color: "text-violet-500",
      bg: "bg-violet-50",
    },
    {
      value: `${Math.max(courses, 80)}+`,
      label: "Areas of Interest",
      icon: "trophy",
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f3ef]">
      <Header />

      <main className="pt-24 lg:pt-[116px]">
        <div className="w-full border-y border-[#ece5de] bg-white">
          <section className="px-5 py-8 sm:px-8 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_520px] lg:items-start">
              <div className="text-center lg:text-left">
                <h1 className="text-[34px] font-black tracking-tight text-slate-900 sm:text-[42px]">
                  About AdmissionX
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-[14px] leading-7 text-slate-500 lg:mx-0">
                  AdmissionX is your trusted gateway to smarter college discovery,
                  seamless admissions, and brighter academic futures. We help students
                  explore colleges, courses, exams, and career opportunities with greater
                  clarity and confidence. Our platform brings together reliable
                  information, practical guidance, and student-focused tools in one place.
                  From discovering the right path to understanding eligibility, fees, and
                  admission updates, we make every step easier to navigate. AdmissionX is
                  built to simplify decisions, reduce confusion, and help every student
                  move closer to the future they want to build.
                </p>
              </div>

              <div className="rounded-[22px] border border-[#efe7e0] bg-white p-3 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)]">
                <div className="relative h-[290px] overflow-hidden rounded-[18px] bg-[#f7f9fb]">
                  <Image
                    src="/assets/img/bg/19.jpg"
                    alt="AdmissionX about us"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 520px"
                    priority
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[1.15fr_1fr]">
              <div className="rounded-[20px] border border-[#efe7e0] bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.22)]">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50">
                    <span className="material-symbols-outlined text-[20px] text-rose-500">
                      account_balance
                    </span>
                  </div>
                  <div>
                    <h2 className="text-[13px] font-bold text-slate-900">About AdmissionX</h2>
                    <p className="mt-1 text-[12px] leading-6 text-slate-500">
                      Our portal is a repository of reliable data covering over 31100
                      colleges, more than 50200 courses, and opportunities across 4000+
                      cities. Students can explore important admission details, compare
                      options with confidence, and stay updated with the latest
                      information, all from one trusted platform.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[20px] border border-[#efe7e0] bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.22)]"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${stat.bg}`}>
                      <span className={`material-symbols-outlined text-[18px] ${stat.color}`}>
                        {stat.icon}
                      </span>
                    </div>
                    <p className="mt-4 text-[24px] font-black text-slate-900">{stat.value}</p>
                    <p className="mt-1 text-[11px] font-medium text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="border-t border-[#f2ebe5] px-5 py-8 sm:px-8 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div>
                <h2 className="text-[22px] font-black text-slate-900">About AdmissionX</h2>
                <p className="mt-4 text-[13px] leading-7 text-slate-500">
                  AdmissionX is a first of its kind platform that helps connect students
                  and institutions for the purpose of admission in different courses. Our
                  portal is a repository of reliable data covering over 31100 colleges,
                  more than 50200 courses, and opportunities across 4000+ cities. We are
                  building a platform where students can discover the right academic path
                  with greater confidence, clarity, and convenience. From diploma programs
                  to undergraduate and postgraduate courses, AdmissionX brings together a
                  wide range of options for students from different streams and interests.
                  Our goal is to make the search process simpler, more transparent, and
                  easier to understand for every learner.
                </p>
                <p className="mt-4 text-[13px] leading-7 text-slate-500">
                  Whether it is a Diploma course in Computing, a Bachelor&apos;s course in
                  Engineering, or a Master&apos;s course in Management, Science, or IT, we
                  have it all in one place. With the help of the information provided on
                  our platform, students can easily access detailed insights on colleges,
                  admission criteria, eligibility, fees, scholarships, and the latest
                  updates without having to search across multiple sources. We believe that
                  better information leads to better decisions, and better decisions create
                  stronger futures. AdmissionX is designed to support students at every
                  step of their educational journey by making college discovery and
                  admissions more accessible, organised, and student-friendly.
                </p>
              </div>

              <div>
                <h2 className="text-[22px] font-black text-slate-900">Our Motto</h2>
                <p className="mt-2 text-[13px] leading-7 text-slate-500">
                  We stand for &quot;admission for all&quot; and are developing an online
                  platform where students from all over the country can connect with
                  different institutions and take admission in courses of their choice.
                </p>
                <p className="mt-3 text-[13px] leading-7 text-slate-500">
                  We realize that students and institutes both spend a considerable amount
                  of time and money on the admission process. Our aim is to make this
                  process less time-consuming as well economical for them. We are trying to
                  transform the way students take admission in our country, by making the
                  process of admission as easy as we can.
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {values.map((value) => (
                    <div
                      key={value.title}
                      className="rounded-[20px] border border-[#efe7e0] bg-white p-4 shadow-[0_16px_36px_-34px_rgba(15,23,42,0.22)]"
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${value.bg}`}>
                        <span className={`material-symbols-outlined text-[18px] ${value.color}`}>
                          {value.icon}
                        </span>
                      </div>
                      <h3 className="mt-4 text-[13px] font-bold text-slate-900">{value.title}</h3>
                      <p className="mt-2 text-[11px] leading-6 text-slate-500">
                        {value.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="border-t border-[#f2ebe5] px-5 py-8 sm:px-8 lg:px-10">
            <h2 className="text-[22px] font-black text-slate-900">Our Vision</h2>

            <p className="mt-4 max-w-4xl text-[13px] leading-7 text-slate-500">
              We want every student that leaves school to have access to higher education
              in an efficient and affordable manner. We are trying to bridge the gap
              between colleges and students and bringing college admission within the reach
              of every student.
            </p>
            <p className="mt-3 max-w-4xl text-[13px] leading-7 text-slate-500">
              With an aim to cut down the role of the long admission process, the long
              line and hustle for admission in colleges and other marketing channels which
              lead to high student acquisition cost, we are here trying to make admission
              accessible, affordable and incredible.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {journey.map((item, index) => (
                <div key={item.year} className="relative">
                  <div className="mb-4 hidden h-[2px] w-full bg-[#ebe2db] md:block" />
                  <div className="absolute left-0 top-[-6px] hidden h-3 w-3 rounded-full bg-[#ff5a3d] md:block" />
                  <p className="text-[12px] font-black text-[#ff5a3d]">{item.year}</p>
                  <h3 className="mt-2 text-[13px] font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 max-w-[220px] text-[11px] leading-6 text-slate-500">
                    {item.description}
                  </p>
                  {index < journey.length - 1 && (
                    <div className="mt-4 h-px w-full bg-[#ebe2db] md:hidden" />
                  )}
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
