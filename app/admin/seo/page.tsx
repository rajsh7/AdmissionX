import pool from "@/lib/db";
import Link from "next/link";
import SeoClient from "./SeoClient";
// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 75;
const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

async function safeQuery<T >(
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

interface SeoRow  {
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

interface CountRow  { total: number; }

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
    <div className="p-6 space-y-6 mx-auto max-w-[1400px]">

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
      <SeoClient
        rows={rows}
        total={total}
        page={page}
        totalPages={totalPages}
        offset={offset}
        pageSize={PAGE_SIZE}
        q={q}
      />

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




