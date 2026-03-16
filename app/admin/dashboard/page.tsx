import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function safeCount(sql: string, params: (string | number)[] = []): Promise<number> {
  try {
    const [rows] = (await pool.query(sql, params)) as [{ cnt: number }[], unknown];
    return Number(rows[0]?.cnt ?? 0);
  } catch {
    return 0;
  }
}

async function safeQuery<T extends RowDataPacket>(
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

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    const date = new Date(d);
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch { return "—"; }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CollegeRow extends RowDataPacket {
  id: number;
  college_name: string;
  email: string;
  status: string;
  created_at: string;
}

interface StudentRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface BlogRow extends RowDataPacket {
  id: number;
  topic: string;
  slug: string;
  isactive: number;
  created_at: string;
}

interface AppRow extends RowDataPacket {
  id: number;
  applicationID: string | null;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
  applicationstatus_id: number | null;
  created_at: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function AdminDashboardPage() {
  // ── Parallel stat counts ───────────────────────────────────────────────────
  const [
    collegeCount,
    pendingColleges,
    studentCount,
    applicationCount,
    activeBlogCount,
    activeNewsCount,
    examCount,
    adCount,
  ] = await Promise.all([
    safeCount("SELECT COUNT(*) AS cnt FROM next_college_signups"),
    safeCount("SELECT COUNT(*) AS cnt FROM next_college_signups WHERE status = 'pending'"),
    safeCount("SELECT COUNT(*) AS cnt FROM next_student_signups"),
    safeCount("SELECT COUNT(*) AS cnt FROM application"),
    safeCount("SELECT COUNT(*) AS cnt FROM blogs WHERE isactive = 1"),
    safeCount("SELECT COUNT(*) AS cnt FROM news WHERE isactive = 1"),
    safeCount("SELECT COUNT(*) AS cnt FROM examination_details WHERE status = 1"),
    safeCount("SELECT COUNT(*) AS cnt FROM ads_managements WHERE isactive = 1"),
  ]);

  // ── Recent data ────────────────────────────────────────────────────────────
  const [recentColleges, recentStudents, recentBlogs, recentApps] =
    await Promise.all([
      safeQuery<CollegeRow>(
        "SELECT id, college_name, email, status, created_at FROM next_college_signups ORDER BY created_at DESC LIMIT 5",
      ),
      safeQuery<StudentRow>(
        "SELECT id, name, email, created_at FROM next_student_signups ORDER BY created_at DESC LIMIT 5",
      ),
      safeQuery<BlogRow>(
        "SELECT id, topic, slug, isactive, created_at FROM blogs ORDER BY created_at DESC LIMIT 5",
      ),
      safeQuery<AppRow>(
        "SELECT id, applicationID, firstname, lastname, email, applicationstatus_id, created_at FROM application ORDER BY created_at DESC LIMIT 5",
      ),
    ]);

  // ── Stat card config ───────────────────────────────────────────────────────
  const STATS = [
    {
      label: "Colleges",
      value: collegeCount,
      sub: `${pendingColleges} pending approval`,
      icon: "apartment",
      href: "/admin/colleges",
      color: "text-blue-600",
      bg: "bg-blue-50",
      ring: "ring-blue-100",
      badge: pendingColleges > 0 ? pendingColleges : null,
      badgeColor: "bg-red-500",
    },
    {
      label: "Students",
      value: studentCount,
      sub: "Registered accounts",
      icon: "school",
      href: "/admin/students",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      ring: "ring-emerald-100",
      badge: null,
      badgeColor: "",
    },
    {
      label: "Applications",
      value: applicationCount,
      sub: "All-time submissions",
      icon: "description",
      href: "/admin/applications",
      color: "text-red-600",
      bg: "bg-red-50",
      ring: "ring-red-100",
      badge: null,
      badgeColor: "",
    },
    {
      label: "Blogs",
      value: activeBlogCount,
      sub: "Active blog posts",
      icon: "article",
      href: "/admin/blogs",
      color: "text-violet-600",
      bg: "bg-violet-50",
      ring: "ring-violet-100",
      badge: null,
      badgeColor: "",
    },
    {
      label: "News Articles",
      value: activeNewsCount,
      sub: "Active news items",
      icon: "newspaper",
      href: "/admin/news",
      color: "text-cyan-600",
      bg: "bg-cyan-50",
      ring: "ring-cyan-100",
      badge: null,
      badgeColor: "",
    },
    {
      label: "Exams",
      value: examCount,
      sub: "Live exam pages",
      icon: "quiz",
      href: "/admin/exams",
      color: "text-amber-600",
      bg: "bg-amber-50",
      ring: "ring-amber-100",
      badge: null,
      badgeColor: "",
    },
  ];

  // ── Quick links ────────────────────────────────────────────────────────────
  const QUICK = [
    { href: "/admin/colleges",     icon: "apartment",         label: "Colleges",     color: "text-blue-600",   bg: "bg-blue-50"   },
    { href: "/admin/colleges/contact", icon: "contact_phone",   label: "Contact Card", color: "text-amber-600",  bg: "bg-amber-50"  },
    { href: "/admin/students",     icon: "school",            label: "Students",     color: "text-emerald-600",bg: "bg-emerald-50"},
    { href: "/admin/applications", icon: "description",       label: "Applications", color: "text-red-600",    bg: "bg-red-50"    },
    { href: "/admin/blogs",        icon: "article",           label: "Blogs",        color: "text-violet-600", bg: "bg-violet-50" },
    { href: "/admin/news",         icon: "newspaper",         label: "News",         color: "text-cyan-600",   bg: "bg-cyan-50"   },
    { href: "/admin/exams",        icon: "quiz",              label: "Exams",        color: "text-amber-600",  bg: "bg-amber-50"  },
    { href: "/admin/universities", icon: "account_balance",   label: "Universities", color: "text-indigo-600", bg: "bg-indigo-50" },
    { href: "/admin/degrees",      icon: "workspace_premium", label: "Degrees",      color: "text-pink-600",   bg: "bg-pink-50"   },
    { href: "/admin/courses",      icon: "menu_book",         label: "Courses",      color: "text-orange-600", bg: "bg-orange-50" },
    { href: "/admin/streams",      icon: "category",          label: "Streams",      color: "text-teal-600",   bg: "bg-teal-50"   },
    { href: "/admin/seo",          icon: "travel_explore",    label: "SEO",          color: "text-slate-600",  bg: "bg-slate-100" },
    { href: "/admin/ads",          icon: "campaign",          label: "Ads",          color: "text-rose-600",   bg: "bg-rose-50"   },
    { href: "/admin/reports",      icon: "bar_chart",         label: "Reports",      color: "text-green-600",  bg: "bg-green-50"  },
    { href: "/admin/users",        icon: "manage_accounts",   label: "Admin Users",  color: "text-slate-600",  bg: "bg-slate-100" },
  ];

  const STATUS_LABELS: Record<number, { label: string; cls: string }> = {
    1: { label: "Submitted",  cls: "bg-blue-100 text-blue-700"   },
    2: { label: "Reviewing",  cls: "bg-amber-100 text-amber-700" },
    3: { label: "Accepted",   cls: "bg-green-100 text-green-700" },
    4: { label: "Rejected",   cls: "bg-red-100 text-red-700"     },
    5: { label: "Waitlisted", cls: "bg-violet-100 text-violet-700"},
  };

  return (
    <div className="p-6 space-y-8 max-w-[1400px]" suppressHydrationWarning>

      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-7 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div>
          <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <span className="material-symbols-rounded text-[14px]" style={ICO_FILL}>admin_panel_settings</span>
            Admin Dashboard
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Platform Overview</h1>
          <p className="text-white/50 text-sm mt-1">
            Real-time stats &amp; recent activity across AdmissionX.
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0 flex-wrap">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl border border-white/15 transition-all"
          >
            <span className="material-symbols-rounded text-[16px]" style={ICO}>open_in_new</span>
            View Site
          </Link>
          <Link
            href="/admin/colleges"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-900/30 transition-all"
          >
            <span className="material-symbols-rounded text-[16px]" style={ICO_FILL}>domain_verification</span>
            Pending Colleges
            {pendingColleges > 0 && (
              <span className="bg-white text-red-600 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {pendingColleges}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* ── 6 stat cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {STATS.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group ring-2 ring-transparent hover:${s.ring}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${s.bg} ${s.color} p-2.5 rounded-xl`}>
                <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>
                  {s.icon}
                </span>
              </div>
              {s.badge !== null && (
                <span className={`${s.badgeColor} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full`}>
                  {s.badge}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-800 group-hover:text-slate-900">
              {s.value.toLocaleString()}
            </p>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">{s.label}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{s.sub}</p>
          </Link>
        ))}
      </div>

      {/* ── Recent activity (2 columns) ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent college signups */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-rounded text-blue-600 text-[18px]" style={ICO_FILL}>apartment</span>
              Recent College Signups
            </h2>
            <Link href="/admin/colleges" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              View all →
            </Link>
          </div>
          {recentColleges.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-400">No colleges yet.</div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {recentColleges.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-rounded text-blue-600 text-[16px]" style={ICO_FILL}>apartment</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{c.college_name}</p>
                    <p className="text-xs text-slate-400 truncate">{c.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      c.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : c.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {c.status}
                    </span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{formatDate(c.created_at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent student signups */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-rounded text-emerald-600 text-[18px]" style={ICO_FILL}>school</span>
              Recent Student Signups
            </h2>
            <Link href="/admin/students" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
              View all →
            </Link>
          </div>
          {recentStudents.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-400">No students yet.</div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {recentStudents.map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-emerald-700">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{s.name}</p>
                    <p className="text-xs text-slate-400 truncate">{s.email}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 flex-shrink-0 whitespace-nowrap">
                    {formatDate(s.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent blog posts */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-rounded text-violet-600 text-[18px]" style={ICO_FILL}>article</span>
              Recent Blog Posts
            </h2>
            <Link href="/admin/blogs" className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors">
              View all →
            </Link>
          </div>
          {recentBlogs.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-400">No blogs yet.</div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {recentBlogs.map((b) => (
                <li key={b.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-rounded text-violet-600 text-[16px]" style={ICO_FILL}>article</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{b.topic}</p>
                    <p className="text-xs text-slate-400 truncate">/blogs/{b.slug}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      b.isactive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {b.isactive ? "Live" : "Draft"}
                    </span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{formatDate(b.created_at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent applications */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-rounded text-red-600 text-[18px]" style={ICO_FILL}>description</span>
              Recent Applications
            </h2>
            <Link href="/admin/applications" className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors">
              View all →
            </Link>
          </div>
          {recentApps.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-400">No applications yet.</div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {recentApps.map((a) => {
                const statusInfo = STATUS_LABELS[a.applicationstatus_id ?? 0];
                const name = [a.firstname, a.lastname].filter(Boolean).join(" ") || a.email || "—";
                return (
                  <li key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-rounded text-red-500 text-[16px]" style={ICO}>description</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
                      <p className="text-xs text-slate-400 font-mono">
                        {a.applicationID ?? `#${a.id}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {statusInfo && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusInfo.cls}`}>
                          {statusInfo.label}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{formatDate(a.created_at)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ── Quick-link grid ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-slate-700 mb-5 flex items-center gap-2">
          <span className="material-symbols-rounded text-red-600 text-[18px]" style={ICO_FILL}>grid_view</span>
          Quick Navigation
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3">
          {QUICK.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all group text-center"
            >
              <div className={`${q.bg} ${q.color} p-2.5 rounded-xl group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>
                  {q.icon}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors leading-tight">
                {q.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Footer note ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-slate-400 pb-2">
        <span className="material-symbols-rounded text-[14px]" style={ICO}>info</span>
        Stats refresh on every page load. DB errors silently return 0.
        Active ads: <strong className="text-slate-500">{adCount}</strong>
      </div>

    </div>
  );
}
