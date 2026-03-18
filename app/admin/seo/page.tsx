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
    console.error("[admin/seo safeQuery]", err);
    return [];
  }
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return "—"; }
}

function truncate(str: string | null | undefined, len: number): string {
  if (!str) return "—";
  const s = str.trim();
  return s.length > len ? s.slice(0, len) + "…" : s;
}

function getEntityType(row: SeoRow): { label: string; cls: string } {
  if (row.collegeId) return { label: "College", cls: "bg-blue-100 text-blue-700" };
  if (row.blogId)    return { label: "Blog",    cls: "bg-violet-100 text-violet-700" };
  if (row.newsId)    return { label: "News",    cls: "bg-amber-100 text-amber-700" };
  if (row.examId)    return { label: "Exam",    cls: "bg-emerald-100 text-emerald-700" };
  if (row.boardId)   return { label: "Board",   cls: "bg-rose-100 text-rose-700" };
  if (row.pageId)    return { label: "Page",    cls: "bg-sky-100 text-sky-700" };
  return { label: "General", cls: "bg-slate-100 text-slate-600" };
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SeoRow extends RowDataPacket {
  id: number;
  slugurl: string | null;
  pagetitle: string | null;
  description: string | null;
  keyword: string | null;
  h1title: string | null;
  canonical: string | null;
  pageId: number | null;
  collegeId: number | null;
  examId: number | null;
  boardId: number | null;
  blogId: number | null;
  newsId: number | null;
  created_at: string;
  updated_at: string;
}

interface CountRow extends RowDataPacket { total: number; }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminSeoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const q      = (sp.q ?? "").trim();
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // ── WHERE ──────────────────────────────────────────────────────────────────
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(slugurl LIKE ? OR pagetitle LIKE ? OR keyword LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Parallel queries ───────────────────────────────────────────────────────
  const [rows, countRows, totalRow, withTitleRow, noTitleRow] = await Promise.all([
    safeQuery<SeoRow>(
      `SELECT id, slugurl, pagetitle, description, keyword, h1title, canonical,
              pageId, collegeId, examId, boardId, blogId, newsId,
              created_at, updated_at
       FROM seo_contents
       ${where}
       ORDER BY updated_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM seo_contents ${where}`,
      params,
    ),
    safeQuery<CountRow>("SELECT COUNT(*) AS total FROM seo_contents"),
    safeQuery<CountRow>("SELECT COUNT(*) AS total FROM seo_contents WHERE pagetitle IS NOT NULL AND pagetitle != ''"),
    safeQuery<CountRow>("SELECT COUNT(*) AS total FROM seo_contents WHERE pagetitle IS NULL OR pagetitle = ''"),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: "1", ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== "" && v !== "1")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/seo${qs ? `?${qs}` : ""}`;
  }

  const STAT_CARDS = [
    {
      label: "Total SEO Entries",
      count: totalRow[0]?.total ?? 0,
      icon: "travel_explore",
      cls: "bg-slate-50 text-slate-600",
    },
    {
      label: "Entries with Title",
      count: withTitleRow[0]?.total ?? 0,
      icon: "check_circle",
      cls: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Missing Title",
      count: noTitleRow[0]?.total ?? 0,
      icon: "warning",
      cls: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-slate-600 text-[22px]" style={ICO_FILL}>
              travel_explore
            </span>
            SEO Contents
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Read-only visibility into SEO metadata across all pages.
          </p>
        </div>
        <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl flex-shrink-0">
          {(totalRow[0]?.total ?? 0).toLocaleString()} total
        </span>
      </div>

      {/* ── Stat mini-cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4"
          >
            <div className={`p-2.5 rounded-xl flex-shrink-0 ${card.cls}`}>
              <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>
                {card.icon}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-slate-800 leading-tight">
                {card.count.toLocaleString()}
              </p>
              <p className="text-xs font-semibold text-slate-500 truncate">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <form method="GET" action="/admin/seo" className="flex-1 max-w-md">
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none"
              style={ICO}
            >
              search
            </span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search URL, title, or keyword…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-400 transition"
            />
          </div>
        </form>

        {q && (
          <Link
            href={buildUrl({ q: "", page: 1 })}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1"
          >
            <span className="material-symbols-rounded text-[15px]" style={ICO}>close</span>
            Clear
          </Link>
        )}

        {q && (
          <p className="text-xs text-slate-400 ml-auto">
            {total.toLocaleString()} result{total !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
          </p>
        )}
      </div>

      {/* ── Table card ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-20 text-center">
            <span
              className="material-symbols-rounded text-6xl text-slate-200 block mb-4"
              style={ICO_FILL}
            >
              travel_explore
            </span>
            <p className="text-sm font-semibold text-slate-500">
              {q ? `No SEO entries matching "${q}"` : "No SEO entries found."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3 text-left w-10">#</th>
                    <th className="px-4 py-3 text-left">Page URL</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Title</th>
                    <th className="px-4 py-3 text-left hidden lg:table-cell">Description</th>
                    <th className="px-4 py-3 text-left hidden xl:table-cell">Keywords</th>
                    <th className="px-4 py-3 text-center">Entity</th>
                    <th className="px-4 py-3 text-left hidden sm:table-cell">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rows.map((row, idx) => {
                    const entity = getEntityType(row);
                    const hasTitle = !!(row.pagetitle?.trim());
                    return (
                      <tr
                        key={row.id}
                        className="hover:bg-slate-50/60 transition-colors group"
                      >
                        {/* # */}
                        <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">
                          {offset + idx + 1}
                        </td>

                        {/* Page URL */}
                        <td className="px-4 py-3.5 max-w-[200px]">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                              <span
                                className="material-symbols-rounded text-slate-500 text-[14px]"
                                style={ICO_FILL}
                              >
                                link
                              </span>
                            </div>
                            <span className="text-xs font-mono text-slate-600 truncate block max-w-[160px]">
                              {row.slugurl ? `/${row.slugurl}` : <span className="text-slate-300 italic">no slug</span>}
                            </span>
                          </div>
                        </td>

                        {/* Title */}
                        <td className="px-4 py-3.5 hidden md:table-cell max-w-[200px]">
                          {hasTitle ? (
                            <span className="text-xs text-slate-700 font-medium block truncate max-w-[200px]">
                              {truncate(row.pagetitle, 55)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                              <span className="material-symbols-rounded text-[11px]" style={ICO_FILL}>
                                warning
                              </span>
                              Missing
                            </span>
                          )}
                        </td>

                        {/* Description */}
                        <td className="px-4 py-3.5 hidden lg:table-cell max-w-[220px]">
                          <span className="text-xs text-slate-500 block truncate max-w-[220px]">
                            {truncate(row.description, 80)}
                          </span>
                        </td>

                        {/* Keywords */}
                        <td className="px-4 py-3.5 hidden xl:table-cell max-w-[180px]">
                          <span className="text-xs text-slate-400 font-mono block truncate max-w-[180px]">
                            {truncate(row.keyword, 50)}
                          </span>
                        </td>

                        {/* Entity */}
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${entity.cls}`}
                          >
                            {entity.label}
                          </span>
                        </td>

                        {/* Updated */}
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {formatDate(row.updated_at || row.created_at)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <strong className="text-slate-700">
                    {offset + 1}–{Math.min(offset + PAGE_SIZE, total)}
                  </strong>{" "}
                  of <strong className="text-slate-700">{total}</strong> entries
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
                            ? "bg-slate-700 text-white shadow-sm"
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

      {/* ── Legacy note ───────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
        <span
          className="material-symbols-rounded text-amber-500 text-[20px] flex-shrink-0 mt-0.5"
          style={ICO_FILL}
        >
          info
        </span>
        <p className="text-sm text-amber-800">
          <strong>Read-only panel.</strong> Full SEO editing is available in the legacy admin.
          This panel provides read-only visibility into all{" "}
          <strong>{(totalRow[0]?.total ?? 0).toLocaleString()}</strong> SEO entries.
        </p>
      </div>
    </div>
  );
}
