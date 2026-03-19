import pool from "@/lib/db";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { RowDataPacket } from "mysql2";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function updateApplicationStatus(formData: FormData): Promise<void> {
  "use server";
  const id       = parseInt(formData.get("id")     as string, 10);
  const statusId = parseInt(formData.get("status") as string, 10);
  if (!id || !statusId) return;
  try {
    await pool.query(
      "UPDATE application SET applicationstatus_id = ? WHERE id = ?",
      [statusId, id],
    );
  } catch (e) {
    console.error("[admin/applications updateStatus]", e);
  }
  revalidatePath("/admin/applications");
  revalidatePath("/", "layout");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/applications safeQuery]", err);
    return [];
  }
}


// ─── Types ────────────────────────────────────────────────────────────────────

interface AppRow extends RowDataPacket {
  id: number;
  applicationID: string | null;
  firstname: string | null;
  middlename: string | null;
  lastname: string | null;
  email: string | null;
  phone: string | null;
  gender: string | null;
  applicationstatus_id: number | null;
  status_name: string | null;
  college_name: string | null;
  college_slug: string | null;
  created_at: string;
}

interface StatusRow extends RowDataPacket {
  id: number;
  name: string;
}

interface CountRow extends RowDataPacket {
  total: number;
  status_id: number | null;
}

// ─── Status badge config ──────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { cls: string; dot: string }> = {
  submitted:  { cls: "bg-blue-100 text-blue-700",    dot: "bg-blue-500"    },
  reviewing:  { cls: "bg-amber-100 text-amber-700",  dot: "bg-amber-500"   },
  accepted:   { cls: "bg-green-100 text-green-700",  dot: "bg-green-500"   },
  rejected:   { cls: "bg-red-100 text-red-700",      dot: "bg-red-500"     },
  waitlisted: { cls: "bg-violet-100 text-violet-700",dot: "bg-violet-500"  },
  default:    { cls: "bg-slate-100 text-slate-600",  dot: "bg-slate-400"   },
};

