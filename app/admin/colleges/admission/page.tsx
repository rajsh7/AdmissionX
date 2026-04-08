import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { fetchCollegeOptions } from "../_components/college-options";
import CollegeFilterBar from "../_components/CollegeFilterBar";
import AdmissionListClient from "./AdmissionListClient";

async function createAdmission(formData: FormData) {
  "use server";
  try { await pool.query(`INSERT INTO college_admission_procedures (collegeprofile_id, title, description, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())`, [formData.get("collegeprofile_id"), formData.get("title"), formData.get("description") || null]); }
  catch (e) { console.error("[admin/colleges/admission createAction]", e); }
  revalidatePath("/admin/colleges/admission");
}

async function updateAdmission(formData: FormData) {
  "use server";
  try { await pool.query(`UPDATE college_admission_procedures SET collegeprofile_id=?, title=?, description=?, updated_at=NOW() WHERE id=?`, [formData.get("collegeprofile_id"), formData.get("title"), formData.get("description") || null, formData.get("id")]); }
  catch (e) { console.error("[admin/colleges/admission updateAction]", e); }
  revalidatePath("/admin/colleges/admission");
}

async function deleteAdmissionRow(id: number) {
  "use server";
  try { await pool.query("DELETE FROM college_admission_procedures WHERE id = ?", [id]); }
  catch (e) { console.error("[admin/colleges/admission deleteAction]", e); }
  revalidatePath("/admin/colleges/admission");
}

const PAGE_SIZE = 25;
async function safeQuery<T>(sql: string, params: (string | number)[] = []): Promise<T[]> {
  try { const [rows] = (await pool.query(sql, params)) as [T[], unknown]; return rows; }
  catch (err) { console.error("[admin/colleges/admission safeQuery]", err); return []; }
}

interface AdmissionRow { id: number; collegeprofile_id: number; college_name: string; title: string; description: string; }
interface CountRow { total: number; }

export default async function CollegeAdmissionPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp        = await searchParams;
  const q         = (sp.q ?? "").trim();
  const collegeId = sp.collegeId ?? "";
  const page      = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset    = (page - 1) * PAGE_SIZE;

  const conditions: string[] = [];
  const params: (string | number)[] = [];
  if (q) { conditions.push("(u.firstname LIKE ? OR ap.title LIKE ? OR ap.description LIKE ?)"); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  if (collegeId) { conditions.push("ap.collegeprofile_id = ?"); params.push(collegeId); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [admissions, countRows, collegeOptions] = await Promise.all([
    safeQuery<AdmissionRow>(
      `SELECT ap.id, ap.collegeprofile_id, COALESCE(u.firstname,'Unnamed College') as college_name, ap.title, ap.description
       FROM college_admission_procedures ap JOIN collegeprofile cp ON cp.id=ap.collegeprofile_id JOIN users u ON u.id=cp.users_id ${where} ORDER BY ap.created_at DESC LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(`SELECT COUNT(*) AS total FROM college_admission_procedures ap JOIN collegeprofile cp ON cp.id=ap.collegeprofile_id JOIN users u ON u.id=cp.users_id ${where}`, params),
    fetchCollegeOptions(),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function pageUrl(p: number) {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q); if (collegeId) qs.set("collegeId", collegeId); qs.set("page", String(p));
    return `/admin/colleges/admission?${qs.toString()}`;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <CollegeFilterBar colleges={collegeOptions} selectedId={collegeId} total={total} label="Admission Procedures" icon="assignment_ind" description="Manage enrollment workflows and admission guidelines — filter by college to see classified data." />
      <AdmissionListClient admissions={admissions} colleges={collegeOptions as any} offset={offset} onAdd={createAdmission} onEdit={updateAdmission} onDelete={deleteAdmissionRow} />
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500">Showing <strong>{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total.toLocaleString()}</strong> procedures</p>
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
