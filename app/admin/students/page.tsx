import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/students safeQuery]", err);
    return [];
  }
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatDateTime(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function timeAgo(d: string | null | undefined): string {
  if (!d) return "";
  try {
    const diff = Date.now() - new Date(d).getTime();
    const days = Math.floor(diff / 86_400_000);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    if (months >= 1) return `${months}mo ago`;
    if (weeks >= 1) return `${weeks}w ago`;
    if (days >= 1) return `${days}d ago`;
    const hours = Math.floor(diff / 3_600_000);
    if (hours >= 1) return `${hours}h ago`;
    return "Just now";
  } catch {
    return "";
  }
}

function obfuscatePhone(phone: string | null | undefined): string {
  if (!phone || phone.length < 4) return phone ?? "—";
  return phone.slice(0, -4).replace(/./g, "•") + phone.slice(-4);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudentRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

interface StatsRow extends RowDataPacket {
  total: number;
  today: number;
  this_week: number;
  this_month: number;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const q      = (sp.q ?? "").trim();
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const sort   = (sp.sort ?? "newest") as "newest" | "oldest" | "name";
  const offset = (page - 1) * PAGE_SIZE;

  // ── Build WHERE ────────────────────────────────────────────────────────────
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(name LIKE ? OR email LIKE ? OR phone LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const orderMap: Record<string, string> = {
    newest: "created_at DESC",
    oldest: "created_at ASC",
    name:   "name ASC",
  };
  const orderBy = orderMap[sort] ?? "created_at DESC";

  // ── Parallel queries ───────────────────────────────────────────────────────
  const [students, countRows, statsRows] = await Promise.all([
    safeQuery<StudentRow>(
      `SELECT id, name, email, phone, created_at, updated_at
       FROM next_student_signups
       ${where}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM next_student_signups ${where}`,
      params,
    ),
    safeQuery<StatsRow>(`
      SELECT
        COUNT(*) AS total,
        SUM(DATE(created_at) = CURDATE())                         AS today,
        SUM(created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY))        AS this_week,
        SUM(created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY))       AS this_month
      FROM next_student_signups
    `),
  ]);

  const total      = countRows[0]?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const stats      = statsRows[0];

  // ── URL builder ────────────────────────────────────────────────────────────
  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: "1", sort, ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => String(v) !== "" && String(v) !== "1" && String(v) !== "newest")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/students${qs ? `?${qs}` : ""}`;
  }

  // ── Avatar color based on id ───────────────────────────────────────────────
  const AVATAR_COLORS = [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];

  function getAvatarColor(id: number): string {
    return AVATAR_COLORS[id % AVATAR_COLORS.length];
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span
              className="material-symbols-rounded text-emerald-600 text-[22px]"
              style={ICO_FILL}
            >
              school
            </span>
            Student Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            All registered student accounts on the platform.
          </p>
        </div>

        {/* Export placeholder */}
        <button
          disabled
          title="Export coming soon"
          className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-slate-400 cursor-not-allowed px-4 py-2 rounded-xl border border-dashed border-slate-200"
        >
          <span className="material-symbols-rounded text-[16px]" style={ICO}>
            download
          </span>
          Export CSV
        </button>
      </div>

      {/* ── Stat mini-cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Students",
            value: (stats?.total ?? 0).toLocaleString(),
            icon: "group",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Joined Today",
            value: (stats?.today ?? 0).toLocaleString(),
            icon: "today",
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Last 7 Days",
            value: (stats?.this_week ?? 0).toLocaleString(),
            icon: "date_range",
            color: "text-violet-600",
            bg: "bg-violet-50",
          },
          {
            label: "Last 30 Days",
            value: (stats?.this_month ?? 0).toLocaleString(),
            icon: "calendar_month",
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4"
          >
            <div className={`${s.bg} ${s.color} p-2.5 rounded-xl flex-shrink-0`}>
              <span
                className="material-symbols-rounded text-[20px]"
                style={ICO_FILL}
              >
                {s.icon}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-slate-800 leading-tight">
                {s.value}
              </p>
              <p className="text-xs font-semibold text-slate-500 truncate">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search + sort bar ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search form */}
        <form method="GET" action="/admin/students" className="flex-1 flex gap-2">
          {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
          <div className="relative flex-1">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px] pointer-events-none"
              style={ICO}
            >
              search
            </span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by name, email, or phone…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all bg-slate-50"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors flex-shrink-0"
          >
            Search
          </button>
          {q && (
            <Link
              href={buildUrl({ q: "" })}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-xl transition-colors flex-shrink-0"
            >
              Clear
            </Link>
          )}
        </form>

        {/* Sort selector */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-semibold text-slate-400 hidden sm:block">
            Sort:
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(
              [
                { value: "newest", label: "Newest" },
                { value: "oldest", label: "Oldest" },
                { value: "name",   label: "A–Z"    },
              ] as const
            ).map((opt) => (
              <Link
                key={opt.value}
                href={buildUrl({ sort: opt.value, page: 1 })}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  sort === opt.value
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {students.length === 0 ? (
          <div className="py-20 text-center">
            <span
              className="material-symbols-rounded text-6xl text-slate-200 mb-4 block"
              style={ICO_FILL}
            >
              school
            </span>
            <p className="text-slate-500 font-semibold text-sm">
              {q
                ? `No students found matching "${q}"`
                : "No student accounts yet."}
            </p>
            {q && (
              <Link
                href="/admin/students"
                className="mt-3 inline-block text-sm text-emerald-600 hover:underline"
              >
                Clear search
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10">
                      #
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                      Phone
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                      Joined
                    </th>
                    <th className="text-right px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-20">
                      ID
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {students.map((student, idx) => (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Row number */}
                      <td className="px-4 py-3.5 text-xs text-slate-400 font-mono">
                        {offset + idx + 1}
                      </td>

                      {/* Avatar + name (combined on mobile) */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full ${getAvatarColor(
                              student.id,
                            )} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                          >
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate leading-snug">
                              {student.name}
                            </p>
                            {/* Email shown here on mobile */}
                            <p className="text-xs text-slate-400 truncate leading-snug md:hidden">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email (hidden on mobile — shown in name cell) */}
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="text-sm text-slate-600 truncate block max-w-[220px]">
                          {student.email}
                        </span>
                      </td>

                      {/* Phone (obfuscated) */}
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="text-sm font-mono text-slate-500">
                          {obfuscatePhone(student.phone)}
                        </span>
                      </td>

                      {/* Joined date */}
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <div>
                          <p className="text-xs font-semibold text-slate-600">
                            {formatDate(student.created_at)}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {timeAgo(student.created_at)}
                          </p>
                        </div>
                      </td>

                      {/* ID */}
                      <td className="px-4 py-3.5 text-right">
                        <span
                          className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg"
                          title={formatDateTime(student.created_at)}
                        >
                          #{student.id}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ──────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-500 order-2 sm:order-1">
                Showing{" "}
                <strong className="text-slate-700">
                  {offset + 1}–{Math.min(offset + PAGE_SIZE, total)}
                </strong>{" "}
                of <strong className="text-slate-700">{total.toLocaleString()}</strong>{" "}
                students
                {q && (
                  <span className="ml-1 text-slate-400">
                    matching &ldquo;{q}&rdquo;
                  </span>
                )}
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-1 order-1 sm:order-2">
                  {/* First + Prev */}
                  {page > 1 && (
                    <>
                      <Link
                        href={buildUrl({ page: 1 })}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        title="First page"
                      >
                        «
                      </Link>
                      <Link
                        href={buildUrl({ page: page - 1 })}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        ← Prev
                      </Link>
                    </>
                  )}

                  {/* Page window */}
                  {Array.from(
                    { length: Math.min(totalPages, 5) },
                    (_, i) => {
                      const start = Math.max(
                        1,
                        Math.min(page - 2, totalPages - 4),
                      );
                      const p = start + i;
                      if (p > totalPages) return null;
                      return (
                        <Link
                          key={p}
                          href={buildUrl({ page: p })}
                          className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                            p === page
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "text-slate-500 bg-white border border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {p}
                        </Link>
                      );
                    },
                  )}

                  {/* Next + Last */}
                  {page < totalPages && (
                    <>
                      <Link
                        href={buildUrl({ page: page + 1 })}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Next →
                      </Link>
                      <Link
                        href={buildUrl({ page: totalPages })}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        title="Last page"
                      >
                        »
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Footer info ───────────────────────────────────────────────────── */}
      <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
        <span className="material-symbols-rounded text-[13px]" style={ICO}>
          shield
        </span>
        Phone numbers are partially obfuscated for display. Full data available in DB.
      </p>
    </div>
  );
}
