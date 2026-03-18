import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import Link from "next/link";

const PAGE_SIZE = 25;

async function safeQuery<T extends RowDataPacket>(
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

interface GroupRow extends RowDataPacket {
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
}

interface StatsRow extends RowDataPacket {
  total: number;
  users_with_groups: number;
}

interface CountRow extends RowDataPacket {
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

  const [groups, countRows, statsRows] = await Promise.all([
    safeQuery<GroupRow>(
      `SELECT g.id, g.name, u.firstname as user_name, u.lastname as user_lastname, u.email as user_email, g.allTableInformation_id as table_name,
              g.create_action, g.edit_action, g.update_action, g.delete_action, g.show_action
       FROM usergroups g
       LEFT JOIN users u ON g.users_id = u.id
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

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
  const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  const RenderFlag = ({ val, label }: { val: number; label: string }) => (
    <div className={`flex flex-col items-center gap-0.5 p-1 rounded-lg ${val ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400 opacity-50'}`}>
      <span className="material-symbols-rounded text-[16px]">
        {val ? 'check_circle' : 'cancel'}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-emerald-600 text-[22px]" style={ICO_FILL}>
              group_work
            </span>
            User Groups & Access
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Define organizational groups and their standard access policies.
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Assignments", value: stats?.total ?? 0, icon: "groups", color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Active Members", value: stats?.users_with_groups ?? 0, icon: "person_celebrate", color: "text-blue-600", bg: "bg-blue-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`${s.bg} ${s.color} p-2 rounded-xl`}>
              <span className="material-symbols-rounded text-[18px]" style={ICO_FILL}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800 leading-tight">{(s.value).toLocaleString()}</p>
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
              placeholder="Search by group or user..."
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

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10 text-center">#</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Group / User</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Scope</th>
                <th className="text-center px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-80">Default Actions</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {groups.map((g, idx) => (
                <tr key={g.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 text-center text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-800 underline decoration-slate-200 underline-offset-4">{g.name || "Untitled Group"}</p>
                    <p className="text-xs text-slate-500 mt-1 italic">
                      User: {g.user_name} {g.user_lastname}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-mono text-xs border border-blue-100">
                      {g.table_name || "global"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-center gap-2">
                       <RenderFlag val={g.create_action} label="Create" />
                       <RenderFlag val={g.show_action} label="View" />
                       <RenderFlag val={g.edit_action} label="Edit" />
                       <RenderFlag val={g.update_action} label="Update" />
                       <RenderFlag val={g.delete_action} label="Delete" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-400">
                       <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors hover:text-emerald-600">
                         <span className="material-symbols-rounded text-[18px]">edit</span>
                       </button>
                       <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors hover:text-red-600">
                         <span className="material-symbols-rounded text-[18px]">delete</span>
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
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
    </div>
  );
}
