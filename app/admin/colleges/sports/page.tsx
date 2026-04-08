import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { fetchCollegeOptions } from "../_components/college-options";
import CollegeFilterBar from "../_components/CollegeFilterBar";
import SportsListClient from "./SportsListClient";

async function createActivity(formData: FormData) {
  "use server";
  try { await pool.query(`INSERT INTO college_sports_activities (collegeprofile_id, name, typeOfActivity, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())`, [formData.get("collegeprofile_id"), formData.get("name"), formData.get("typeOfActivity")]); }
  catch (e) { console.error("[admin/colleges/sports createAction]", e); }
  revalidatePath("/admin/colleges/sports");
}

async function updateActivity(formData: FormData) {
  "use server";
  try { await pool.query(`UPDATE college_sports_activities SET collegeprofile_id=?, name=?, typeOfActivity=?, updated_at=NOW() WHERE id=?`, [formData.get("collegeprofile_id"), formData.get("name"), formData.get("typeOfActivity"), formData.get("id")]); }
  catch (e) { console.error("[admin/colleges/sports updateAction]", e); }
  revalidatePath("/admin/colleges/sports");
}

async function deleteActivityRow(id: number) {
  "use server";
  try { await pool.query("DELETE FROM college_sports_activities WHERE id = ?", [id]); }
  catch (e) { console.error("[admin/colleges/sports deleteAction]", e); }
  revalidatePath("/admin/colleges/sports");
}

const PAGE_SIZE = 25;
async function safeQuery<T>(sql: string, params: (string | number)[] = []): Promise<T[]> {
  try { const [rows] = (await pool.query(sql, params)) as [T[], unknown]; return rows; }
  catch (err) { console.error("[admin/colleges/sports safeQuery]", err); return []; }
}

interface SportsRow { id: number; collegeprofile_id: number; college_name: string; name: string; typeOfActivity: number; }
interface CountRow { total: number; }

export default async function CollegeSportsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp        = await searchParams;
  const q         = (sp.q ?? "").trim();
  const collegeId = sp.collegeId ?? "";
  const page      = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset    = (page - 1) * PAGE_SIZE;

  const conditions: string[] = [];
  const params: (string | number)[] = [];
  if (q) { conditions.push("(u.firstname LIKE ? OR s.name LIKE ?)"); params.push(`%${q}%`, `%${q}%`); }
  if (collegeId) { conditions.push("s.collegeprofile_id = ?"); params.push(collegeId); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [activities, countRows, collegeOptions] = await Promise.all([
    safeQuery<SportsRow>(
      `SELECT s.id, s.collegeprofile_id, COALESCE(u.firstname,'Unnamed College') as college_name, s.name, s.typeOfActivity
       FROM college_sports_activities s JOIN collegeprofile cp ON cp.id=s.collegeprofile_id JOIN users u ON u.id=cp.users_id ${where} ORDER BY s.created_at DESC LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(`SELECT COUNT(*) AS total FROM college_sports_activities s JOIN collegeprofile cp ON cp.id=s.collegeprofile_id JOIN users u ON u.id=cp.users_id ${where}`, params),
    fetchCollegeOptions(),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function pageUrl(p: number) {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q); if (collegeId) qs.set("collegeId", collegeId); qs.set("page", String(p));
    return `/admin/colleges/sports?${qs.toString()}`;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <CollegeFilterBar colleges={collegeOptions} selectedId={collegeId} total={total} label="Sports & Cultural Activities" icon="sports_basketball" description="Manage extra-curricular activities — filter by college to see classified data." />
      <SportsListClient activities={activities} colleges={collegeOptions as any} offset={offset} onAdd={createActivity} onEdit={updateActivity} onDelete={deleteActivityRow} />
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
