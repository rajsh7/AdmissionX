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
    console.error("[admin/members/users safeQuery]", err);
    return [];
  }
}

interface UserRow extends RowDataPacket {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  status_name: string;
  type_of_user: string;
  created_at: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

interface StatsRow extends RowDataPacket {
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

  const [users, countRows, statsRows] = await Promise.all([
    safeQuery<UserRow>(
      `SELECT u.id, u.firstname, u.lastname, u.email, u.phone, u.type_of_user, u.created_at, us.name as status_name
       FROM users u
       LEFT JOIN userstatus us ON u.userstatus_id = us.id
       ${where}
       ORDER BY ${sortSql}
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset]
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM users u ${where}`,
      params
    ),
    safeQuery<StatsRow>(`
      SELECT 
        COUNT(*) AS total,
        SUM(userstatus_id = 1) AS active,
        SUM(userstatus_id != 1) AS inactive,
        SUM(created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS new_last_7d
      FROM users
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
    return `/admin/members/users${qs ? `?${qs}` : ""}`;
  }

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
  const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-emerald-600 text-[22px]" style={ICO_FILL}>
              groups
            </span>
            Platform Users
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage and search all registered platform user accounts.
          </p>
        </div>
      </div>

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

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-100 mb-4 block" style={ICO_FILL}>groups</span>
            <p className="text-slate-500 font-medium">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10 text-center">#</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Type</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Joined</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 text-center text-xs text-slate-400 font-mono">
                      {offset + idx + 1}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase text-center align-middle">
                          {(user.firstname || "U")[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{user.firstname} {user.lastname}</p>
                          <p className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-1 rounded inline-block mt-0.5">ID: #{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-slate-700">{user.email}</p>
                      <p className="text-[11px] text-slate-400">{user.phone || "No phone"}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-tighter">
                        {user.type_of_user || "Member"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${user.status_name === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        <span className={`text-xs font-medium ${user.status_name === 'Active' ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {user.status_name || 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs hidden sm:table-cell">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                         <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors">
                           <span className="material-symbols-rounded text-[18px]">edit</span>
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
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
    </div>
  );
}
