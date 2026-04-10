import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import PrivilegeListClient from "./PrivilegeListClient";

const PAGE_SIZE = 25;

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createPrivilege(formData: FormData) {
  "use server";
  const users_id = formData.get("users_id") as string;
  const table_id = formData.get("alltableinformations_id") as string;
  const create = parseInt(formData.get("create") as string, 10);
  const show = parseInt(formData.get("show") as string, 10);
  const edit = parseInt(formData.get("edit") as string, 10);
  const update = parseInt(formData.get("update") as string, 10);
  const del = parseInt(formData.get("delete") as string, 10);

  if (!users_id || !table_id) return;

  try {
    await pool.query(
      `INSERT INTO userprivileges (users_id, allTableInformation_id, \`create\`, \`show\`, \`edit\`, \`update\`, \`delete\`, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [users_id, table_id, create, show, edit, update, del]
    );
  } catch (e) {
    console.error("[admin/members/privilege createAction]", e);
  }
  revalidatePath("/admin/members/privilege");
  revalidatePath("/", "layout");
}

async function updatePrivilege(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const users_id = formData.get("users_id") as string;
  const table_id = formData.get("alltableinformations_id") as string;
  const create = parseInt(formData.get("create") as string, 10);
  const show = parseInt(formData.get("show") as string, 10);
  const edit = parseInt(formData.get("edit") as string, 10);
  const update = parseInt(formData.get("update") as string, 10);
  const del = parseInt(formData.get("delete") as string, 10);

  if (isNaN(id) || !users_id || !table_id) return;

  try {
    await pool.query(
      `UPDATE userprivileges SET users_id = ?, allTableInformation_id = ?, \`create\` = ?, \`show\` = ?, \`edit\` = ?, \`update\` = ?, \`delete\` = ?, updated_at = NOW() 
       WHERE id = ?`,
      [users_id, table_id, create, show, edit, update, del, id]
    );
  } catch (e) {
    console.error("[admin/members/privilege updateAction]", e);
  }
  revalidatePath("/admin/members/privilege");
  revalidatePath("/", "layout");
}

async function deletePrivilege(id: number) {
  "use server";
  if (isNaN(id)) return;
  try {
    await pool.query("DELETE FROM userprivileges WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/members/privilege deleteAction]", e);
  }
  revalidatePath("/admin/members/privilege");
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
    console.error("[admin/members/privilege safeQuery]", err);
    return [];
  }
}

interface PrivilegeRow  {
  id: number;
  user_name: string;
  user_lastname: string;
  user_email: string;
  table_name: string;
  allTableInformation_id: string;
  create: number;
  edit: number;
  update: number;
  delete: number;
  show: number;
  users_id: string | number;
}

interface UserRow  {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

interface TableRow  {
  id: number;
  name: string;
}

interface StatsRow  {
  total: number;
  tables: number;
  users: number;
}

interface CountRow  {
  total: number;
}

export default async function MembersPrivilegePage({
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
    conditions.push("(u.firstname LIKE ? OR u.lastname LIKE ? OR u.email LIKE ? OR ati.name LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const sortSql = sort === "oldest" ? "p.id ASC" : 
                sort === "name"   ? "u.firstname ASC, u.lastname ASC" : 
                                   "p.id DESC";

  const [privileges, countRows, statsRows, users, tables] = await Promise.all([
    safeQuery<PrivilegeRow>(
      `SELECT p.id, u.firstname as user_name, u.lastname as user_lastname, u.email as user_email, p.users_id, 
              p.allTableInformation_id, ati.name as table_name,
              p.create, p.edit, p.update, p.delete, p.show
       FROM userprivileges p
       LEFT JOIN users u ON p.users_id = u.id
       LEFT JOIN alltableinformations ati ON p.allTableInformation_id = ati.id
       ${where}
       ORDER BY ${sortSql}
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset]
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total 
       FROM userprivileges p
       LEFT JOIN users u ON p.users_id = u.id
       LEFT JOIN alltableinformations ati ON p.allTableInformation_id = ati.id
       ${where}`,
      params
    ),
    safeQuery<StatsRow>(`
      SELECT 
        COUNT(*) AS total,
        COUNT(DISTINCT allTableInformation_id) AS tables,
        COUNT(DISTINCT users_id) AS users
      FROM userprivileges
    `),
    safeQuery<UserRow>("SELECT id, firstname, lastname, email FROM users ORDER BY firstname ASC"),
    safeQuery<TableRow>("SELECT id, name FROM alltableinformations ORDER BY name ASC"),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const stats = statsRows[0];

  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: "1", sort, ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => String(v) !== "" && String(v) !== "1" && String(v) !== "newest")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/members/privilege${qs ? `?${qs}` : ""}`;
  }

  const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };
  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <form method="GET" className="flex-1 flex gap-2">
          {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px]" style={ICO}>
              search
            </span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by user or table name..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-800"
            />
          </div>
        </form>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {[{ v: "newest", l: "Newest" }, { v: "oldest", l: "Oldest" }, { v: "name", l: "User A-Z" }].map(opt => (
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

      <PrivilegeListClient 
        privileges={privileges} 
        users={users}
        tables={tables}
        offset={offset}
        createPrivilege={createPrivilege}
        updatePrivilege={updatePrivilege}
        deletePrivilege={deletePrivilege}
      />

      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between rounded-b-2xl shadow-sm">
          <p className="text-xs text-slate-500">
            Showing <strong>{offset + 1}</strong> to <strong>{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total}</strong> privilege records
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




