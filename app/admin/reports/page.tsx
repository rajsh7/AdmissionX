import pool from "@/lib/db";
import Link from "next/link";
// ─── Helpers ──────────────────────────────────────────────────────────────────

async function safeCount(
  sql: string,
  params: (string | number)[] = [],
): Promise<number> {
  try {
    const [rows] = (await pool.query(sql, params)) as [
      { cnt: number }[],
      unknown,
    ];
    return Number(rows[0]?.cnt ?? 0);
  } catch {
    return 0;
  }
}

async function safeQuery<T >(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch {
    return [];
  }
}

const ICO_FILL = {
  fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20",
};
const ICO = {
  fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppStatusRow  {
  status_name: string | null;
  cnt: number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminReportsPage() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayStr = now.toISOString().slice(0, 10);
  const weekStr = startOfWeek.toISOString().slice(0, 10);
  const monthStr = startOfMonth.toISOString().slice(0, 10);

  // ── All counts in parallel ─────────────────────────────────────────────────
  const [
    totalColleges,
    pendingColleges,
    approvedColleges,
    rejectedColleges,
    totalStudents,
    studentsToday,
    studentsThisWeek,
    studentsThisMonth,
    totalApplications,
    totalBlogs,
    activeBlogs,
    totalNews,
    activeNews,
    totalExams,
    activeExams,
    totalAds,
    activeAds,
    totalSeo,
    totalAdmins,
    activeAdmins,
    appStatusRows,
  ] = await Promise.all([
    safeCount("SELECT COUNT(*) AS cnt FROM next_college_signups"),
    safeCount(
      "SELECT COUNT(*) AS cnt FROM next_college_signups WHERE status = 'pending'",
    ),
    safeCount(
      "SELECT COUNT(*) AS cnt FROM next_college_signups WHERE status = 'approved'",
    ),
    safeCount(
      "SELECT COUNT(*) AS cnt FROM next_college_signups WHERE status = 'rejected'",
    ),
    safeCount("SELECT COUNT(*) AS cnt FROM next_student_signups"),
    safeCount(
      "SELECT COUNT(*) AS cnt FROM next_student_signups WHERE DATE(created_at) = ?",
      [todayStr],
    ),
    safeCount(
      "SELECT COUNT(*) AS cnt FROM next_student_signups WHERE DATE(created_at) >= ?",
      [weekStr],
    ),
    safeCount(
      "SELECT COUNT(*) AS cnt FROM next_student_signups WHERE DATE(created_at) >= ?",
      [monthStr],
    ),
    safeCount("SELECT COUNT(*) AS cnt FROM application"),
    safeCount("SELECT COUNT(*) AS cnt FROM blogs"),
    safeCount("SELECT COUNT(*) AS cnt FROM blogs WHERE isactive = 1"),
    safeCount("SELECT COUNT(*) AS cnt FROM news"),
    safeCount("SELECT COUNT(*) AS cnt FROM news WHERE isactive = 1"),
    safeCount("SELECT COUNT(*) AS cnt FROM examination_details"),
    safeCount(
      "SELECT COUNT(*) AS cnt FROM examination_details WHERE status = 1",
    ),
    safeCount("SELECT COUNT(*) AS cnt FROM ads_managements"),
    safeCount("SELECT COUNT(*) AS cnt FROM ads_managements WHERE isactive = 1"),
    safeCount("SELECT COUNT(*) AS cnt FROM seo_contents"),
    safeCount("SELECT COUNT(*) AS cnt FROM next_admin_users"),
    safeCount(
      "SELECT COUNT(*) AS cnt FROM next_admin_users WHERE is_active = 1",
    ),
    safeQuery<AppStatusRow>(
      `SELECT COALESCE(s.name, 'Unknown') AS status_name, COUNT(*) AS cnt
       FROM application a
       LEFT JOIN applicationstatus s ON s.id = a.applicationstatus_id
       GROUP BY a.applicationstatus_id, s.name
       ORDER BY cnt DESC`,
    ),
  ]);

  const inactiveBlogs = totalBlogs - activeBlogs;
  const inactiveNews = totalNews - activeNews;
  const inactiveAdmins = totalAdmins - activeAdmins;
  const collegeTotal = totalColleges || 1; // avoid div/0

  const blogsActivePct =
    totalBlogs > 0 ? Math.round((activeBlogs / totalBlogs) * 100) : 0;
  const newsActivePct =
    totalNews > 0 ? Math.round((activeNews / totalNews) * 100) : 0;
  const approvedPct = Math.round((approvedColleges / collegeTotal) * 100);
  const pendingPct = Math.round((pendingColleges / collegeTotal) * 100);
  const rejectedPct = Math.round((rejectedColleges / collegeTotal) * 100);

  const OVERVIEW = [
    {
      label: "Colleges",
      value: totalColleges,
      icon: "school",
      href: "/admin/colleges",
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Students",
      value: totalStudents,
      icon: "person",
      href: "/admin/students",
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      label: "Applications",
      value: totalApplications,
      icon: "description",
      href: "/admin/applications",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Blogs",
      value: totalBlogs,
      icon: "article",
      href: "/admin/blogs",
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      label: "News",
      value: totalNews,
      icon: "newspaper",
      href: "/admin/news",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Exams",
      value: totalExams,
      icon: "quiz",
      href: "/admin/exams",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Ads",
      value: totalAds,
      icon: "campaign",
      href: "/admin/ads",
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      label: "SEO Entries",
      value: totalSeo,
      icon: "manage_search",
      href: "/admin/seo",
      color: "text-slate-600",
      bg: "bg-slate-100",
    },
    {
      label: "Admin Users",
      value: totalAdmins,
      icon: "admin_panel_settings",
      href: "/admin/users",
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
  ];

  // App status bar colours
  const STATUS_COLORS: Record<
    string,
    { bar: string; dot: string; badge: string }
  > = {
    submitted: {
      bar: "bg-blue-500",
      dot: "bg-blue-500",
      badge: "bg-blue-100 text-blue-700",
    },
    reviewing: {
      bar: "bg-amber-500",
      dot: "bg-amber-500",
      badge: "bg-amber-100 text-amber-700",
    },
    accepted: {
      bar: "bg-green-500",
      dot: "bg-green-500",
      badge: "bg-green-100 text-green-700",
    },
    rejected: {
      bar: "bg-red-500",
      dot: "bg-red-500",
      badge: "bg-red-100 text-red-700",
    },
    waitlisted: {
      bar: "bg-violet-500",
      dot: "bg-violet-500",
      badge: "bg-violet-100 text-violet-700",
    },
    default: {
      bar: "bg-slate-400",
      dot: "bg-slate-400",
      badge: "bg-slate-100 text-slate-600",
    },
  };

  function statusColor(name: string | null) {
    const key = (name ?? "").toLowerCase().trim();
    return STATUS_COLORS[key] ?? STATUS_COLORS.default;
  }

  const appTotal = appStatusRows.reduce((s, r) => s + Number(r.cnt), 0) || 1;

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span
              className="material-symbols-rounded text-green-600 text-[22px]"
              style={ICO_FILL}
            >
              bar_chart
            </span>
            Reports &amp; Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Live platform-wide statistics and health overview.
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl flex-shrink-0">
          Last refreshed:{" "}
          {now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* ── Platform Overview ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <span
            className="material-symbols-rounded text-green-600 text-[18px]"
            style={ICO_FILL}
          >
            dashboard
          </span>
          <h2 className="text-sm font-bold text-slate-700">
            Platform Overview
          </h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-9 divide-x divide-y lg:divide-y-0 divide-slate-100">
          {OVERVIEW.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center gap-2 p-5 hover:bg-slate-50/60 transition-colors group"
            >
              <div className={`${item.bg} ${item.color} p-2.5 rounded-xl`}>
                <span
                  className="material-symbols-rounded text-[20px]"
                  style={ICO_FILL}
                >
                  {item.icon}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-800 leading-tight">
                {item.value.toLocaleString()}
              </p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide text-center">
                {item.label}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Row: College Funnel + Application Status ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* College Funnel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-rounded text-violet-600 text-[18px]"
                style={ICO_FILL}
              >
                school
              </span>
              <h2 className="text-sm font-bold text-slate-700">
                College Signups Funnel
              </h2>
            </div>
            <Link
              href="/admin/colleges"
              className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1"
            >
              View all
              <span
                className="material-symbols-rounded text-[14px]"
                style={ICO}
              >
                arrow_forward
              </span>
            </Link>
          </div>
          <div className="p-5 space-y-5">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">
                Total Signups
              </span>
              <span className="text-lg font-bold text-slate-800">
                {totalColleges.toLocaleString()}
              </span>
            </div>

            {/* Approved */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-green-700">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  Approved
                </span>
                <span className="text-slate-600">
                  {approvedColleges.toLocaleString()}
                  <span className="ml-1.5 text-slate-400 font-normal">
                    ({approvedPct}%)
                  </span>
                </span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${approvedPct}%` }}
                />
              </div>
            </div>

            {/* Pending */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  Pending
                </span>
                <span className="text-slate-600">
                  {pendingColleges.toLocaleString()}
                  <span className="ml-1.5 text-slate-400 font-normal">
                    ({pendingPct}%)
                  </span>
                </span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${pendingPct}%` }}
                />
              </div>
            </div>

            {/* Rejected */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-red-700">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  Rejected
                </span>
                <span className="text-slate-600">
                  {rejectedColleges.toLocaleString()}
                  <span className="ml-1.5 text-slate-400 font-normal">
                    ({rejectedPct}%)
                  </span>
                </span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all"
                  style={{ width: `${rejectedPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Application Status Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-rounded text-amber-600 text-[18px]"
                style={ICO_FILL}
              >
                description
              </span>
              <h2 className="text-sm font-bold text-slate-700">
                Application Status Breakdown
              </h2>
            </div>
            <Link
              href="/admin/applications"
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              View all
              <span
                className="material-symbols-rounded text-[14px]"
                style={ICO}
              >
                arrow_forward
              </span>
            </Link>
          </div>
          <div className="p-5 space-y-4">
            {appStatusRows.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">
                No applications yet.
              </p>
            ) : (
              appStatusRows.map((row) => {
                const pct = Math.round((Number(row.cnt) / appTotal) * 100);
                const sc = statusColor(row.status_name);
                return (
                  <div
                    key={row.status_name ?? "unknown"}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${sc.badge}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}
                        />
                        {row.status_name ?? "Unknown"}
                      </span>
                      <span className="text-slate-600">
                        {Number(row.cnt).toLocaleString()}
                        <span className="ml-1.5 text-slate-400 font-normal">
                          ({pct}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${sc.bar}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>Total Applications</span>
              <span>
                {(appTotal === 1 && totalApplications === 0
                  ? 0
                  : totalApplications
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row: Content Health + Growth ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Health */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <span
              className="material-symbols-rounded text-green-600 text-[18px]"
              style={ICO_FILL}
            >
              health_metrics
            </span>
            <h2 className="text-sm font-bold text-slate-700">Content Health</h2>
          </div>
          <div className="p-5 space-y-5">
            {/* Blogs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-rounded text-pink-500 text-[16px]"
                    style={ICO_FILL}
                  >
                    article
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    Blogs
                  </span>
                </div>
                <Link
                  href="/admin/blogs"
                  className="text-xs font-semibold text-pink-600 hover:underline"
                >
                  {totalBlogs} total
                </Link>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-pink-500 rounded-l-full transition-all"
                  style={{ width: `${blogsActivePct}%` }}
                />
                <div
                  className="h-full bg-pink-200 transition-all"
                  style={{ width: `${100 - blogsActivePct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-pink-500 inline-block" />
                  Active:{" "}
                  <strong className="text-slate-700 ml-1">{activeBlogs}</strong>
                  <span className="ml-1 text-slate-400">
                    ({blogsActivePct}%)
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-pink-200 inline-block" />
                  Inactive:{" "}
                  <strong className="text-slate-700 ml-1">
                    {inactiveBlogs}
                  </strong>
                </span>
              </div>
            </div>

            {/* News */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-rounded text-orange-500 text-[16px]"
                    style={ICO_FILL}
                  >
                    newspaper
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    News
                  </span>
                </div>
                <Link
                  href="/admin/news"
                  className="text-xs font-semibold text-orange-600 hover:underline"
                >
                  {totalNews} total
                </Link>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-orange-500 rounded-l-full transition-all"
                  style={{ width: `${newsActivePct}%` }}
                />
                <div
                  className="h-full bg-orange-200 transition-all"
                  style={{ width: `${100 - newsActivePct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                  Active:{" "}
                  <strong className="text-slate-700 ml-1">{activeNews}</strong>
                  <span className="ml-1 text-slate-400">
                    ({newsActivePct}%)
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-200 inline-block" />
                  Inactive:{" "}
                  <strong className="text-slate-700 ml-1">
                    {inactiveNews}
                  </strong>
                </span>
              </div>
            </div>

            {/* Exams */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-rounded text-indigo-500 text-[16px]"
                    style={ICO_FILL}
                  >
                    quiz
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    Exams
                  </span>
                </div>
                <Link
                  href="/admin/exams"
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  {totalExams} total
                </Link>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                {(() => {
                  const pct =
                    totalExams > 0
                      ? Math.round((activeExams / totalExams) * 100)
                      : 0;
                  return (
                    <>
                      <div
                        className="h-full bg-indigo-500 rounded-l-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                      <div
                        className="h-full bg-indigo-200 transition-all"
                        style={{ width: `${100 - pct}%` }}
                      />
                    </>
                  );
                })()}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                  Active:{" "}
                  <strong className="text-slate-700 ml-1">{activeExams}</strong>
                  {totalExams > 0 && (
                    <span className="ml-1 text-slate-400">
                      ({Math.round((activeExams / totalExams) * 100)}%)
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-200 inline-block" />
                  Inactive:{" "}
                  <strong className="text-slate-700 ml-1">
                    {totalExams - activeExams}
                  </strong>
                </span>
              </div>
            </div>

            {/* Ads */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-rounded text-rose-500 text-[16px]"
                    style={ICO_FILL}
                  >
                    campaign
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    Ads
                  </span>
                </div>
                <Link
                  href="/admin/ads"
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  {totalAds} total
                </Link>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                {(() => {
                  const pct =
                    totalAds > 0 ? Math.round((activeAds / totalAds) * 100) : 0;
                  return (
                    <>
                      <div
                        className="h-full bg-rose-500 rounded-l-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                      <div
                        className="h-full bg-rose-200 transition-all"
                        style={{ width: `${100 - pct}%` }}
                      />
                    </>
                  );
                })()}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  Active:{" "}
                  <strong className="text-slate-700 ml-1">{activeAds}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-200 inline-block" />
                  Inactive:{" "}
                  <strong className="text-slate-700 ml-1">
                    {totalAds - activeAds}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Growth + Admin overview */}
        <div className="space-y-6">
          {/* Student Growth */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-rounded text-sky-600 text-[18px]"
                  style={ICO_FILL}
                >
                  trending_up
                </span>
                <h2 className="text-sm font-bold text-slate-700">
                  Student Growth
                </h2>
              </div>
              <Link
                href="/admin/students"
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                View all
                <span
                  className="material-symbols-rounded text-[14px]"
                  style={ICO}
                >
                  arrow_forward
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
              {[
                {
                  label: "All Time",
                  value: totalStudents,
                  icon: "group",
                  color: "text-sky-600",
                  bg: "bg-sky-50",
                },
                {
                  label: "This Month",
                  value: studentsThisMonth,
                  icon: "calendar_month",
                  color: "text-teal-600",
                  bg: "bg-teal-50",
                },
                {
                  label: "This Week",
                  value: studentsThisWeek,
                  icon: "date_range",
                  color: "text-green-600",
                  bg: "bg-green-50",
                },
                {
                  label: "Today",
                  value: studentsToday,
                  icon: "today",
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-4 flex flex-col items-center gap-1.5 text-center"
                >
                  <div className={`${item.bg} ${item.color} p-2 rounded-xl`}>
                    <span
                      className="material-symbols-rounded text-[18px]"
                      style={ICO_FILL}
                    >
                      {item.icon}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-slate-800">
                    {item.value.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Users */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-rounded text-slate-600 text-[18px]"
                  style={ICO_FILL}
                >
                  admin_panel_settings
                </span>
                <h2 className="text-sm font-bold text-slate-700">
                  Admin Users
                </h2>
              </div>
              <Link
                href="/admin/users"
                className="text-xs font-semibold text-slate-600 hover:text-slate-700 flex items-center gap-1"
              >
                View all
                <span
                  className="material-symbols-rounded text-[14px]"
                  style={ICO}
                >
                  arrow_forward
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-3 divide-x divide-slate-100">
              {[
                {
                  label: "Total Admins",
                  value: totalAdmins,
                  icon: "shield_person",
                  color: "text-slate-600",
                  bg: "bg-slate-100",
                },
                {
                  label: "Active",
                  value: activeAdmins,
                  icon: "check_circle",
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
                {
                  label: "Inactive",
                  value: inactiveAdmins,
                  icon: "cancel",
                  color: "text-red-500",
                  bg: "bg-red-50",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-4 flex flex-col items-center gap-1.5 text-center"
                >
                  <div className={`${item.bg} ${item.color} p-2 rounded-xl`}>
                    <span
                      className="material-symbols-rounded text-[18px]"
                      style={ICO_FILL}
                    >
                      {item.icon}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-slate-800">
                    {item.value.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* end Growth + Admin overview column */}
      </div>
      {/* end Row: Content Health + Growth */}

      {/* ── SEO quick-stat ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-rounded text-slate-600 text-[18px]"
              style={ICO_FILL}
            >
              travel_explore
            </span>
            <h2 className="text-sm font-bold text-slate-700">SEO Coverage</h2>
          </div>
          <Link
            href="/admin/seo"
            className="text-xs font-semibold text-slate-600 hover:text-slate-700 flex items-center gap-1"
          >
            View all
            <span className="material-symbols-rounded text-[14px]" style={ICO}>
              arrow_forward
            </span>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-slate-100">
          {[
            {
              label: "Total SEO Entries",
              value: totalSeo,
              icon: "travel_explore",
              color: "text-slate-600",
              bg: "bg-slate-100",
            },
            {
              label: "With Title",
              value: totalSeo - 0,
              icon: "check_circle",
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              label: "Active Exams",
              value: activeExams,
              icon: "quiz",
              color: "text-indigo-600",
              bg: "bg-indigo-50",
            },
          ].map((item) => (
            <div key={item.label} className="p-5 flex items-center gap-4">
              <div
                className={`${item.bg} ${item.color} p-2.5 rounded-xl flex-shrink-0`}
              >
                <span
                  className="material-symbols-rounded text-[20px]"
                  style={ICO_FILL}
                >
                  {item.icon}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {item.value.toLocaleString()}
                </p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}




