import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { fetchCollegeOptions } from "../_components/college-options";
import CollegeFilterBar from "../_components/CollegeFilterBar";
import PlacementListClient from "./PlacementListClient";

async function createPlacement(formData: FormData) {
  "use server";
  try {
    await pool.query(
      `INSERT INTO placement (collegeprofile_id, numberofrecruitingcompany, ctchighest, ctclowest, ctcaverage, placementinfo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [formData.get("collegeprofile_id"), formData.get("numberofrecruitingcompany") || null, formData.get("ctchighest") || null, formData.get("ctclowest") || null, formData.get("ctcaverage") || null, formData.get("placementinfo") || null],
    );
  } catch (e) { console.error("[admin/colleges/placements createAction]", e); }
  revalidatePath("/admin/colleges/placements");
}

async function updatePlacement(formData: FormData) {
  "use server";
  try {
    await pool.query(
      `UPDATE placement SET collegeprofile_id=?, numberofrecruitingcompany=?, ctchighest=?, ctclowest=?, ctcaverage=?, placementinfo=?, updated_at=NOW() WHERE id=?`,
      [formData.get("collegeprofile_id"), formData.get("numberofrecruitingcompany") || null, formData.get("ctchighest") || null, formData.get("ctclowest") || null, formData.get("ctcaverage") || null, formData.get("placementinfo") || null, formData.get("id")],
    );
  } catch (e) { console.error("[admin/colleges/placements updateAction]", e); }
  revalidatePath("/admin/colleges/placements");
}

async function deletePlacementRow(id: number) {
  "use server";
  try { await pool.query("DELETE FROM placement WHERE id = ?", [id]); }
  catch (e) { console.error("[admin/colleges/placements deleteAction]", e); }
  revalidatePath("/admin/colleges/placements");
}

const PAGE_SIZE = 25;
async function safeQuery<T>(sql: string, params: (string | number)[] = []): Promise<T[]> {
  try { const [rows] = (await pool.query(sql, params)) as [T[], unknown]; return rows; }
  catch (err) { console.error("[admin/colleges/placements safeQuery]", err); return []; }
}

interface PlacementRow { id: number; collegeprofile_id: number; college_name: string; recruiting_companies: string; highest_ctc: string; lowest_ctc: string; average_ctc: string; placement_info: string; }
interface CountRow { total: number; }

export default async function CollegePlacementsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp        = await searchParams;
  const q         = (sp.q ?? "").trim();
  const collegeId = sp.collegeId ?? "";
  const page      = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset    = (page - 1) * PAGE_SIZE;

  const conditions: string[] = [];
  const params: (string | number)[] = [];
  if (q) { conditions.push("(u.firstname LIKE ? OR pl.placementinfo LIKE ?)"); params.push(`%${q}%`, `%${q}%`); }
  if (collegeId) { conditions.push("pl.collegeprofile_id = ?"); params.push(collegeId); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [placements, countRows, collegeOptions] = await Promise.all([
    safeQuery<PlacementRow>(
      `SELECT pl.id, pl.collegeprofile_id, COALESCE(u.firstname,'Unnamed College') as college_name, pl.numberofrecruitingcompany as recruiting_companies, pl.ctchighest as highest_ctc, pl.ctclowest as lowest_ctc, pl.ctcaverage as average_ctc, pl.placementinfo as placement_info
       FROM placement pl JOIN collegeprofile cp ON cp.id=pl.collegeprofile_id JOIN users u ON u.id=cp.users_id ${where} ORDER BY pl.created_at DESC LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(`SELECT COUNT(*) AS total FROM placement pl JOIN collegeprofile cp ON cp.id=pl.collegeprofile_id JOIN users u ON u.id=cp.users_id ${where}`, params),
    fetchCollegeOptions(),
  ]);

  const total      = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function pageUrl(p: number) {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (collegeId) qs.set("collegeId", collegeId);
    qs.set("page", String(p));
    return `/admin/colleges/placements?${qs.toString()}`;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <CollegeFilterBar colleges={collegeOptions} selectedId={collegeId} total={total} label="College Placements" icon="monitoring" description="Track placement records and CTC data — filter by college to see classified data." />

      <PlacementListClient placements={placements} colleges={collegeOptions as any} offset={offset} onAdd={createPlacement} onEdit={updatePlacement} onDelete={deletePlacementRow} />

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
