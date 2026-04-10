import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import GroupListClient from "./GroupListClient";

const PAGE_SIZE = 25;

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createGroup(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const users_id = parseInt(formData.get("users_id") as string, 10);
  const table_id = formData.get("alltableinformations_id") as string;
  const create_action = parseInt(formData.get("create_action") as string, 10);
  const show_action = parseInt(formData.get("show_action") as string, 10);
  const edit_action = parseInt(formData.get("edit_action") as string, 10);
  const update_action = parseInt(formData.get("update_action") as string, 10);
  const delete_action = parseInt(formData.get("delete_action") as string, 10);

  if (!name || !users_id) return;

  try {
    await pool.query(
      `INSERT INTO usergroups (name, users_id, allTableInformation_id, create_action, show_action, edit_action, update_action, delete_action, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, users_id, table_id, create_action, show_action, edit_action, update_action, delete_action]
    );
  } catch (e) {
    console.error("[admin/members/groups createAction]", e);
  }
  revalidatePath("/admin/members/groups");
  revalidatePath("/", "layout");
}

async function updateGroup(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const name = formData.get("name") as string;
  const users_id = parseInt(formData.get("users_id") as string, 10);
  const table_id = formData.get("alltableinformations_id") as string;
  const create_action = parseInt(formData.get("create_action") as string, 10);
  const show_action = parseInt(formData.get("show_action") as string, 10);
  const edit_action = parseInt(formData.get("edit_action") as string, 10);
  const update_action = parseInt(formData.get("update_action") as string, 10);
  const delete_action = parseInt(formData.get("delete_action") as string, 10);

  if (isNaN(id) || !name || !users_id) return;

  try {
    await pool.query(
      `UPDATE usergroups SET name = ?, users_id = ?, allTableInformation_id = ?, create_action = ?, show_action = ?, edit_action = ?, update_action = ?, delete_action = ?, updated_at = NOW() 
       WHERE id = ?`,
      [name, users_id, table_id, create_action, show_action, edit_action, update_action, delete_action, id]
    );
  } catch (e) {
    console.error("[admin/members/groups updateAction]", e);
  }
  revalidatePath("/admin/members/groups");
  revalidatePath("/", "layout");
}

async function deleteGroup(id: number) {
  "use server";
  if (isNaN(id)) return;
  try {
    await pool.query("DELETE FROM usergroups WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/members/groups deleteAction]", e);
  }
  revalidatePath("/admin/members/groups");
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
    console.error("[admin/members/groups safeQuery]", err);
    return [];
  }
}

interface GroupRow  {
  id: number;
  name: string;
  user_name: string;
  user_lastname: string;
  user_email: string;
  table_name: string;
  create_action: number;
  edit_action: number;
  update_action: number;
  delete_action: number;
  show_action: number;
  users_id: number;
  allTableInformation_id: string;
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
  users_with_groups: number;
}

interface CountRow  {
  total: number;
}

export default async function MembersGroupsPage({
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
    conditions.push("(g.name LIKE ? OR u.firstname LIKE ? OR u.lastname LIKE ? OR u.email LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const sortSql = sort === "oldest" ? "g.id ASC" : 
                sort === "name"   ? "g.name ASC" : 
                                   "g.id DESC";

  const [groups, countRows, statsRows, users, tables] = await Promise.all([
    safeQuery<GroupRow>(
      `SELECT g.id, g.name, u.firstname as user_name, u.lastname as user_lastname, u.email as user_email, g.users_id, 
              g.allTableInformation_id, ati.name as table_name,
              g.create_action, g.edit_action, g.update_action, g.delete_action, g.show_action
       FROM usergroups g
       LEFT JOIN users u ON g.users_id = u.id
       LEFT JOIN alltableinformations ati ON g.allTableInformation_id = ati.id
       ${where}
       ORDER BY ${sortSql}
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset]
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total 
       FROM usergroups g
       LEFT JOIN users u ON g.users_id = u.id
       ${where}`,
      params
    ),
    safeQuery<StatsRow>(`
      SELECT 
        COUNT(*) AS total,
        COUNT(DISTINCT users_id) AS users_with_groups
      FROM usergroups
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
    return `/admin/members/groups${qs ? `?${qs}` : ""}`;
  }

  const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };
  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] font-sans">
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
              placeholder="Search by group or user..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-800"
            />
          </div>
        </form>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {[{ v: "newest", l: "Newest" }, { v: "oldest", l: "Oldest" }, { v: "name", l: "Group A-Z" }].map(opt => (
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

      <GroupListClient 
        groups={groups} 
        users={users}
        tables={tables}
        offset={offset}
        createGroup={createGroup}
        updateGroup={updateGroup}
        deleteGroup={deleteGroup}
      />

      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between rounded-b-2xl shadow-sm">
          <p className="text-xs text-slate-500">
            Showing <strong>{offset + 1}</strong> to <strong>{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total}</strong> groups
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




