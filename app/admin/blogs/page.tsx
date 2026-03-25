import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";
import { revalidatePath } from "next/cache";
import DeleteButton from "../_components/DeleteButton";
import BlogClient from "./BlogClient";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function toggleBlogAction(formData: FormData) {
  "use server";
  const id      = parseInt(formData.get("id")      as string, 10);
  const current = parseInt(formData.get("current") as string, 10);
  if (isNaN(id)) return;
  try {
    await pool.query("UPDATE blogs SET isactive = ? WHERE id = ?", [
      current ? 0 : 1,
      id,
    ]);
  } catch (e) {
    console.error("[admin/blogs toggleBlog]", e);
  }
  revalidatePath("/admin/blogs");
}

async function deleteBlogById(id: number): Promise<void> {
  "use server";
  try {
    await pool.query("DELETE FROM blogs WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/blogs deleteBlog]", e);
  }
  revalidatePath("/admin/blogs");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/blogs safeQuery]", err);
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
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogRow extends RowDataPacket {
  id: number;
  topic: string;
  slug: string | null;
  isactive: number;
  description: string | null;
  featimage: string | null;
  created_at: string;
  updated_at: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

interface StatsRow extends RowDataPacket {
  total: number;
  active: number;
  inactive: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;
const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminBlogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp   = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const q    = (sp.q ?? "").trim();
  const filter = sp.filter ?? "all"; // all | active | inactive
  const offset = (page - 1) * PAGE_SIZE;

  // ── Build query conditions ─────────────────────────────────────────────────
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(topic LIKE ? OR slug LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }
  if (filter === "active")   { conditions.push("isactive = 1"); }
  if (filter === "inactive") { conditions.push("isactive = 0"); }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Fetch data + stats in parallel ────────────────────────────────────────
  const [blogs, countRows, statsRows] = await Promise.all([
    safeQuery<BlogRow>(
      `SELECT id, topic, slug, isactive, description, featimage, created_at, updated_at
       FROM blogs ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM blogs ${where}`,
      params,
    ),
    safeQuery<StatsRow>(
      `SELECT
         COUNT(*) AS total,
         SUM(isactive = 1) AS active,
         SUM(isactive = 0) AS inactive
       FROM blogs`,
    ),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const stats      = statsRows[0];

  // ── URL builder ───────────────────────────────────────────────────────────
  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { page: "1", q, filter, ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== "" && v !== "all" && v !== "1")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/blogs${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-violet-600 text-[22px]" style={ICO_FILL}>
              article
            </span>
            Blog Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage all blog posts — toggle visibility, review content, delete drafts.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            {total.toLocaleString()} result{total !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Blogs",
            value: stats?.total ?? 0,
            icon: "article",
            color: "text-slate-600",
            bg: "bg-slate-100",
          },
          {
            label: "Active (Live)",
            value: stats?.active ?? 0,
            icon: "visibility",
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "Inactive (Draft)",
            value: stats?.inactive ?? 0,
            icon: "visibility_off",
            color: "text-slate-400",
            bg: "bg-slate-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4"
          >
            <div className={`${s.bg} ${s.color} p-2.5 rounded-xl flex-shrink-0`}>
              <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>
                {s.icon}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{s.value.toLocaleString()}</p>
              <p className="text-xs font-semibold text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search + filter bar ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <form method="GET" action="/admin/blogs" className="flex-1 flex gap-2">
          {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
          <div className="relative flex-1">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px]"
              style={ICO}
            >
              search
            </span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by title or slug…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors flex-shrink-0"
          >
            Search
          </button>
          {q && (
            <Link
              href={buildUrl({ q: "", page: "1" })}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-xl transition-colors flex-shrink-0"
            >
              Clear
            </Link>
          )}
        </form>

        {/* Filter pills */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {(["all", "active", "inactive"] as const).map((f) => (
            <Link
              key={f}
              href={buildUrl({ filter: f, page: "1" })}
              className={`text-xs font-semibold px-3 py-2 rounded-xl capitalize transition-colors ${
                filter === f
                  ? "bg-violet-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f}
            </Link>
          ))}
        </div>
      </div>

      <BlogClient 
        blogs={blogs}
        onDelete={deleteBlogById}
        onToggle={toggleBlogAction}
        offset={offset}
      />

      {/* ── Pagination ──────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-500">
            Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of{" "}
            {total.toLocaleString()} blogs
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
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    p === page
                      ? "bg-violet-600 text-white"
                      : "text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
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
    </div>
  );
}
