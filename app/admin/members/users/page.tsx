import pool from "@/lib/db";
import { getDb } from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import UserListClient from "./UserListClient";

const PAGE_SIZE = 25;

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createUser(formData: FormData) {
  "use server";
  const firstname = formData.get("firstname") as string;
  const lastname = formData.get("lastname") as string;
  const email = (formData.get("email") as string).toLowerCase();
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  const userrole_id = parseInt(formData.get("userrole_id") as string, 10);
  const userstatus_id = parseInt(formData.get("userstatus_id") as string, 10);
  const type_of_user = (formData.get("type_of_user") as string) || "MEMBER";

  if (!email || !password) return;

  try {
    const hashed = await bcrypt.hash(password, 12);
    await pool.query(
      `INSERT INTO users (firstname, lastname, email, phone, password, userrole_id, userstatus_id, type_of_user, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [firstname, lastname, email, phone, hashed, userrole_id, userstatus_id, type_of_user]
    );
  } catch (e) {
    console.error("[admin/members/users createUser]", e);
  }
  revalidatePath("/admin/members/users");
  revalidatePath("/", "layout");
}

async function updateUser(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const firstname = formData.get("firstname") as string;
  const lastname = formData.get("lastname") as string;
  const email = (formData.get("email") as string).toLowerCase();
  const phone = formData.get("phone") as string;
  const userrole_id = parseInt(formData.get("userrole_id") as string, 10);
  const userstatus_id = parseInt(formData.get("userstatus_id") as string, 10);
  const type_of_user = (formData.get("type_of_user") as string) || "MEMBER";
  const password = formData.get("password") as string;

  if (isNaN(id) || !email) return;

  try {
    let sql = `UPDATE users SET firstname = ?, lastname = ?, email = ?, phone = ?, userrole_id = ?, userstatus_id = ?, type_of_user = ?, updated_at = NOW()`;
    let params = [firstname, lastname, email, phone, userrole_id, userstatus_id, type_of_user];

    if (password && password.trim().length >= 8) {
      const hashed = await bcrypt.hash(password, 12);
      sql = `UPDATE users SET firstname = ?, lastname = ?, email = ?, phone = ?, userrole_id = ?, userstatus_id = ?, type_of_user = ?, password = ?, updated_at = NOW()`;
      params.push(hashed);
    }

    sql += ` WHERE id = ?`;
    params.push(id);

    await pool.query(sql, params);
  } catch (e) {
    console.error("[admin/members/users updateUser]", e);
  }
  revalidatePath("/admin/members/users");
  revalidatePath("/", "layout");
}

async function deleteUser(id: number) {
  "use server";
  if (isNaN(id)) return;
  try {
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/members/users deleteUser]", e);
  }
  revalidatePath("/admin/members/users");
  revalidatePath("/", "layout");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function safeQuery<T >(
  sql: string,
  params: (string | number)[] = []
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/members/users safeQuery]", err);
    return [];
  }
}

interface UserRow  {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  userstatus_id: number;
  userrole_id: number;
  status_name: string;
  role_name: string;
  type_of_user: string;
  created_at: string;
}

interface CountRow  {
  total: number;
}

interface StatsRow  {
  total: number;
  active: number;
  inactive: number;
  new_last_7d: number;
}

export default async function MembersUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const sort = sp.sort || "newest";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(u.firstname LIKE ? OR u.lastname LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const sortSql = sort === "oldest" ? "u.created_at ASC" : 
                sort === "name"   ? "u.firstname ASC, u.lastname ASC" : 
                                   "u.created_at DESC";

  const [roles, statuses] = await Promise.all([
    safeQuery<{ id: number; name: string }>("SELECT id, name FROM userrole"),
    safeQuery<{ id: number; name: string }>("SELECT id, name FROM userstatus"),
  ]);

  // Fetch from MongoDB
  const db = await getDb();
  const [mongoStudents, mongoColleges] = await Promise.all([
    db.collection("next_student_signups").find({}, { projection: { _id: 1, name: 1, email: 1, phone: 1, is_active: 1, created_at: 1 } }).sort({ created_at: -1 }).toArray(),
    db.collection("next_college_signups").find({}, { projection: { _id: 1, college_name: 1, email: 1, phone: 1, status: 1, created_at: 1 } }).sort({ created_at: -1 }).toArray(),
  ]);

  const studentRows: UserRow[] = mongoStudents.map((s: any) => ({
    id: s._id.toString(),
    firstname: s.name || "",
    lastname: "",
    email: s.email || "",
    phone: s.phone || "",
    type_of_user: "Student",
    created_at: s.created_at ? new Date(s.created_at).toISOString() : "",
    userstatus_id: s.is_active ? 1 : 0,
    userrole_id: 0,
    status_name: s.is_active ? "Active" : "Inactive",
    role_name: "Student",
  }));

  const collegeRows: UserRow[] = mongoColleges.map((c: any) => ({
    id: c._id.toString(),
    firstname: c.college_name || "",
    lastname: "",
    email: c.email || "",
    phone: c.phone || "",
    type_of_user: "College",
    created_at: c.created_at ? new Date(c.created_at).toISOString() : "",
    userstatus_id: c.status === "approved" ? 1 : 0,
    userrole_id: 0,
    status_name: c.status === "approved" ? "Active" : "Pending",
    role_name: "College",
  }));

  let allUsers: UserRow[] = [...studentRows, ...collegeRows];

  if (q) {
    const ql = q.toLowerCase();
    allUsers = allUsers.filter(u =>
      u.firstname.toLowerCase().includes(ql) ||
      u.email.toLowerCase().includes(ql) ||
      (u.phone || "").includes(ql)
    );
  }

  if (sort === "name") allUsers.sort((a, b) => a.firstname.localeCompare(b.firstname));
  else if (sort === "oldest") allUsers.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  else allUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const total = allUsers.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const users = allUsers.slice(offset, offset + PAGE_SIZE);

  const stats = {
    total,
    active: allUsers.filter(u => u.status_name === "Active").length,
    inactive: allUsers.filter(u => u.status_name !== "Active").length,
    new_last_7d: allUsers.filter(u => u.created_at && new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
  };

  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: "1", sort, ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => String(v) !== "" && String(v) !== "1" && String(v) !== "newest")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/members/users${qs ? `?${qs}` : ""}`;
  }

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
  const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats?.total ?? 0, icon: "group", color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Active Now", value: stats?.active ?? 0, icon: "check_circle", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "New (7d)", value: stats?.new_last_7d ?? 0, icon: "person_add", color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Inactive/Blocked", value: stats?.inactive ?? 0, icon: "block", color: "text-rose-600", bg: "bg-rose-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`${s.bg} ${s.color} p-2 rounded-xl`}>
              <span className="material-symbols-rounded text-[18px]" style={ICO_FILL}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800 leading-tight">{(s.value || 0).toLocaleString()}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <form method="GET" className="flex-1 flex gap-2">
          {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px]" style={ICO}>
              search
            </span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-slate-50"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
            Search
          </button>
          {q && (
            <Link href={buildUrl({ q: "" })} className="px-4 py-2.5 bg-slate-100 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors">
              Clear
            </Link>
          )}
        </form>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {[{ v: "newest", l: "Newest" }, { v: "oldest", l: "Oldest" }, { v: "name", l: "A-Z" }].map(opt => (
            <Link
              key={opt.v}
              href={buildUrl({ sort: opt.v, page: 1 })}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                sort === opt.v ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {opt.l}
            </Link>
          ))}
        </div>
      </div>

      <UserListClient 
        users={users} 
        roles={roles as { id: number; name: string }[]} 
        statuses={statuses as { id: number; name: string }[]} 
        offset={offset}
        createUser={createUser}
        updateUser={updateUser}
        deleteUser={deleteUser}
      />

      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between rounded-b-2xl shadow-sm">
          <p className="text-xs text-slate-500">
            Showing <strong>{offset + 1}</strong> to <strong>{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total}</strong> users
          </p>
          <div className="flex gap-1">
            {page > 1 && (
              <Link href={buildUrl({ page: page - 1 })} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                Prev
              </Link>
            )}
            {page < totalPages && (
              <Link href={buildUrl({ page: page + 1 })} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}





