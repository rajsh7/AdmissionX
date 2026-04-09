import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import ExamListClient from "./ExamListClient";

// --- Server Actions ------------------------------------------------------------

async function createExam(formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const status = parseInt(formData.get("status") as string, 10) || 0;
  const description = formData.get("description") as string;
  const featimage = formData.get("featimage") as string;
  const fullimage = formData.get("fullimage") as string;
  const brochure = formData.get("brochure") as string;
  const website = formData.get("website") as string;
  const appFrom = formData.get("applicationFrom") as string;
  const appTo = formData.get("applicationTo") as string;
  const appFees = formData.get("applicationFees") as string;
  const eligibility = formData.get("eligibility") as string;
  const syllabus = formData.get("syllabus") as string;
  const pattern = formData.get("pattern") as string;
  const prepare = formData.get("prepare") as string;
  const contact = formData.get("contact") as string;
  const typeId = formData.get("examination_types_id") as string;

  if (!title) return;

  try {
    await pool.query(
      `INSERT INTO examination_details 
       (title, slug, status, description, featimage, fullimage, brochure, website, 
        applicationFrom, applicationTo, applicationFees, eligibility, syllabus, pattern, 
        prepare, contact, examination_types_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [title, slug || null, status, description || null, featimage || null, fullimage || null,
       brochure || null, website || null, appFrom || null, appTo || null, appFees || null,
       eligibility || null, syllabus || null, pattern || null, prepare || null, contact || null, typeId || null]
    );
  } catch (e) {
    console.error("[admin/exams createAction]", e);
  }
  revalidatePath("/admin/exams");
  revalidatePath("/", "layout");
}

async function updateExam(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const status = parseInt(formData.get("status") as string, 10) || 0;
  const description = formData.get("description") as string;
  const featimage = formData.get("featimage") as string;
  const fullimage = formData.get("fullimage") as string;
  const brochure = formData.get("brochure") as string;
  const website = formData.get("website") as string;
  const appFrom = formData.get("applicationFrom") as string;
  const appTo = formData.get("applicationTo") as string;
  const appFees = formData.get("applicationFees") as string;
  const eligibility = formData.get("eligibility") as string;
  const syllabus = formData.get("syllabus") as string;
  const pattern = formData.get("pattern") as string;
  const prepare = formData.get("prepare") as string;
  const contact = formData.get("contact") as string;
  const typeId = formData.get("examination_types_id") as string;

  if (!id || !title) return;

  try {
    await pool.query(
      `UPDATE examination_details 
       SET title = ?, slug = ?, status = ?, description = ?, featimage = ?, fullimage = ?, 
           brochure = ?, website = ?, applicationFrom = ?, applicationTo = ?, applicationFees = ?, 
           eligibility = ?, syllabus = ?, pattern = ?, prepare = ?, contact = ?, 
           examination_types_id = ?, updated_at = NOW() 
       WHERE id = ?`,
      [title, slug || null, status, description || null, featimage || null, fullimage || null,
       brochure || null, website || null, appFrom || null, appTo || null, appFees || null,
       eligibility || null, syllabus || null, pattern || null, prepare || null, contact || null, 
       typeId || null, id]
    );
  } catch (e) {
    console.error("[admin/exams updateAction]", e);
  }
  revalidatePath("/admin/exams");
  revalidatePath("/", "layout");
}

async function deleteExam(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM examination_details WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/exams deleteAction]", e);
  }
  revalidatePath("/admin/exams");
  revalidatePath("/", "layout");
}

// --- Helpers ------------------------------------------------------------------

const PAGE_SIZE = 25;

async function safeQuery<T >(
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

// --- Types --------------------------------------------------------------------

interface ExamRow  {
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

interface ExamTypeRow  {
  id: number;
  name: string;
}

interface CountRow  {
  total: number;
}

interface StatsRow  {
  total: number;
  active: number;
  inactive: number;
}

// --- Page ---------------------------------------------------------------------

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function AdminExamsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp       = await searchParams;
  const q        = (sp.q ?? "").trim();
  const page     = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const filter   = sp.filter ?? "all";
  const offset   = (page - 1) * PAGE_SIZE;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(title LIKE ? OR slug LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }
  if (filter === "active")   { conditions.push("status = 1"); }
  if (filter === "inactive") { conditions.push("status = 0"); }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [exams, countRows, statsRows, allTypes] = await Promise.all([
    safeQuery<ExamRow>(
      `SELECT * FROM examination_details
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
    safeQuery<ExamTypeRow>("SELECT id, name FROM examination_types ORDER BY name ASC"),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const stats      = statsRows[0];

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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-amber-600 text-[22px]" style={ICO_FILL}>
              quiz
            </span>
            Examination Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage entrance exam pages — write, edit, and monitor analytics.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">
            {(stats?.total ?? 0).toLocaleString()} total
          </span>
          <a
            href="/examination"
            target="_blank"
            className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 px-3 py-1.5 rounded-xl border border-amber-200 hover:bg-amber-50 transition-colors"
          >
            <span className="material-symbols-rounded text-[16px]" style={ICO}>open_in_new</span>
            View Public
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Exams",    value: stats?.total ?? 0,    icon: "quiz",           color: "text-amber-600",  bg: "bg-amber-50"  },
          { label: "Active (Live)",  value: stats?.active ?? 0,   icon: "check_circle",   color: "text-green-600",  bg: "bg-green-50"  },
          { label: "Inactive",       value: stats?.inactive ?? 0, icon: "unpublished",    color: "text-slate-500",  bg: "bg-slate-100" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4 group hover:border-amber-200 transition-colors capitalize">
            <div className={`${s.bg} ${s.color} p-2.5 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
              <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xl font-black text-slate-800">{Number(s.value).toLocaleString()}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {(["all", "active", "inactive"] as const).map((f) => (
            <a
              key={f}
              href={buildUrl({ filter: f, page: 1 })}
              className={`text-xs font-bold px-4 py-1.5 rounded-lg capitalize transition-all ${
                filter === f
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f}
            </a>
          ))}
        </div>

        <form method="GET" action="/admin/exams" className="flex-1 max-w-sm flex gap-2">
          {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px]" style={ICO}>search</span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search exams..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium"
            />
          </div>
        </form>
      </div>

      <ExamListClient 
        data={exams}
        examTypes={allTypes}
        createAction={createExam}
        updateAction={updateExam}
        deleteAction={deleteExam}
        offset={offset}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-6 border-t border-slate-100 bg-white rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong className="text-slate-800">{total.toLocaleString()}</strong> exams
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





