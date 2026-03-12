import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { RowDataPacket } from "mysql2";
import DeleteButton from "@/app/admin/_components/DeleteButton";

// ─── Server Actions ────────────────────────────────────────────────────────────

async function toggleNewsAction(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const cur = parseInt(formData.get("current") as string, 10);
  if (!id) return;
  try {
    await pool.query("UPDATE news SET isactive = ? WHERE id = ?", [cur ? 0 : 1, id]);
  } catch (e) {
    console.error("[admin/news toggleAction]", e);
  }
  revalidatePath("/admin/news");
}

async function deleteNewsItem(id: number): Promise<void> {
  "use server";
  try {
    await pool.query("DELETE FROM news WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/news deleteAction]", e);
  }
  revalidatePath("/admin/news");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/news safeQuery]", err);
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

function parseIds(raw: string | null | undefined): number[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n > 0);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewsRow extends RowDataPacket {
  id: number;
  topic: string;
  slug: string | null;
  isactive: number;
  newstypeids: string | null;
  newstagsids: string | null;
  created_at: string;
  updated_at: string;
}

interface NewsTypeRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  const sp         = await searchParams;
  const q          = (sp.q ?? "").trim();
  const page       = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const statusFilter = sp.status ?? "all"; // all | active | inactive
  const offset     = (page - 1) * PAGE_SIZE;

  // ── Build WHERE ────────────────────────────────────────────────────────────
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(topic LIKE ? OR slug LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }
  if (statusFilter === "active") {
    conditions.push("isactive = 1");
  } else if (statusFilter === "inactive") {
    conditions.push("isactive = 0");
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Parallel queries ───────────────────────────────────────────────────────
  const [newsRows, countRows, allTypes, totalAll, totalActive, totalInactive] =
    await Promise.all([
      safeQuery<NewsRow>(
        `SELECT id, topic, slug, isactive, newstypeids, newstagsids, created_at, updated_at
         FROM news ${where}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, PAGE_SIZE, offset],
      ),
      safeQuery<CountRow>(
        `SELECT COUNT(*) AS total FROM news ${where}`,
        params,
      ),
      safeQuery<NewsTypeRow>("SELECT id, name, slug FROM news_types ORDER BY name ASC"),
      safeQuery<CountRow>("SELECT COUNT(*) AS total FROM news"),
      safeQuery<CountRow>("SELECT COUNT(*) AS total FROM news WHERE isactive = 1"),
      safeQuery<CountRow>("SELECT COUNT(*) AS total FROM news WHERE isactive = 0"),
    ]);

  const total      = countRows[0]?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const typeMap = new Map<number, string>(allTypes.map((t) => [t.id, t.name]));

  function resolveTypeNames(raw: string | null | undefined): string[] {
    return parseIds(raw)
      .map((id) => typeMap.get(id) ?? null)
      .filter(Boolean) as string[];
  }

  // ── URL builder ────────────────────────────────────────────────────────────
  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: String(page), status: statusFilter, ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== "" && v !== "1" && v !== "all")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/news${qs ? `?${qs}` : ""}`;
  }

  const STAT_TABS = [
    { label: "All",      value: "all",      count: totalAll[0]?.total ?? 0      },
    { label: "Active",   value: "active",   count: totalActive[0]?.total ?? 0   },
    { label: "Inactive", value: "inactive", count: totalInactive[0]?.total ?? 0 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-cyan-600 text-[22px]" style={ICO_FILL}>
              newspaper
            </span>
            News Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage all news articles — toggle visibility or remove items.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">
            {(totalAll[0]?.total ?? 0).toLocaleString()} total
          </span>
          <Link
            href="/news"
            target="_blank"
            className="flex items-center gap-1.5 text-sm font-semibold text-cyan-600 hover:text-cyan-700 px-3 py-1.5 rounded-xl border border-cyan-200 hover:bg-cyan-50 transition-colors"
          >
            <span className="material-symbols-rounded text-[16px]" style={ICO}>open_in_new</span>
            View Public
          </Link>
        </div>
      </div>

      {/* ── Status filter tabs + stat mini-cards ──────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Tab strip */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {STAT_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={buildUrl({ status: tab.value, page: 1 })}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                statusFilter === tab.value
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  statusFilter === tab.value
                    ? "bg-cyan-100 text-cyan-700"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </Link>
          ))}
        </div>

        {/* Search */}
        <form method="GET" action="/admin/news" className="flex-1 max-w-sm">
          {statusFilter !== "all" && (
            <input type="hidden" name="status" value={statusFilter} />
          )}
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none"
              style={ICO}
            >
              search
            </span>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search news title or slug…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 transition-all"
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
      </div>

      {/* ── Table card ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Table */}
        {newsRows.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-5xl text-slate-200 block mb-3" style={ICO_FILL}>
              newspaper
            </span>
            <p className="text-sm font-semibold text-slate-500">
              {q ? `No news found for "${q}"` : "No news articles yet."}
            </p>
            {q && (
              <Link href="/admin/news" className="mt-3 inline-block text-xs text-cyan-600 hover:underline">
                Clear search
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <th className="px-4 py-3 text-left w-8">#</th>
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Types</th>
                    <th className="px-4 py-3 text-left hidden lg:table-cell">Slug</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-left hidden sm:table-cell">Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {newsRows.map((item, idx) => {
                    const rowNum = offset + idx + 1;
                    const typeNames = resolveTypeNames(item.newstypeids);
                    const tagCount = parseIds(item.newstagsids).length;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* Row number */}
                        <td className="px-4 py-3.5 text-xs text-slate-400 font-mono">
                          {rowNum}
                        </td>

                        {/* Title */}
                        <td className="px-4 py-3.5 max-w-[280px]">
                          <p className="font-semibold text-slate-800 truncate leading-snug">
                            {item.topic}
                          </p>
                          {tagCount > 0 && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {tagCount} tag{tagCount !== 1 ? "s" : ""}
                            </p>
                          )}
                        </td>

                        {/* Types */}
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          {typeNames.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {typeNames.slice(0, 2).map((name) => (
                                <span
                                  key={name}
                                  className="text-[10px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-0.5 rounded-full whitespace-nowrap"
                                >
                                  {name}
                                </span>
                              ))}
                              {typeNames.length > 2 && (
                                <span className="text-[10px] text-slate-400">
                                  +{typeNames.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>

                        {/* Slug */}
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          {item.slug ? (
                            <Link
                              href={`/news/${item.slug}`}
                              target="_blank"
                              className="text-xs text-cyan-600 hover:text-cyan-700 hover:underline font-mono truncate block max-w-[160px]"
                            >
                              {item.slug}
                            </Link>
                          ) : (
                            <span className="text-xs text-slate-300">no-slug</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                              item.isactive
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <span
                              className="material-symbols-rounded text-[12px]"
                              style={ICO_FILL}
                            >
                              {item.isactive ? "check_circle" : "radio_button_unchecked"}
                            </span>
                            {item.isactive ? "Live" : "Draft"}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {formatDate(item.created_at)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">

                            {/* View */}
                            {item.slug && (
                              <Link
                                href={`/news/${item.slug}`}
                                target="_blank"
                                title="View on site"
                                className="text-xs text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 p-1.5 rounded-lg transition-colors"
                              >
                                <span className="material-symbols-rounded text-[16px]" style={ICO}>
                                  open_in_new
                                </span>
                              </Link>
                            )}

                            {/* Toggle active */}
                            <form action={toggleNewsAction}>
                              <input type="hidden" name="id" value={item.id} />
                              <input type="hidden" name="current" value={item.isactive} />
                              <button
                                type="submit"
                                title={item.isactive ? "Deactivate" : "Activate"}
                                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                                  item.isactive
                                    ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                                    : "border-green-200 text-green-600 hover:bg-green-50"
                                }`}
                              >
                                {item.isactive ? "Unpublish" : "Publish"}
                              </button>
                            </form>

                            {/* Delete */}
                            <DeleteButton
                              action={deleteNewsItem.bind(null, item.id)}
                              size="sm"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ──────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <strong className="text-slate-700">
                    {offset + 1}–{Math.min(offset + PAGE_SIZE, total)}
                  </strong>{" "}
                  of <strong className="text-slate-700">{total}</strong> articles
                </p>
                <div className="flex items-center gap-1">
                  {/* Prev */}
                  {page > 1 ? (
                    <Link
                      href={buildUrl({ page: page - 1 })}
                      className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      <span className="material-symbols-rounded text-[18px]" style={ICO}>
                        chevron_left
                      </span>
                    </Link>
                  ) : (
                    <span className="p-2 text-slate-300">
                      <span className="material-symbols-rounded text-[18px]" style={ICO}>
                        chevron_left
                      </span>
                    </span>
                  )}

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 3, totalPages - 6));
                    const p = start + i;
                    if (p > totalPages) return null;
                    return (
                      <Link
                        key={p}
                        href={buildUrl({ page: p })}
                        className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                          p === page
                            ? "bg-cyan-600 text-white shadow-sm"
                            : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}

                  {/* Next */}
                  {page < totalPages ? (
                    <Link
                      href={buildUrl({ page: page + 1 })}
                      className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      <span className="material-symbols-rounded text-[18px]" style={ICO}>
                        chevron_right
                      </span>
                    </Link>
                  ) : (
                    <span className="p-2 text-slate-300">
                      <span className="material-symbols-rounded text-[18px]" style={ICO}>
                        chevron_right
                      </span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Result summary ───────────────────────────────────────────────── */}
      {total > 0 && (
        <p className="text-xs text-slate-400">
          {q
            ? `${total} result${total !== 1 ? "s" : ""} for "${q}"`
            : `${total} news article${total !== 1 ? "s" : ""} ${statusFilter !== "all" ? `(${statusFilter})` : "total"}`}
        </p>
      )}
    </div>
  );
}
