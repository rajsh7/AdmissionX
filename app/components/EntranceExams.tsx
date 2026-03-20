"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { DbExam } from "../api/home/exams/route";

interface Exam {
  abbr: string;
  name: string;
  fullName: string;
  date: string;
  registration: string;
  color: string;
  bg: string;
  border: string;
  href: string;
}

interface EntranceExamsProps {
  dbExams?: DbExam[];
}

const STATIC_EXAMS: Exam[] = [
  {
    abbr: "JEE MAIN",
    name: "JEE MAIN",
    fullName: "Joint Entrance Examination",
    date: "24 Jan 2026",
    registration: "Registration Started",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
    href: "/examination/engineering/jee-main",
  },
  {
    abbr: "NEET",
    name: "NEET",
    fullName: "National Eligibility cum Entrance Test",
    date: "04 May 2026",
    registration: "Registration Started",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    href: "/examination/medical/neet-ug",
  },
  {
    abbr: "CAT",
    name: "CAT",
    fullName: "Common Admission Test",
    date: "24 Nov 2026",
    registration: "Registration Started",
    color: "text-pink-600",
    bg: "bg-pink-50",
    border: "border-pink-100",
    href: "/examination/management/cat",
  },
  {
    abbr: "GATE",
    name: "GATE",
    fullName: "Graduate Aptitude Test in Engineering",
    date: "01 Feb 2026",
    registration: "Registration Started",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-100",
    href: "/examination/engineering/gate",
  },
  {
    abbr: "CLAT",
    name: "CLAT",
    fullName: "Common Law Admission Test",
    date: "01 Dec 2026",
    registration: "Registration Started",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-100",
    href: "/examination/law/clat",
  },
  {
    abbr: "CUET",
    name: "CUET",
    fullName: "Common University Entrance Test",
    date: "15 May 2026",
    registration: "Registration Started",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
    href: "/examination/arts/cuet",
  },
];

export default function EntranceExams({ dbExams }: EntranceExamsProps) {
  // We use static exams for the redesign look as shown in the image,
  // but we can map dbExams if they exist and match the vibe.
  // For now, let's use the static ones to guarantee the design fidelity.
  const exams = STATIC_EXAMS;

  return (
    <section className="w-full py-16 lg:py-24 bg-[#f8fafc]/50">
      <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
           <div>
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Recent coming exams</h2>
              <p className="mt-3 text-slate-500 font-medium max-w-lg">
                Stay updated with the latest entrance examinations, registration dates, and results.
              </p>
           </div>
           <Link href="/examination" className="text-sm font-black text-[#008080] hover:underline underline-offset-4 uppercase tracking-widest">
              View All Exams
           </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
           {exams.map((exam, i) => (
             <motion.div
               key={exam.abbr}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5, delay: i * 0.05 }}
             >
                <Link 
                  href={exam.href}
                  className={`group relative flex flex-col p-6 rounded-[32px] border ${exam.border} ${exam.bg} transition-all hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1 active:scale-95 overflow-hidden h-full min-h-[180px]`}
                >
                   {/* Logo/Icon Container */}
                   <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm transition-transform group-hover:scale-110">
                         <span className={`text-sm font-black tracking-tight ${exam.color}`}>
                            {exam.abbr.split(' ')[0]}
                         </span>
                      </div>
                      <div className={`px-3 py-1 rounded-full bg-white/50 text-[10px] font-black uppercase tracking-wider ${exam.color} group-hover:bg-white transition-colors`}>
                         {exam.registration}
                      </div>
                   </div>

                   {/* Exam Info */}
                   <div className="flex-1">
                      <h3 className="text-lg font-black text-slate-900 leading-tight mb-1">{exam.name}</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{exam.fullName}</p>
                   </div>

                   {/* Footer Info */}
                   <div className="mt-6 flex items-center justify-between pt-4 border-t border-black/5">
                      <div className="flex items-center gap-2">
                         <span className="material-symbols-rounded text-slate-400 text-[18px]">calendar_today</span>
                         <span className="text-xs font-bold text-slate-600">Exam: {exam.date}</span>
                      </div>
                      <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center ${exam.color} shadow-sm transition-transform group-hover:translate-x-1`}>
                         <span className="material-symbols-rounded text-[20px]">arrow_forward</span>
                      </div>
                   </div>

                   {/* Watermark */}
                   <span className="absolute -bottom-4 -right-2 text-6xl font-black text-black/[0.03] select-none pointer-events-none group-hover:text-black/[0.05] transition-colors uppercase">
                      {exam.abbr.split(' ')[0]}
                   </span>
                </Link>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
}
