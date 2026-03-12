import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;
const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/exams safeQuery]", err);
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

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExamRow extends RowDataPacket {
  id: number;
  title: string;
  slug: string | null;
  status: number;
  totalViews: number | null;
  totalLikes: number | null;
  totalApplicationClick: number | null;
  description: string | null;
  applicationFrom: string | null;
  applicationTo: string | null;
  created_at: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

interface StatsRow extends RowDataPacket {
  total: number;
  active: number;
  inactive: number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminExamsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp       = await searchParams;
  const q        = (sp.q ?? "").trim();
  const page     = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const filter   = sp.filter ?? "all"; // all | active | inactive
  const offset   = (page - 1) * PAGE_SIZE;

  // ── WHERE ─────────────────────────────────────────────────────────────────
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(title LIKE ? OR slug LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }
  if (filter === "active")   { conditions.push("status = 1"); }
  if (filter === "inactive") { conditions.push("status = 0"); }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Queries ───────────────────────────────────────────────────────────────
  const [exams, countRows, statsRows] = await Promise.all([
    safeQuery<ExamRow>(
      `SELECT id, title, slug, status, totalViews, totalLikes,
              totalApplicationClick, description, applicationFrom, applicationTo, created_at
       FROM examination_details
       ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM examination_details ${where}`,
      params,
    ),
    safeQuery<StatsRow>(`
      SELECT
        COUNT(*)                   AS total,
        SUM(status = 1)            AS active,
        SUM(status != 1 OR status IS NULL) AS inactive
      FROM examination_details
    `),
  ]);

  const total      = countRows[0]?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const stats      = statsRows[0];

  // ── URL builder ───────────────────────────────────────────────────────────
  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: "1", filter, ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => String(v) !== "" && String(v) !== "1" && String(v) !== "all")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/exams${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-amber-600 text-[22px]" style={ICO_FILL}>
              quiz
            </span>
            Examination Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            All entrance exam pages — view counts, application links, and status.
          </p>
        </div>
        <Link
          href="/examination"
          target="_blank"
          className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 px-3 py-2 rounded-xl border border-amber-200 hover:bg-amber-50 transition-colors flex-shrink-0"
        >
          <span className="material-symbols-rounded text-[16px]" style={ICO}>open_in_new</span>
          View Public Page
        </Link>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Exams",    value: stats?.total ?? 0,    icon: "quiz",           color: "text-amber-600",  bg: "bg-amber-50"  },
          { label: "Active (Live)",  value: stats?.active ?? 0,   icon: "check_circle",   color: "text-green-600",  bg: "bg-green-50"  },
          { label: "Inactive",       value: stats?.inactive ?? 0, icon: "unpublished",    color: "text-slate-500",  bg: "bg-slate-100" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`${s.bg} ${s.color} p-2.5 rounded-xl flex-shrink-0`}>
              <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>{s.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{Number(s.value).toLocaleString()}</p>
              <p className="text-xs font-semibold text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search + filter ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <form method="GET" action="/admin/exams" className="flex-1 flex gap-2">
          {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
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
              placeholder="Search by exam title or slug…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl transition-colors flex-shrink-0"
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

        {/* Status filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-shrink-0">
          {(["all", "active", "inactive"] as const).map((f) => (
            <Link
              key={f}
              href={buildUrl({ filter: f, page: 1 })}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-all ${
                filter === f
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {exams.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>
              quiz
            </span>
            <p className="text-sm font-semibold text-slate-500">
              {q ? `No exams matching "${q}"` : "No examination records found."}
            </p>
            {q && (
              <Link href="/admin/exams" className="mt-3 inline-block text-sm text-amber-600 hover:underline">
                Clear search
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3 text-left w-10">#</th>
                    <th className="px-4 py-3 text-left">Exam Title</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right hidden sm:table-cell">Views</th>
                    <th className="px-4 py-3 text-right hidden md:table-cell">Likes</th>
                    <th className="px-4 py-3 text-right hidden lg:table-cell">App Clicks</th>
                    <th className="px-4 py-3 text-left hidden xl:table-cell">Apply Window</th>
                    <th className="px-4 py-3 text-left hidden sm:table-cell">Created</th>
                    <th className="px-4 py-3 text-right">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {exams.map((exam, idx) => (
                    <tr key={exam.id} className="hover:bg-amber-50/20 transition-colors group">

                      {/* Row # */}
                      <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">
                        {offset + idx + 1}
                      </td>

                      {/* Title */}
                      <td className="px-4 py-3.5 max-w-[260px]">
                        <p className="font-semibold text-slate-800 truncate leading-snug">
                          {exam.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {stripHtml(exam.description) || "No description"}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            exam.status === 1
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <span
                            className="material-symbols-rounded text-[12px]"
                            style={ICO_FILL}
                          >
                            {exam.status === 1 ? "check_circle" : "radio_button_unchecked"}
                          </span>
                          {exam.status === 1 ? "Live" : "Inactive"}
                        </span>
                      </td>

                      {/* Views */}
                      <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                        <span className="text-sm font-semibold text-slate-700">
                          {(exam.totalViews ?? 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Likes */}
                      <td className="px-4 py-3.5 text-right hidden md:table-cell">
                        <span className="text-sm text-slate-500">
                          {(exam.totalLikes ?? 0).toLocaleString()}
                        </span>
                      </td>

                      {/* App Clicks */}
                      <td className="px-4 py-3.5 text-right hidden lg:table-cell">
                        <span className="text-sm text-slate-500">
                          {(exam.totalApplicationClick ?? 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Apply window */}
                      <td className="px-4 py-3.5 hidden xl:table-cell">
                        {exam.applicationFrom || exam.applicationTo ? (
                          <span className="text-xs text-slate-500 whitespace-nowrap">
                            {formatDate(exam.applicationFrom)} → {formatDate(exam.applicationTo)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {formatDate(exam.created_at)}
                        </span>
                      </td>

                      {/* Link */}
                      <td className="px-4 py-3.5 text-right">
                        {exam.slug ? (
                          <Link
                            href={`/examination/${exam.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-rounded text-[14px]" style={ICO}>
                              open_in_new
                            </span>
                            View
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-300">no slug</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ──────────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <strong className="text-slate-700">
                    {offset + 1}–{Math.min(offset + PAGE_SIZE, total)}
                  </strong>{" "}
                  of <strong className="text-slate-700">{total.toLocaleString()}</strong> exams
                </p>
                <div className="flex items-center gap-1">
                  {page > 1 && (
                    <Link
                      href={buildUrl({ page: page - 1 })}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      ← Prev
                    </Link>
                  )}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                    const p = start + i;
                    if (p > totalPages) return null;
                    return (
                      <Link
                        key={p}
                        href={buildUrl({ page: p })}
                        className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                          p === page
                            ? "bg-amber-600 text-white shadow-sm"
                            : "text-slate-500 bg-white border border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                  {page < totalPages && (
                    <Link
                      href={buildUrl({ page: page + 1 })}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Next →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Footer note ───────────────────────────────────────────────────── */}
      <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
        <span className="material-symbols-rounded text-[13px]" style={ICO}>info</span>
        Exam content is managed via the legacy admin. This panel provides read-only visibility and status overview.
      </p>
    </div>
  );
}
