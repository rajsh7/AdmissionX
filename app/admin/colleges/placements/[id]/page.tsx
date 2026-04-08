import pool from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

interface PlacementRow {
  id: number;
  collegeprofile_id: number;
  numberofrecruitingcompany: string | null;
  ctchighest: string | null;
  ctclowest: string | null;
  ctcaverage: string | null;
  placementinfo: string | null;
  college_name: string | null;
  created_at?: string | null;
}

interface OptionRow {
  id: number;
  name: string;
}

async function safeQuery<T>(sql: string, params: (string | number)[] = []): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/colleges/placements/[id] safeQuery]", err);
    return [];
  }
}

async function updatePlacement(formData: FormData) {
  "use server";
  const id = formData.get("id");
  const collegeprofile_id = formData.get("collegeprofile_id");
  const numberofrecruitingcompany = formData.get("numberofrecruitingcompany") || null;
  const ctchighest = formData.get("ctchighest") || null;
  const ctclowest = formData.get("ctclowest") || null;
  const ctcaverage = formData.get("ctcaverage") || null;
  const placementinfo = formData.get("placementinfo") || null;

  try {
    await pool.query(
      `UPDATE placement
          SET collegeprofile_id = ?, numberofrecruitingcompany = ?, ctchighest = ?,
              ctclowest = ?, ctcaverage = ?, placementinfo = ?, updated_at = NOW()
        WHERE id = ?`,
      [
        collegeprofile_id,
        numberofrecruitingcompany,
        ctchighest,
        ctclowest,
        ctcaverage,
        placementinfo,
        id,
      ],
    );
  } catch (e) {
    console.error("[admin/colleges/placements/[id] updateAction]", e);
  }
  revalidatePath("/admin/colleges/placements");
  redirect("/admin/colleges/placements");
}

const inputCls =
  "w-full h-10 px-4 border border-slate-200 rounded-xl text-sm font-medium bg-white " +
  "focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all " +
  "placeholder:text-slate-300 text-slate-700";

const textareaCls =
  "w-full min-h-[140px] px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium bg-white " +
  "focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all " +
  "resize-none placeholder:text-slate-300 text-slate-700";

const selectCls = `${inputCls} appearance-none pr-10`;

const labelCls =
  "text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block";

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

function SectionHeading({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="w-1 h-4 bg-[#008080] rounded-full block flex-shrink-0" />
      <span
        className="material-symbols-outlined text-[18px] text-[#008080]"
        style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}
      >
        {icon}
      </span>
      <h2 className="text-sm font-black text-slate-700">{title}</h2>
    </div>
  );
}

export default async function EditPlacementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (Number.isNaN(idNum)) notFound();

  const [placements, colleges] = await Promise.all([
    safeQuery<PlacementRow>(
      `SELECT
        pl.*,
        COALESCE(u.firstname, 'Unnamed College') as college_name
       FROM placement pl
       JOIN collegeprofile cp ON cp.id = pl.collegeprofile_id
       JOIN users u ON u.id = cp.users_id
       WHERE pl.id = ?
       LIMIT 1`,
      [idNum],
    ),
    safeQuery<OptionRow>(
      "SELECT cp.id, u.firstname AS name FROM collegeprofile cp JOIN users u ON u.id = cp.users_id ORDER BY u.firstname ASC",
    ),
  ]);

  const placement = placements[0];
  if (!placement) notFound();

  const createdAt = placement.created_at
    ? new Date(placement.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "-";

  const avgLabel = placement.ctcaverage ? `Avg: ${placement.ctcaverage}` : "Avg: -";
  const rangeLabel = `Low: ${placement.ctclowest || "-"} | High: ${placement.ctchighest || "-"}`;

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8">
      <form action={updatePlacement} className="w-full">
        <input type="hidden" name="id" value={placement.id} />

        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/admin/colleges/placements"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-500 hover:text-slate-700 flex-shrink-0"
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              chevron_left
            </span>
          </Link>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-slate-800 leading-tight tracking-tight">
              Edit Placement Stats
            </h1>
            <p className="text-sm text-slate-400 font-medium mt-0.5 truncate">
              {placement.college_name || "Placement"}
            </p>
          </div>

          <button
            type="submit"
            className="h-10 px-6 rounded-xl bg-[#008080] text-white text-sm font-black hover:bg-[#006666] active:bg-[#005555] transition-colors shadow-md shadow-[#008080]/25 flex items-center gap-2 flex-shrink-0"
          >
            <span
              className="material-symbols-outlined text-[17px]"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 20" }}
            >
              save
            </span>
            Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
          <div className="flex-1 min-w-0 space-y-6">
            <Card>
              <SectionHeading icon="monitoring" title="Placement Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>College</label>
                  <div className="relative">
                    <select name="collegeprofile_id" defaultValue={placement.collegeprofile_id} className={selectCls}>
                      <option value="">Select college</option>
                      {colleges.map((c, idx) => (
                        <option key={`${c.id}-${c.name}-${idx}`} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined text-[18px] text-slate-400 absolute right-3 top-2.5 pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Recruiting Companies</label>
                  <input
                    name="numberofrecruitingcompany"
                    defaultValue={placement.numberofrecruitingcompany ?? ""}
                    placeholder="e.g. 120"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Highest CTC</label>
                  <input
                    name="ctchighest"
                    defaultValue={placement.ctchighest ?? ""}
                    placeholder="e.g. 48 LPA"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Lowest CTC</label>
                  <input
                    name="ctclowest"
                    defaultValue={placement.ctclowest ?? ""}
                    placeholder="e.g. 5 LPA"
                    className={inputCls}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Average CTC</label>
                  <input
                    name="ctcaverage"
                    defaultValue={placement.ctcaverage ?? ""}
                    placeholder="e.g. 12 LPA"
                    className={inputCls}
                  />
                </div>
              </div>
            </Card>

            <Card>
              <SectionHeading icon="description" title="Notes" />
              <textarea
                name="placementinfo"
                defaultValue={placement.placementinfo ?? ""}
                placeholder="Additional placement details..."
                className={textareaCls}
              />
            </Card>
          </div>

          <div className="w-full space-y-6">
            <Card>
              <SectionHeading icon="tune" title="Placement Summary" />
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">College</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    {placement.college_name || "-"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ID</p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">
                      #{placement.id}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Created</p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">
                      {createdAt}
                    </p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Average CTC</p>
                  <p className="text-sm font-semibold text-emerald-700 mt-1">
                    {avgLabel}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">CTC Range</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    {rangeLabel}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
