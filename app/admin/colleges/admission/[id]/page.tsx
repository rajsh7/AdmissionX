import pool from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

interface AdmissionRow {
  id: number;
  collegeprofile_id: number;
  title: string;
  description: string | null;
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
    console.error("[admin/colleges/admission/[id] safeQuery]", err);
    return [];
  }
}

async function updateAdmission(formData: FormData) {
  "use server";
  const id = formData.get("id");
  const collegeprofile_id = formData.get("collegeprofile_id");
  const title = formData.get("title");
  const description = formData.get("description") || null;

  try {
    await pool.query(
      `UPDATE college_admission_procedures
          SET collegeprofile_id = ?, title = ?, description = ?, updated_at = NOW()
        WHERE id = ?`,
      [collegeprofile_id, title, description, id],
    );
  } catch (e) {
    console.error("[admin/colleges/admission/[id] updateAction]", e);
  }
  revalidatePath("/admin/colleges/admission");
  redirect("/admin/colleges/admission");
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

export default async function EditAdmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (Number.isNaN(idNum)) notFound();

  const [admissions, colleges] = await Promise.all([
    safeQuery<AdmissionRow>(
      `SELECT
        ap.*,
        COALESCE(u.firstname, 'Unnamed College') as college_name
       FROM college_admission_procedures ap
       JOIN collegeprofile cp ON cp.id = ap.collegeprofile_id
       JOIN users u ON u.id = cp.users_id
       WHERE ap.id = ?
       LIMIT 1`,
      [idNum],
    ),
    safeQuery<OptionRow>(
      "SELECT cp.id, u.firstname AS name FROM collegeprofile cp JOIN users u ON u.id = cp.users_id ORDER BY u.firstname ASC",
    ),
  ]);

  const admission = admissions[0];
  if (!admission) notFound();

  const createdAt = admission.created_at
    ? new Date(admission.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "-";

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8">
      <form action={updateAdmission} className="w-full">
        <input type="hidden" name="id" value={admission.id} />

        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/admin/colleges/admission"
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
              Edit Admission Procedure
            </h1>
            <p className="text-sm text-slate-400 font-medium mt-0.5 truncate">
              {admission.title || "Procedure"}
            </p>
          </div>

          <button
            type="submit"
            className="h-10 px-6 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-black hover:bg-slate-100 transition-colors shadow-sm flex items-center gap-2 flex-shrink-0"
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
              <SectionHeading icon="assignment_ind" title="Procedure Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>College</label>
                  <div className="relative">
                    <select name="collegeprofile_id" defaultValue={admission.collegeprofile_id} className={selectCls}>
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
                  <label className={labelCls}>Procedure Title</label>
                  <input
                    name="title"
                    defaultValue={admission.title ?? ""}
                    placeholder="e.g. B.Tech Admission Process"
                    className={inputCls}
                  />
                </div>
              </div>
            </Card>

            <Card>
              <SectionHeading icon="description" title="Description" />
              <textarea
                name="description"
                defaultValue={admission.description ?? ""}
                placeholder="Step-by-step admission guidelines..."
                className={textareaCls}
              />
            </Card>
          </div>

          <div className="w-full space-y-6">
            <Card>
              <SectionHeading icon="tune" title="Procedure Summary" />
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">College</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    {admission.college_name || "-"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Procedure</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    {admission.title || "-"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ID</p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">
                      #{admission.id}
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
