import pool from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

interface SportsRow {
  id: number;
  collegeprofile_id: number;
  name: string;
  typeOfActivity: number;
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
    console.error("[admin/colleges/sports/[id] safeQuery]", err);
    return [];
  }
}

async function updateActivity(formData: FormData) {
  "use server";
  const id = formData.get("id");
  const collegeprofile_id = formData.get("collegeprofile_id");
  const name = formData.get("name");
  const type = formData.get("typeOfActivity");

  try {
    await pool.query(
      `UPDATE college_sports_activities
          SET collegeprofile_id = ?, name = ?, typeOfActivity = ?, updated_at = NOW()
        WHERE id = ?`,
      [collegeprofile_id, name, type, id],
    );
  } catch (e) {
    console.error("[admin/colleges/sports/[id] updateAction]", e);
  }
  revalidatePath("/admin/colleges/sports");
  redirect("/admin/colleges/sports");
}

const inputCls =
  "w-full h-10 px-4 border border-slate-200 rounded-xl text-sm font-medium bg-white " +
  "focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all " +
  "placeholder:text-slate-300 text-slate-700";

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

export default async function EditSportsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (Number.isNaN(idNum)) notFound();

  const [activities, colleges] = await Promise.all([
    safeQuery<SportsRow>(
      `SELECT
        s.*,
        COALESCE(u.firstname, 'Unnamed College') as college_name
       FROM college_sports_activities s
       JOIN collegeprofile cp ON cp.id = s.collegeprofile_id
       JOIN users u ON u.id = cp.users_id
       WHERE s.id = ?
       LIMIT 1`,
      [idNum],
    ),
    safeQuery<OptionRow>(
      "SELECT cp.id, u.firstname AS name FROM collegeprofile cp JOIN users u ON u.id = cp.users_id ORDER BY u.firstname ASC",
    ),
  ]);

  const activity = activities[0];
  if (!activity) notFound();

  const createdAt = activity.created_at
    ? new Date(activity.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "-";

  const activityType = Number(activity.typeOfActivity);
  const activityLabel =
    activityType === 1
      ? "Sports"
      : activityType === 2
      ? "Cultural"
      : "Association";

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8">
      <form action={updateActivity} className="w-full">
        <input type="hidden" name="id" value={activity.id} />

        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/admin/colleges/sports"
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
              Edit Sports & Cultural Activity
            </h1>
            <p className="text-sm text-slate-400 font-medium mt-0.5 truncate">
              {activity.name || "Activity"}
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
              <SectionHeading icon="sports_basketball" title="Activity Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>College</label>
                  <div className="relative">
                    <select name="collegeprofile_id" defaultValue={activity.collegeprofile_id} className={selectCls}>
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
                  <label className={labelCls}>Activity Type</label>
                  <div className="relative">
                    <select name="typeOfActivity" defaultValue={activity.typeOfActivity ?? 1} className={selectCls}>
                      <option value="1">Sports</option>
                      <option value="2">Cultural</option>
                      <option value="3">Association</option>
                    </select>
                    <span className="material-symbols-outlined text-[18px] text-slate-400 absolute right-3 top-2.5 pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Activity Name</label>
                  <input
                    name="name"
                    defaultValue={activity.name ?? ""}
                    placeholder="e.g. Cricket, Robotics Club"
                    className={inputCls}
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="w-full space-y-6">
            <Card>
              <SectionHeading icon="tune" title="Activity Summary" />
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">College</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    {activity.college_name || "-"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Type</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    {activityLabel}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ID</p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">
                      #{activity.id}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Created</p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">
                      {createdAt}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
