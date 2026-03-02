"use client";

import Link from "next/link";

interface Degree {
  title: string;
  duration: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  badge: string;
  badgeBg: string;
  salary: string;
  barWidth: string;
  barColor: string;
  href: string;
}

const degrees: Degree[] = [
  {
    title: "B.Tech Computer Science",
    duration: "4 Years • Full Time",
    icon: "code",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    badge: "High Demand",
    badgeBg: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    salary: "$85,000 / yr",
    barWidth: "85%",
    barColor: "bg-primary",
    href: "/courses/btech-cs",
  },
  {
    title: "MBA Finance",
    duration: "2 Years • Post Grad",
    icon: "bar_chart",
    iconBg: "bg-orange-100 dark:bg-orange-900/40",
    iconColor: "text-orange-600 dark:text-orange-400",
    badge: "Popular",
    badgeBg: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    salary: "$92,000 / yr",
    barWidth: "90%",
    barColor: "bg-orange-500",
    href: "/courses/mba-finance",
  },
  {
    title: "MBBS Medicine",
    duration: "5.5 Years • Full Time",
    icon: "medical_services",
    iconBg: "bg-teal-100 dark:bg-teal-900/40",
    iconColor: "text-teal-600 dark:text-teal-400",
    badge: "Steady",
    badgeBg: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    salary: "$110,000 / yr",
    barWidth: "95%",
    barColor: "bg-teal-500",
    href: "/courses/mbbs",
  },
];

const recruiters = [
  "Google", "Amazon", "Microsoft",
];

export default function TrendingDegrees() {
  return (
    <section className="bg-slate-50 dark:bg-slate-800/50 py-16">
      <div className="w-full px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Trending Degrees
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Discover degrees with high placement records.
            </p>
          </div>
          <Link
            href="/courses"
            className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {degrees.map((deg) => (
            <Link
              key={deg.title}
              href={deg.href}
              className="block bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`h-12 w-12 rounded-lg ${deg.iconBg} ${deg.iconColor} flex items-center justify-center`}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {deg.icon}
                  </span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${deg.badgeBg}`}>
                  {deg.badge}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                {deg.title}
              </h3>
              <p className="text-sm text-slate-500 mb-4">{deg.duration}</p>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Avg. Salary</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {deg.salary}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`${deg.barColor} h-full rounded-full transition-all duration-1000`}
                    style={{ width: deg.barWidth }}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-400 uppercase font-semibold mb-2">
                  Top Recruiters
                </p>
                <div className="flex gap-2">
                  {recruiters.map((r) => (
                    <div
                      key={r}
                      className="h-6 px-3 flex items-center bg-slate-200 dark:bg-slate-700 rounded text-xs font-medium text-slate-600 dark:text-slate-300"
                    >
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
