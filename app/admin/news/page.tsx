import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import { formatDate } from "@/lib/utils";
import { saveUpload } from "@/lib/upload-utils";
import NewsListClientV2 from "./NewsListClient";
// Force re-render after UI update


// ─── Server Actions ────────────────────────────────────────────────────────────

async function createNews(formData: FormData) {
  "use server";
  const topic       = formData.get("topic") as string;
  const slug        = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const isactive    = parseInt(formData.get("isactive") as string, 10) || 0;
  const typeids     = formData.get("newstypeids") as string; 
  const tagids      = formData.get("newstagsids") as string; 
  const featimageFile = formData.get("featimage_file") as File;

  let featimage = null;
  if (featimageFile && featimageFile.size > 0) {
    featimage = await saveUpload(featimageFile, "news", "news");
  } 

  if (!topic) return;

  try {
    await pool.query(
      `INSERT INTO news 
       (topic, slug, description, featimage, isactive, newstypeids, newstagsids, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [topic, slug || null, description || null, featimage || null, isactive, typeids || null, tagids || null]
    );
  } catch (e) {
    console.error("[admin/news createAction]", e);
  }
  revalidatePath("/admin/news");
  revalidatePath("/", "layout");
}

async function updateNews(formData: FormData) {
  "use server";
  const id          = parseInt(formData.get("id") as string, 10);
  const topic       = formData.get("topic") as string;
  const slug        = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const isactive    = parseInt(formData.get("isactive") as string, 10) || 0;
  const typeids     = formData.get("newstypeids") as string;
  const tagids      = formData.get("newstagsids") as string;
  const featimageFile = formData.get("featimage_file") as File;
  let featimage = formData.get("featimage_existing") as string;

  if (featimageFile && featimageFile.size > 0) {
    featimage = await saveUpload(featimageFile, "news", "news");
  }

  if (isNaN(id) || !topic) return;

  try {
    await pool.query(
      `UPDATE news 
       SET topic = ?, slug = ?, description = ?, featimage = ?, isactive = ?, newstypeids = ?, newstagsids = ?, updated_at = NOW() 
       WHERE id = ?`,
      [topic, slug || null, description || null, featimage || null, isactive, typeids || null, tagids || null, id]
    );
  } catch (e) {
    console.error("[admin/news updateAction]", e);
  }
  revalidatePath("/admin/news");
  revalidatePath("/", "layout");
}

async function toggleNewsAction(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const cur = parseInt(formData.get("current") as string, 10);
  if (isNaN(id)) return;
  try {
    await pool.query("UPDATE news SET isactive = ? WHERE id = ?", [cur ? 0 : 1, id]);
  } catch (e) {
    console.error("[admin/news toggleAction]", e);
  }
  revalidatePath("/admin/news");
  revalidatePath("/", "layout");
}

async function deleteNewsItem(id: number): Promise<void> {
  "use server";
  try {
    await pool.query("DELETE FROM news WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/news deleteAction]", e);
  }
  revalidatePath("/admin/news");
  revalidatePath("/", "layout");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

async function safeQuery<T >(
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

// ─── Types ────────────────────────────────────────────────────────────────────

import { NewsRow } from "./NewsListClient";

interface NewsRowDb extends NewsRow {}

interface NewsTypeRow  {
  id: number;
  name: string;
  slug: string;
}

interface NewsTagRow  {
  id: number;
  name: string;
  slug: string;
}

interface CountRow  {
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
  const statusFilter = sp.status ?? "all";
  const offset     = (page - 1) * PAGE_SIZE;

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

  const [newsRows, countRows, allTypes, allTags, totalAll, totalActive, totalInactive] =
    await Promise.all([
      safeQuery<NewsRowDb>(
        `SELECT id, topic, slug, isactive, description, featimage, newstypeids, newstagsids, created_at, updated_at
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
      safeQuery<NewsTagRow>("SELECT id, name, slug FROM news_tags ORDER BY name ASC"),
      safeQuery<CountRow>("SELECT COUNT(*) AS total FROM news"),
      safeQuery<CountRow>("SELECT COUNT(*) AS total FROM news WHERE isactive = 1"),
      safeQuery<CountRow>("SELECT COUNT(*) AS total FROM news WHERE isactive = 0"),
    ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-cyan-600 text-[22px]" style={ICO_FILL}>
              newspaper
            </span>
            News Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage all news articles — write, edit, toggle visibility or remove items.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">
            {(totalAll[0]?.total ?? 0).toLocaleString()} total
          </span>
          <a
            href="/news"
            target="_blank"
            className="flex items-center gap-1.5 text-sm font-semibold text-cyan-600 hover:text-cyan-700 px-3 py-1.5 rounded-xl border border-cyan-200 hover:bg-cyan-50 transition-colors"
          >
            <span className="material-symbols-rounded text-[16px]" style={ICO}>open_in_new</span>
            View Public
          </a>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {STAT_TABS.map((tab) => (
            <a
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
            </a>
          ))}
        </div>

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
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 transition-all font-medium"
            />
          </div>
        </form>
      </div>

      <NewsListClientV2 
        data={newsRows}
        types={allTypes}
        tags={allTags}
        createAction={createNews}
        updateAction={updateNews}
        deleteAction={deleteNewsItem}
        toggleAction={toggleNewsAction}
        offset={offset}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-6 bg-white rounded-2xl border border-slate-100 shadow-sm mt-4">
          <p className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong className="text-slate-800">{total}</strong> articles
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <a href={buildUrl({ page: page - 1 })} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                <span className="material-symbols-rounded text-[18px]" style={ICO}>chevron_left</span>
              </a>
            )}
            {page < totalPages && (
              <a href={buildUrl({ page: page + 1 })} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                <span className="material-symbols-rounded text-[18px]" style={ICO}>chevron_right</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}