function getStatusStyle(name: string | null) {
  const key = (name ?? "").toLowerCase().trim();
  return STATUS_STYLE[key] ?? STATUS_STYLE.default;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  const sp           = await searchParams;
  const q            = (sp.q ?? "").trim();
  const page         = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const statusFilter = sp.status ?? "all";
  const offset       = (page - 1) * PAGE_SIZE;

  // ── Load all statuses for the dropdown & filter tabs ──────────────────────
  const allStatuses = await safeQuery<StatusRow>(
    "SELECT id, name FROM applicationstatus ORDER BY id ASC",
  );

  // ── Build WHERE conditions ─────────────────────────────────────────────────
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push(
      "(a.applicationID LIKE ? OR a.firstname LIKE ? OR a.lastname LIKE ? OR a.email LIKE ?)",
    );
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }

  if (statusFilter !== "all") {
    const matchedStatus = allStatuses.find(
      (s) => s.name.toLowerCase() === statusFilter.toLowerCase() ||
             String(s.id) === statusFilter,
    );
    if (matchedStatus) {
      conditions.push("a.applicationstatus_id = ?");
      params.push(matchedStatus.id);
    }
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Parallel queries ───────────────────────────────────────────────────────
  const [appRows, countRows, statusCounts, totalAll] = await Promise.all([
    safeQuery<AppRow>(
      `SELECT
         a.id,
         a.applicationID,
         a.firstname,
         a.middlename,
         a.lastname,
         a.email,
         a.phone,
         a.gender,
         a.applicationstatus_id,
         st.name     AS status_name,
         cp.slug     AS college_slug,
         ncs.college_name
       FROM application a
       LEFT JOIN applicationstatus st ON st.id = a.applicationstatus_id
       LEFT JOIN collegeprofile    cp ON cp.id = a.collegeprofile_id
       LEFT JOIN next_college_signups ncs ON ncs.email = (
         SELECT u.email FROM users u WHERE u.id = cp.users_id LIMIT 1
       )
       ${where}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total
       FROM application a
       LEFT JOIN applicationstatus st ON st.id = a.applicationstatus_id
       ${where}`,
      params,
    ),
    safeQuery<CountRow>(
      `SELECT applicationstatus_id AS status_id, COUNT(*) AS total
       FROM application
       GROUP BY applicationstatus_id`,
    ),
    safeQuery<CountRow>("SELECT COUNT(*) AS total FROM application"),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const grandTotal = totalAll[0]?.total ?? 0;

  // Build status→count map
  const statusCountMap = new Map<number | null, number>();
  for (const row of statusCounts) {
    statusCountMap.set(row.status_id, row.total);
  }

  // ── URL builder ────────────────────────────────────────────────────────────
  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: String(page), status: statusFilter, ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== "" && v !== "1" && v !== "all")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/applications${qs ? `?${qs}` : ""}`;
  }

  // ── Status tabs ────────────────────────────────────────────────────────────
  const statusTabs = [
    { label: "All", value: "all", count: grandTotal },
    ...allStatuses.map((s) => ({
      label: s.name,
      value: s.name.toLowerCase(),
      count: statusCountMap.get(s.id) ?? 0,
    })),
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span
              className="material-symbols-rounded text-red-600 text-[22px]"
              style={ICO_FILL}
            >
              description
            </span>
            Applications
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Review and manage all admission applications across colleges.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            {grandTotal.toLocaleString()} total
          </span>
        </div>
      </div>

      {/* ── Mini stat cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statusTabs.slice(0, 5).map((tab) => {
          const style =
            tab.value === "all"
              ? { cls: "bg-slate-100 text-slate-600", dot: "bg-slate-400" }
              : getStatusStyle(tab.label);
          return (
            <Link
              key={tab.value}
              href={buildUrl({ status: tab.value, page: 1 })}
              className={`bg-white rounded-xl border p-4 flex items-center gap-3 hover:shadow-md transition-all ${
                statusFilter === tab.value
                  ? "border-red-200 ring-2 ring-red-100"
                  : "border-slate-100"
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${style.dot}`} />
              <div className="min-w-0">
                <p className="text-xl font-bold text-slate-800 leading-none">
                  {tab.count.toLocaleString()}
                </p>
                <p className="text-[11px] font-semibold text-slate-500 truncate mt-0.5">
                  {tab.label}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Filter bar ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">

        {/* Search */}
        <form method="GET" action="/admin/applications" className="flex-1 flex gap-2">
          {statusFilter !== "all" && (
            <input type="hidden" name="status" value={statusFilter} />
          )}
          <div className="relative flex-1">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none"
              style={ICO}
            >
              search
            </span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by name, email, or App ID…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors flex-shrink-0"
          >
            Search
          </button>
          {q && (
            <Link
              href={buildUrl({ q: "", page: 1 })}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-xl transition-colors flex-shrink-0"
            >
              Clear
            </Link>
          )}
        </form>

        {/* Status filter dropdown — all tabs */}
        <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0">
          {statusTabs.map((tab) => (
            <Link
              key={tab.value}
              href={buildUrl({ status: tab.value, page: 1 })}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
                statusFilter === tab.value
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 text-[10px] font-bold inline-block align-middle ${
                  statusFilter === tab.value ? "text-white/80" : "text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Applications table ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {appRows.length === 0 ? (
          <div className="py-24 text-center">
            <span
              className="material-symbols-rounded text-6xl text-slate-200 block mb-4"
              style={ICO_FILL}
            >
              description
            </span>
            <p className="text-slate-500 font-semibold text-sm">
              {q
                ? `No applications found for "${q}"`
                : statusFilter !== "all"
                ? `No ${statusFilter} applications yet.`
                : "No applications yet."}
            </p>
            {(q || statusFilter !== "all") && (
              <Link
                href="/admin/applications"
                className="mt-3 inline-block text-xs text-red-600 hover:underline"
              >
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <div key="results-container">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">App ID</th>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">College</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-left hidden sm:table-cell">Date</th>
                    <th className="px-4 py-3 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {appRows.map((app, idx) => {
                    const fullName =
                      [app.firstname, app.middlename, app.lastname]
                        .filter(Boolean)
                        .join(" ") || app.email || "—";
                    const appIdDisplay = app.applicationID ?? `ADX-${String(app.id).padStart(6, "0")}`;
                    const statusStyle = getStatusStyle(app.status_name);

                    return (
                      <tr
                        key={app.id}
                        className="hover:bg-slate-50/60 transition-colors group"
                      >
                        {/* Row */}
                        <td className="px-5 py-4 text-xs text-slate-400 font-mono">
                          {offset + idx + 1}
                        </td>

                        {/* App ID */}
                        <td className="px-4 py-4">
                          <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg whitespace-nowrap">
                            {appIdDisplay}
                          </span>
                        </td>

                        {/* Student */}
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-800 leading-tight truncate max-w-[180px]">
                            {fullName}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[180px] mt-0.5">
                            {app.email ?? "—"}
                          </p>
                          {app.phone && (
                            <p className="text-[11px] text-slate-400">{app.phone}</p>
                          )}
                        </td>

                        {/* College */}
                        <td className="px-4 py-4 hidden md:table-cell">
                          {app.college_name ? (
                            <div>
                              <p className="text-xs font-semibold text-slate-700 truncate max-w-[160px]">
                                {app.college_name}
                              </p>
                              {app.college_slug && (
                                <Link
                                  href={`/college/${app.college_slug}`}
                                  target="_blank"
                                  className="text-[10px] text-blue-500 hover:underline font-mono"
                                >
                                  view profile →
                                </Link>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 italic">Unknown</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${statusStyle.cls}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                            {app.status_name ?? "Unknown"}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {formatDate(app.created_at)}
                          </span>
                        </td>

                        {/* Update status form */}
                        <td className="px-4 py-4 text-right">
                          <form action={updateApplicationStatus} className="flex items-center justify-end gap-1.5">
                            <input type="hidden" name="id" value={app.id} />
                            <select
                              name="status"
                              defaultValue={app.applicationstatus_id ?? ""}
                              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition cursor-pointer"
                            >
                              <option value="" disabled>
                                — Pick status —
                              </option>
                              {allStatuses.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              className="text-xs font-semibold px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors whitespace-nowrap"
                            >
                              Update
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ─────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <strong className="text-slate-700">
                  {offset + 1}–{Math.min(offset + PAGE_SIZE, total)}
                </strong>{" "}
                of <strong className="text-slate-700">{total.toLocaleString()}</strong>{" "}
                application{total !== 1 ? "s" : ""}
                {statusFilter !== "all" && (
                  <span className="text-slate-400"> (filtered)</span>
                )}
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  {/* Prev */}
                  {page > 1 && (
                    <Link
                      href={buildUrl({ page: page - 1 })}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      ← Prev
                    </Link>
                  )}

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 3, totalPages - 6));
                    const p = start + i;
                    if (p > totalPages) return null;
                    return (
                      <Link
                        key={p}
                        href={buildUrl({ page: p })}
                        className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                          p === page
                            ? "bg-red-600 text-white shadow-sm"
                            : "text-slate-500 bg-white border border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}

                  {/* Next */}
                  {page < totalPages && (
                    <Link
                      href={buildUrl({ page: page + 1 })}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Next →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
