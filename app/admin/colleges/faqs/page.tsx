import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { fetchCollegeOptions } from "../_components/college-options";
import CollegeFilterBar from "../_components/CollegeFilterBar";
import FAQListClient from "./FAQListClient";

async function createFAQ(formData: FormData) {
  "use server";
  try { await pool.query(`INSERT INTO college_faqs (collegeprofile_id, question, answer, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())`, [formData.get("collegeprofile_id"), formData.get("question"), formData.get("answer") || null]); }
  catch (e) { console.error("[admin/colleges/faqs createAction]", e); }
  revalidatePath("/admin/colleges/faqs");
}

async function updateFAQ(formData: FormData) {
  "use server";
  try { await pool.query(`UPDATE college_faqs SET collegeprofile_id=?, question=?, answer=?, updated_at=NOW() WHERE id=?`, [formData.get("collegeprofile_id"), formData.get("question"), formData.get("answer") || null, formData.get("id")]); }
  catch (e) { console.error("[admin/colleges/faqs updateAction]", e); }
  revalidatePath("/admin/colleges/faqs");
}

async function deleteFAQRow(id: number) {
  "use server";
  try { await pool.query("DELETE FROM college_faqs WHERE id = ?", [id]); }
  catch (e) { console.error("[admin/colleges/faqs deleteAction]", e); }
  revalidatePath("/admin/colleges/faqs");
}

const PAGE_SIZE = 25;
async function safeQuery<T>(sql: string, params: (string | number)[] = []): Promise<T[]> {
  try { const [rows] = (await pool.query(sql, params)) as [T[], unknown]; return rows; }
  catch (err) { console.error("[admin/colleges/faqs safeQuery]", err); return []; }
}

interface FAQRow { id: number; collegeprofile_id: number; college_name: string; question: string; answer: string; }
interface CountRow { total: number; }

export default async function CollegeFAQsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp        = await searchParams;
  const q         = (sp.q ?? "").trim();
  const collegeId = sp.collegeId ?? "";
  const page      = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset    = (page - 1) * PAGE_SIZE;

  const conditions: string[] = [];
  const params: (string | number)[] = [];
  if (q) { conditions.push("(u.firstname LIKE ? OR f.question LIKE ? OR f.answer LIKE ?)"); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  if (collegeId) { conditions.push("f.collegeprofile_id = ?"); params.push(collegeId); }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [faqs, countRows, collegeOptions] = await Promise.all([
    safeQuery<FAQRow>(
      `SELECT f.id, f.collegeprofile_id, COALESCE(u.firstname,'Unnamed College') as college_name, f.question, f.answer
       FROM college_faqs f JOIN collegeprofile cp ON cp.id=f.collegeprofile_id JOIN users u ON u.id=cp.users_id ${where} ORDER BY f.created_at DESC LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(`SELECT COUNT(*) AS total FROM college_faqs f JOIN collegeprofile cp ON cp.id=f.collegeprofile_id JOIN users u ON u.id=cp.users_id ${where}`, params),
    fetchCollegeOptions(),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function pageUrl(p: number) {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q); if (collegeId) qs.set("collegeId", collegeId); qs.set("page", String(p));
    return `/admin/colleges/faqs?${qs.toString()}`;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <CollegeFilterBar colleges={collegeOptions} selectedId={collegeId} total={total} label="College FAQs" icon="quiz" description="Manage frequently asked questions — filter by college to see classified data." />
      <FAQListClient faqs={faqs} colleges={collegeOptions as any} offset={offset} total={total} pageSize={PAGE_SIZE} onAdd={createFAQ} onEdit={updateFAQ} onDelete={deleteFAQRow} />
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500">Showing <strong>{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total.toLocaleString()}</strong> FAQs</p>
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
