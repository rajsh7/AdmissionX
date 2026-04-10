import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import PlacementListClient from "./PlacementListClient";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createPlacement(formData: FormData) {
  "use server";
  const collegeprofile_id          = formData.get("collegeprofile_id");
  const numberofrecruitingcompany  = formData.get("numberofrecruitingcompany") || null;
  const ctchighest                 = formData.get("ctchighest")                || null;
  const ctclowest                  = formData.get("ctclowest")                 || null;
  const ctcaverage                 = formData.get("ctcaverage")                || null;
  const placementinfo              = formData.get("placementinfo")             || null;

  try {
    await pool.query(
      `INSERT INTO placement 
        (collegeprofile_id, numberofrecruitingcompany, ctchighest, ctclowest, ctcaverage, placementinfo, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [collegeprofile_id, numberofrecruitingcompany, ctchighest, ctclowest, ctcaverage, placementinfo],
    );
  } catch (e) {
    console.error("[admin/colleges/placements createAction]", e);
  }
  revalidatePath("/admin/colleges/placements");
}

async function updatePlacement(formData: FormData) {
  "use server";
  const id                         = formData.get("id");
  const collegeprofile_id          = formData.get("collegeprofile_id");
  const numberofrecruitingcompany  = formData.get("numberofrecruitingcompany") || null;
  const ctchighest                 = formData.get("ctchighest")                || null;
  const ctclowest                  = formData.get("ctclowest")                 || null;
  const ctcaverage                 = formData.get("ctcaverage")                || null;
  const placementinfo              = formData.get("placementinfo")             || null;

  try {
    await pool.query(
      `UPDATE placement 
          SET collegeprofile_id = ?, numberofrecruitingcompany = ?, ctchighest = ?, 
              ctclowest = ?, ctcaverage = ?, placementinfo = ?, updated_at = NOW()
        WHERE id = ?`,
      [collegeprofile_id, numberofrecruitingcompany, ctchighest, ctclowest, ctcaverage, placementinfo, id],
    );
  } catch (e) {
    console.error("[admin/colleges/placements updateAction]", e);
  }
  revalidatePath("/admin/colleges/placements");
}

async function deletePlacementRow(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM placement WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/colleges/placements deleteAction]", e);
  }
  revalidatePath("/admin/colleges/placements");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

async function safeQuery<T >(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/colleges/placements safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlacementRow  {
  id: number;
  collegeprofile_id: number;
  college_name: string;
  recruiting_companies: string;
  highest_ctc: string;
  lowest_ctc: string;
  average_ctc: string;
  placement_info: string;
}

interface CountRow  {
  total: number;
}

interface OptionRow  {
  id: number;
  name: string;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CollegePlacementsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp   = await searchParams;
  const q    = (sp.q ?? "").trim();
  const collegeId = (sp.collegeId ?? "").trim();
  const highestCtc = (sp.highestCtc ?? "").trim();
  const lowestCtc = (sp.lowestCtc ?? "").trim();
  const averageCtc = (sp.averageCtc ?? "").trim();
  const recruitingCompanies = (sp.recruitingCompanies ?? "").trim();
  const placementInfo = (sp.placementInfo ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // ── Build WHERE clause ─────────────────────────────────────────────────────
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push(
      "(u.firstname LIKE ? OR pl.placementinfo LIKE ?)",
    );
    params.push(`%${q}%`, `%${q}%`);
  }

  if (collegeId) {
    conditions.push("pl.collegeprofile_id = ?");
    params.push(collegeId);
  }

  if (highestCtc) {
    conditions.push("pl.ctchighest LIKE ?");
    params.push(`%${highestCtc}%`);
  }

  if (lowestCtc) {
    conditions.push("pl.ctclowest LIKE ?");
    params.push(`%${lowestCtc}%`);
  }

  if (averageCtc) {
    conditions.push("pl.ctcaverage LIKE ?");
    params.push(`%${averageCtc}%`);
  }

  if (recruitingCompanies) {
    conditions.push("pl.numberofrecruitingcompany LIKE ?");
    params.push(`%${recruitingCompanies}%`);
  }

  if (placementInfo) {
    conditions.push("pl.placementinfo LIKE ?");
    params.push(`%${placementInfo}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Fetch metadata + data ──────────────────────────────────────────────────
  const [placements, countRows, colleges] = await Promise.all([
    safeQuery<PlacementRow>(
      `SELECT 
        pl.id,
        pl.collegeprofile_id,
        COALESCE(u.firstname, 'Unnamed College') as college_name,
        pl.numberofrecruitingcompany as recruiting_companies,
        pl.ctchighest as highest_ctc,
        pl.ctclowest as lowest_ctc,
        pl.ctcaverage as average_ctc,
        pl.placementinfo as placement_info
       FROM placement pl
       JOIN collegeprofile cp ON cp.id = pl.collegeprofile_id
       JOIN users u ON u.id = cp.users_id
       ${where}
       ORDER BY pl.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total 
       FROM placement pl 
       JOIN collegeprofile cp ON cp.id = pl.collegeprofile_id
       JOIN users u ON u.id = cp.users_id
       ${where}`,
      params,
    ),
    safeQuery<OptionRow>(
      "SELECT cp.id, u.firstname AS name FROM collegeprofile cp JOIN users u ON u.id = cp.users_id ORDER BY u.firstname ASC"
    )
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const buildPageHref = (targetPage: number) => {
    const query = new URLSearchParams({ page: String(targetPage) });
    if (q) query.set("q", q);
    if (collegeId) query.set("collegeId", collegeId);
    if (highestCtc) query.set("highestCtc", highestCtc);
    if (lowestCtc) query.set("lowestCtc", lowestCtc);
    if (averageCtc) query.set("averageCtc", averageCtc);
    if (recruitingCompanies) query.set("recruitingCompanies", recruitingCompanies);
    if (placementInfo) query.set("placementInfo", placementInfo);
    return `/admin/colleges/placements?${query.toString()}`;
  };

  return (
    <div className="p-6 space-y-6 w-full">
      
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>monitoring</span>
            Placement stats
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Track and manage college placement records and CTC data.</p>
        </div>
        <div className="flex items-center gap-3">
          <form method="GET" action="/admin/colleges/placements" className="w-full sm:w-80">
            {collegeId ? <input type="hidden" name="collegeId" value={collegeId} /> : null}
            {highestCtc ? <input type="hidden" name="highestCtc" value={highestCtc} /> : null}
            {lowestCtc ? <input type="hidden" name="lowestCtc" value={lowestCtc} /> : null}
            {averageCtc ? <input type="hidden" name="averageCtc" value={averageCtc} /> : null}
            {recruitingCompanies ? <input type="hidden" name="recruitingCompanies" value={recruitingCompanies} /> : null}
            {placementInfo ? <input type="hidden" name="placementInfo" value={placementInfo} /> : null}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
              <input 
                type="text" 
                name="q" 
                defaultValue={q}
                placeholder="Search colleges, placement info..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </form>
        </div>
      </div>

      <PlacementListClient 
        placements={placements}
        colleges={colleges}
        offset={offset}
        total={total}
        pageSize={PAGE_SIZE}
        searchQuery={q}
        selectedCollegeId={collegeId}
        selectedHighestCtc={highestCtc}
        selectedLowestCtc={lowestCtc}
        selectedAverageCtc={averageCtc}
        selectedRecruitingCompanies={recruitingCompanies}
        selectedPlacementInfo={placementInfo}
        onAdd={createPlacement}
        onDelete={deletePlacementRow}
      />

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500">
            Showing <strong>{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total.toLocaleString()}</strong> placement records
          </p>
          <div className="flex items-center gap-1">
            {page > 1 ? (
              <Link href={buildPageHref(page - 1)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">← Prev</Link>
            ) : (
              <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">← Prev</span>
            )}
            <span className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-blue-50 border border-blue-100 rounded-lg">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link href={buildPageHref(page + 1)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Next →</Link>
            ) : (
              <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">Next →</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}




