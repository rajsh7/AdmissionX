"use client";

import Link from "next/link";

const fields = [
  {
    label: "Engineering",
    count: "850 Colleges",
    icon: "engineering",
    bg: "bg-blue-50 dark:bg-blue-900/30",
    color: "text-primary",
    hover: "group-hover:bg-primary group-hover:text-white",
    href: "/colleges?course=engineering",
  },
  {
    label: "Management",
    count: "620 Colleges",
    icon: "analytics",
    bg: "bg-orange-50 dark:bg-orange-900/30",
    color: "text-orange-500",
    hover: "group-hover:bg-orange-500 group-hover:text-white",
    href: "/colleges?course=management",
  },
  {
    label: "Medical",
    count: "340 Colleges",
    icon: "stethoscope",
    bg: "bg-teal-50 dark:bg-teal-900/30",
    color: "text-teal-500",
    hover: "group-hover:bg-teal-500 group-hover:text-white",
    href: "/colleges?course=medicine",
  },
  {
    label: "Law",
    count: "210 Colleges",
    icon: "gavel",
    bg: "bg-purple-50 dark:bg-purple-900/30",
    color: "text-purple-500",
    hover: "group-hover:bg-purple-500 group-hover:text-white",
    href: "/colleges?course=law",
  },
  {
    label: "Design",
    count: "180 Colleges",
    icon: "palette",
    bg: "bg-rose-50 dark:bg-rose-900/30",
    color: "text-rose-500",
    hover: "group-hover:bg-rose-500 group-hover:text-white",
    href: "/colleges?course=design",
  },
  {
    label: "Science",
    count: "450 Colleges",
    icon: "biotech",
    bg: "bg-indigo-50 dark:bg-indigo-900/30",
    color: "text-indigo-500",
    hover: "group-hover:bg-indigo-500 group-hover:text-white",
    href: "/colleges?course=science",
  },
];

export default function FieldsOfStudy() {
  return (
    <section className="w-full py-16 px-4">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Popular Fields of Study
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Browse colleges by your preferred career path.
          </p>
        </div>
        <Link
          href="/colleges"
          className="hidden text-sm font-semibold text-primary hover:text-primary-dark sm:block transition-colors"
        >
          View all categories →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {fields.map((field) => (
          <Link
            key={field.label}
            href={field.href}
            className="group flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-center hover:border-primary hover:shadow-lg dark:hover:border-primary transition-all"
          >
            <div
              className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${field.bg} ${field.color} ${field.hover} transition-colors`}
            >
              <span className="material-symbols-outlined">{field.icon}</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {field.label}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {field.count}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
