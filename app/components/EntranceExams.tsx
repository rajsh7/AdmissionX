"use client";

import Link from "next/link";

interface Exam {
  abbr: string;
  abbrBg: string;
  abbrColor: string;
  name: string;
  fullName: string;
  date: string;
  mode: string;
  modeBg: string;
  href: string;
}

const exams: Exam[] = [
  {
    abbr: "SAT",
    abbrBg: "bg-indigo-100 dark:bg-indigo-900/30",
    abbrColor: "text-indigo-700 dark:text-indigo-400",
    name: "SAT 2024",
    fullName: "Scholastic Assessment Test",
    date: "Oct 07, 2024",
    mode: "Online/Offline",
    modeBg:
      "bg-green-50 text-green-700 ring-green-600/20",
    href: "/exams/sat",
  },
  {
    abbr: "GRE",
    abbrBg: "bg-rose-100 dark:bg-rose-900/30",
    abbrColor: "text-rose-700 dark:text-rose-400",
    name: "GRE General",
    fullName: "Graduate Record Examinations",
    date: "Year Round",
    mode: "Computer Based",
    modeBg: "bg-blue-50 text-blue-700 ring-blue-600/20",
    href: "/exams/gre",
  },
  {
    abbr: "JEE",
    abbrBg: "bg-orange-100 dark:bg-orange-900/30",
    abbrColor: "text-orange-700 dark:text-orange-400",
    name: "JEE Main",
    fullName: "Joint Entrance Examination",
    date: "Jan 24, 2024",
    mode: "Computer Based",
    modeBg: "bg-blue-50 text-blue-700 ring-blue-600/20",
    href: "/exams/jee",
  },
  {
    abbr: "GMAT",
    abbrBg: "bg-purple-100 dark:bg-purple-900/30",
    abbrColor: "text-purple-700 dark:text-purple-400",
    name: "GMAT Focus",
    fullName: "Graduate Management Admission Test",
    date: "Year Round",
    mode: "Computer Based",
    modeBg: "bg-blue-50 text-blue-700 ring-blue-600/20",
    href: "/exams/gmat",
  },
];

export default function EntranceExams() {
  return (
    <section className="bg-white dark:bg-slate-900 py-16">
      <div className="w-full px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Upcoming Entrance Exams
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Prepare for the gateway to your dream college.
            </p>
          </div>
          <Link
            href="/exams"
            className="text-primary font-semibold text-sm hover:underline"
          >
            View All Exams →
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
              <tr>
                <th className="px-6 py-4" scope="col">
                  Exam Name
                </th>
                <th className="px-6 py-4" scope="col">
                  Date
                </th>
                <th className="px-6 py-4" scope="col">
                  Mode
                </th>
                <th className="px-6 py-4 text-right" scope="col">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
              {exams.map((exam) => (
                <tr
                  key={exam.abbr}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded ${exam.abbrBg} flex items-center justify-center ${exam.abbrColor} font-bold text-xs flex-shrink-0`}
                      >
                        {exam.abbr}
                      </div>
                      <div>
                        <div className="font-bold">{exam.name}</div>
                        <div className="text-xs text-slate-500 font-normal">
                          {exam.fullName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400 text-base">
                        calendar_month
                      </span>
                      {exam.date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${exam.modeBg}`}
                    >
                      {exam.mode}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={exam.href}
                      className="text-primary hover:text-primary-dark font-bold text-sm"
                    >
                      Apply Now
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
