import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { fetchCollegeOptions } from "../_components/college-options";
import CollegeFilterBar from "../_components/CollegeFilterBar";
import CutOffListClient from "./CutOffListClient";

async function createCutOff(formData: FormData) {
  "use server";
  try { await pool.query(`INSERT INTO college_cut_offs (collegeprofile_id, course_id, degree_id, title, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`, [formData.get("collegeprofile_id"), formData.get("course_id") || null, formData.get("degree_id") || null, formData.get("title"), formData.get("description") || null]); }
  catch (e) { console.error("[admin/colleges/cut-offs createAction]", e); }
  revalidatePath("/admin/colleges/cut-offs");
}

async function updateCutOff(formData: FormData) {
  "use server";
  try { await pool.query(`UPDATE college_cut_offs SET collegeprofile_id=?, course_id=?, degree_id=?, title=?, description=?, updated_at=NOW() WHERE id=?`, [formData.get("collegeprofile_id"), formData.get("course_id") || null, formData.get("degree_id") || null, formData.get("title"), formData.get("description") || null, formData.get("id")]); }
  catch (e) { console.error("[admin/colleges/cut-offs updateAction]", e); }
  revalidatePath("/admin/colleges/cut-offs");
}

async function deleteCutOffRow(id: number) {
  "use server";
  try { await pool.query("DELETE FROM college_cut_offs WHERE id = ?", [id]); }
  catch (e) { console.error("[admin/colleges/cut-offs deleteAction]", e); }
  revalidatePath("/admin/colleges/cut-offs");
}

const PAGE_SIZE = 25;
async function safeQuery<T>(sql: string, params: (string | number)[] = []): Promise<T[]> {
  try { const [rows] = (await pool.query(sql, params)) as [T[], unknown]; return rows; }
  catch (err) { console.error("[admin/colleges/cut-offs safeQuery]", err); return []; }
}

interface CutOffRow { id: number; collegeprofile_id: number; course_id: number | null; degree_id: number | null; college_name: string; course_name: string | null; degree_name: string | null; title: string; description: string; }
interface CountRow { total: number; }
interface OptionRow { id: number; name: string; }

export default async function CollegeCutOffsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp        = await searchParams;
  const q         = (sp.q ?? "").trim();
  const collegeId = sp.collegeId ?? "";
  const page      = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset    = (page - 1) * PAGE_SIZE;

  const conditions: string[] = [];
  const params: (string | number)[] = [];
  if (q) { conditions.push("(u.firstname LIKE ? OR c.name LIKE ? OR co.title LIKE ?)"); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  if (collegeId) { conditions.push("co.collegeprofile_id = ?"); params.push(collegeId); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [cutOffs, countRows, collegeOptions, courses, degrees] = await Promise.all([
    safeQuery<CutOffRow>(
      `SELECT co.id, co.collegeprofile_id, co.course_id, co.degree_id, COALESCE(u.firstname,'Unnamed College') as college_name, c.name as course_name, d.name as degree_name, co.title, co.description
       FROM college_cut_offs co JOIN collegeprofile cp ON cp.id=co.collegeprofile_id JOIN users u ON u.id=cp.users_id LEFT JOIN course c ON c.id=co.course_id LEFT JOIN degree d ON d.id=co.degree_id ${where} ORDER BY co.created_at DESC LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(`SELECT COUNT(*) AS total FROM college_cut_offs co JOIN collegeprofile cp ON cp.id=co.collegeprofile_id JOIN users u ON u.id=cp.users_id LEFT JOIN course c ON c.id=co.course_id LEFT JOIN degree d ON d.id=co.degree_id ${where}`, params),
    fetchCollegeOptions(),
    safeQuery<OptionRow>("SELECT id, name FROM course ORDER BY name ASC"),
    safeQuery<OptionRow>("SELECT id, name FROM degree ORDER BY name ASC"),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function pageUrl(p: number) {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q); if (collegeId) qs.set("collegeId", collegeId); qs.set("page", String(p));
    return `/admin/colleges/cut-offs?${qs.toString()}`;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <CollegeFilterBar colleges={collegeOptions} selectedId={collegeId} total={total} label="College Cut Offs" icon="data_exploration" description="Manage qualifying marks and admission trends — filter by college to see classified data." />
      <CutOffListClient cutoffs={cutOffs} colleges={collegeOptions as any} courses={courses} degrees={degrees} offset={offset} onAdd={createCutOff} onEdit={updateCutOff} onDelete={deleteCutOffRow} />
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500">Showing <strong>{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total.toLocaleString()}</strong> records</p>
          <div className="flex items-center gap-1">
            {page > 1 ? <Link href={pageUrl(page - 1)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">← Prev</Link> : <span className="px-3 py-1.5 text-xs text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">← Prev</span>}
            <span className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-blue-50 border border-blue-100 rounded-lg">{page} / {totalPages}</span>
            {page < totalPages ? <Link href={pageUrl(page + 1)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Next →</Link> : <span className="px-3 py-1.5 text-xs text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">Next →</span>}
          </div>
        </div>
      )}
    </div>
  );
}
