import pool from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

interface StudentProfileRow {
  id: number;
  users_id: number;
  student_name: string | null;
  student_email: string | null;
  gender: string | null;
  dateofbirth: string | null;
  parentsname: string | null;
  parentsnumber: string | null;
  entranceexamname: string | null;
  entranceexamnumber: string | null;
  hobbies: string | null;
  interests: string | null;
  projects: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface UserRow {
  id: number;
  name: string;
  email: string;
}

async function safeQuery<T>(sql: string, params: (string | number)[] = []): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/students/profile/[id] safeQuery]", err);
    return [];
  }
}

async function updateProfile(formData: FormData) {
  "use server";

  const id = parseInt(formData.get("id") as string, 10);
  const users_id = parseInt(formData.get("users_id") as string, 10);
  const gender = String(formData.get("gender") ?? "");
  const dateofbirth = String(formData.get("dateofbirth") ?? "");
  const parentsname = String(formData.get("parentsname") ?? "");
  const parentsnumber = String(formData.get("parentsnumber") ?? "");
  const hobbies = String(formData.get("hobbies") ?? "");
  const interests = String(formData.get("interests") ?? "");
  const projects = String(formData.get("projects") ?? "");
  const entranceexamname = String(formData.get("entranceexamname") ?? "");
  const entranceexamnumber = String(formData.get("entranceexamnumber") ?? "");

  if (isNaN(id) || isNaN(users_id)) return;

  try {
    await pool.query(
      `UPDATE studentprofile SET 
        users_id = ?, gender = ?, dateofbirth = ?, parentsname = ?, parentsnumber = ?,
        entranceexamname = ?, entranceexamnumber = ?, hobbies = ?, interests = ?, projects = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [
        users_id,
        gender,
        dateofbirth,
        parentsname,
        parentsnumber,
        entranceexamname,
        entranceexamnumber,
        hobbies,
        interests,
        projects,
        id,
      ],
    );
  } catch (e) {
    console.error("[admin/students/profile/[id] updateProfile]", e);
  }

  revalidatePath("/admin/students/profile");
  redirect("/admin/students/profile");
}

const inputCls =
  "w-full h-10 px-4 border border-slate-200 rounded-xl text-sm font-medium bg-white " +
  "focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all " +
  "placeholder:text-slate-300 text-slate-700";

const selectCls = `${inputCls} appearance-none pr-10`;

const textareaCls =
  "w-full min-h-[90px] px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium bg-white " +
  "focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all " +
  "resize-none placeholder:text-slate-300 text-slate-700";

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

export default async function EditStudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) notFound();

  const [profiles, users] = await Promise.all([
    safeQuery<StudentProfileRow>(
      `SELECT sp.*, s.name as student_name, s.email as student_email
       FROM studentprofile sp
       LEFT JOIN next_student_signups s ON sp.users_id = s.id
       WHERE sp.id = ?
       LIMIT 1`,
      [idNum],
    ),
    safeQuery<UserRow>("SELECT id, name, email FROM next_student_signups ORDER BY name ASC LIMIT 1000"),
  ]);

  const profile = profiles[0];
  if (!profile) notFound();

  const formattedDob = (() => {
    if (!profile.dateofbirth) return "";
    const d = new Date(profile.dateofbirth);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  })();

  const createdAt = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "-";

  const currentUserMissing = users && !users.find((u) => u.id === profile.users_id);

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8">
      <form action={updateProfile} className="w-full">
        <input type="hidden" name="id" value={profile.id} />

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/admin/students/profile"
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
              Edit Student Profile
            </h1>
            <p className="text-sm text-slate-400 font-medium mt-0.5 truncate">
              {profile.student_name || "Student"}
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

        {/* Two-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
          {/* Left column */}
          <div className="flex-1 min-w-0 space-y-6">
            <Card>
              <SectionHeading icon="person" title="Basic Details" />
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Linked User Account</label>
                  <div className="relative">
                    <select
                      name="users_id"
                      defaultValue={profile.users_id}
                      className={selectCls}
                      required
                    >
                      <option value="">Select a user</option>
                      {users.map((u, idx) => (
                        <option key={`${u.id}-${u.email}-${idx}`} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                      {currentUserMissing && (
                        <option value={profile.users_id}>
                          {profile.student_name} ({profile.student_email})
                        </option>
                      )}
                    </select>
                    <span className="material-symbols-outlined text-[18px] text-slate-400 absolute right-3 top-2.5 pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Gender</label>
                    <div className="relative">
                      <select name="gender" defaultValue={profile.gender || "Male"} className={selectCls}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                      <span className="material-symbols-outlined text-[18px] text-slate-400 absolute right-3 top-2.5 pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Date of Birth</label>
                    <input
                      type="date"
                      name="dateofbirth"
                      defaultValue={formattedDob}
                      className={inputCls}
                      required
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <SectionHeading icon="call" title="Parent & Contact" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Parent's Name</label>
                  <input
                    name="parentsname"
                    defaultValue={profile.parentsname ?? ""}
                    placeholder="e.g. John Doe"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Parent's Number</label>
                  <input
                    name="parentsnumber"
                    defaultValue={profile.parentsnumber ?? ""}
                    placeholder="e.g. +91 9876543210"
                    className={inputCls}
                  />
                </div>
              </div>
            </Card>

            <Card>
              <SectionHeading icon="school" title="Entrance & Interests" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Entrance Exam Name</label>
                  <input
                    name="entranceexamname"
                    defaultValue={profile.entranceexamname ?? ""}
                    placeholder="e.g. JEE Main"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Entrance Exam Number</label>
                  <input
                    name="entranceexamnumber"
                    defaultValue={profile.entranceexamnumber ?? ""}
                    placeholder="e.g. 12345678"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Hobbies</label>
                  <input
                    name="hobbies"
                    defaultValue={profile.hobbies ?? ""}
                    placeholder="e.g. Reading, Coding"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Interests</label>
                  <input
                    name="interests"
                    defaultValue={profile.interests ?? ""}
                    placeholder="e.g. Technology, Medicine"
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className={labelCls}>Projects</label>
                <textarea
                  name="projects"
                  defaultValue={profile.projects ?? ""}
                  placeholder="Describe any projects or portfolio links..."
                  className={textareaCls}
                />
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="w-full space-y-6">
            <Card>
              <SectionHeading icon="tune" title="Profile Summary" />
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Student</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    {profile.student_name || "Unknown"}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {profile.student_email || "-"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ID</p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">
                      #{profile.id}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Created</p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">
                      {createdAt}
                    </p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Linked User</p>
                  <p className="text-[12px] text-slate-600 mt-1 truncate">
                    {profile.users_id}
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
