import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";
import { revalidatePath } from "next/cache";
import ApplicationsListClient from "./ApplicationsListClient";

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
  applicationRef: string | null;
  student_name: string | null;
  student_email: string | null;
  student_phone: string | null;
  college_name: string | null;
  college_slug: string | null;
  course_name: string | null;
  degree_name: string | null;
  status: string;
  createdAt: string;
}

interface CountRow extends RowDataPacket { total: number; }
interface CollegeFilterRow extends RowDataPacket { slug: string; college_name: string | null; }

// ─── Status badge config ──────────────────────────────────────────────────────

const STATUS_TABS = [
  { value: "all",          label: "All"          },
  { value: "submitted",    label: "Submitted"    },
  { value: "under_review", label: "Under Review" },
  { value: "verified",     label: "Verified"     },
  { value: "rejected",     label: "Rejected"     },
  { value: "enrolled",     label: "Enrolled"     },
];

const STATUS_STYLE: Record<string, { cls: string; dot: string }> = {
  approved:     { cls: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-500" },
  pending:      { cls: "bg-amber-50 text-amber-700 border-amber-100",  dot: "bg-amber-500"   },
  submitted:    { cls: "bg-blue-50 text-blue-700 border-blue-100",    dot: "bg-blue-500"    },
  rejected:     { cls: "bg-red-50 text-red-700 border-red-100",      dot: "bg-red-500"     },
  cancelled:    { cls: "bg-slate-50 text-slate-600 border-slate-100",  dot: "bg-slate-400"   },
  default:      { cls: "bg-slate-50 text-slate-600 border-slate-100",  dot: "bg-slate-400"   },
};

function getStatusStyle(name: string | null) {
  const key = (name ?? "").toLowerCase().trim();
  return STATUS_STYLE[key] ?? STATUS_STYLE.default;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string; college?: string }>;
}) {
  const sp           = await searchParams;
  const q            = (sp.q ?? "").trim();
  const page         = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const statusFilter = sp.status ?? "all";
  const collegeFilter = sp.college ?? "";
  const offset       = (page - 1) * PAGE_SIZE;

  // ── Build WHERE conditions ─────────────────────────────────────────────────
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push(
      `(a.applicationID LIKE ?
        OR a.firstname    LIKE ?
        OR a.lastname     LIKE ?
        OR a.email        LIKE ?
        OR co.name        LIKE ?)`,
    );
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }

  if (statusFilter !== "all" && statusFilter !== "submitted") {
    const statusMap: Record<string, number> = { verified: 1, under_review: 2, rejected: 3 };
    if (statusMap[statusFilter]) {
      conditions.push("a.applicationstatus_id = ?");
      params.push(statusMap[statusFilter]);
    }
  } else if (statusFilter === "submitted") {
     conditions.push("(a.applicationstatus_id = 2 OR a.applicationstatus_id IS NULL)");
  }

  if (collegeFilter) {
    conditions.push("cp.slug = ?");
    params.push(collegeFilter);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const JOINS = `
    LEFT JOIN collegeprofile cp ON cp.id = a.collegeprofile_id
    LEFT JOIN users          u  ON u.id  = cp.users_id
    LEFT JOIN collegemaster  cm ON cm.id = a.collegemaster_id
    LEFT JOIN course         co ON co.id = cm.course_id
    LEFT JOIN degree         d  ON d.id  = cm.degree_id
    LEFT JOIN applicationstatus ast ON ast.id = a.applicationstatus_id
  `;

  // ── Parallel queries ───────────────────────────────────────────────────────
  const [appRows, countRows, statusCounts, totalAll, colleges] = await Promise.all([
    safeQuery<AppRow>(
      `SELECT
         a.id,
         a.applicationID AS applicationRef,
         CONCAT(COALESCE(a.firstname, ''), ' ', COALESCE(a.lastname, '')) AS student_name,
         a.email         AS student_email,
         a.phone         AS student_phone,
         COALESCE(NULLIF(TRIM(u.firstname), ''), cp.slug) AS college_name,
         cp.slug         AS college_slug,
         co.name         AS course_name,
         d.name          AS degree_name,
         COALESCE(ast.name, 'Submitted') AS status,
         a.created_at    AS createdAt
       FROM application a
       ${JOINS}
       ${where}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM application a ${JOINS} ${where}`,
      params,
    ),
    safeQuery<CountRow & { status: string }>(
      `SELECT COALESCE(ast.name, 'Submitted') as status, COUNT(*) AS total 
       FROM application a
       LEFT JOIN applicationstatus ast ON ast.id = a.applicationstatus_id
       GROUP BY a.applicationstatus_id`,
    ),
    safeQuery<CountRow>(`SELECT COUNT(*) AS total FROM application`),
    safeQuery<CollegeFilterRow>(
      `SELECT cp.slug,
              COALESCE(NULLIF(TRIM(u.firstname), ''), cp.slug) AS college_name
       FROM collegeprofile cp
       LEFT JOIN users u ON u.id = cp.users_id
       ORDER BY college_name ASC`,
    ),
  ]);

  const total      = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const grandTotal = Number(totalAll[0]?.total ?? 0);

  const statusCountMap: Record<string, number> = {};
  for (const row of statusCounts) {
    const r = row as { status: string; total: number };
    const s = r.status.toLowerCase().replace(" ", "_");
    statusCountMap[s] = Number(r.total ?? 0);
  }

  // ── URL builder ────────────────────────────────────────────────────────────
  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: String(page), status: statusFilter, college: collegeFilter, ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== "" && v !== "1" && v !== "all")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/applications${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-teal-600 text-[22px]" style={ICO_FILL}>
              description
            </span>
            Applications Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Managing {grandTotal.toLocaleString()} total entries across all institutions.
          </p>
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {STATUS_TABS.map((tab) => {
          const val = tab.value === "all" ? grandTotal : (statusCountMap[tab.value] ?? 0);
          const isActive = statusFilter === tab.value;

          return (
            <Link
              key={tab.value}
              href={buildUrl({ status: tab.value, page: 1 })}
              className={`bg-white rounded-2xl border p-5 flex flex-col gap-3 transition-all hover:shadow-md group ${
                isActive ? "border-teal-500 ring-2 ring-teal-50" : "border-slate-100 shadow-sm"
              }`}
            >
              <div className={`p-2.5 rounded-xl w-fit ${isActive ? "bg-teal-50 text-teal-600" : "bg-slate-50 text-slate-400 group-hover:text-slate-600"} transition-colors`}>
                <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>
                  {tab.value === "all" ? "dashboard_customize" : tab.value === "rejected" ? "block" : tab.value === "verified" ? "verified" : "pending_actions"}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 leading-tight">
                  {val.toLocaleString()}
                </p>
                <p className="text-xs font-semibold text-slate-500 truncate">{tab.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Filter & Search Bar ────────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center">
        
        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-shrink-0 overflow-x-auto no-scrollbar">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={buildUrl({ status: tab.value, page: 1 })}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                statusFilter === tab.value
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-[10px] font-bold opacity-60">
                ({tab.value === "all" ? grandTotal : (statusCountMap[tab.value] ?? 0)})
              </span>
            </Link>
          ))}
        </div>

        {/* Search & Institution form */}
        <form method="GET" action="/admin/applications" className="flex-1 flex flex-wrap sm:flex-nowrap gap-2 w-full">
          {statusFilter !== "all" && <input type="hidden" name="status" value={statusFilter} />}
          
          <div className="relative w-full sm:w-60">
            <select
              name="college"
              defaultValue={collegeFilter}
              className="w-full appearance-none pl-4 pr-10 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all cursor-pointer"
            >
              <option value="">All Institutions</option>
              {colleges.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.college_name ?? c.slug}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>
              expand_more
            </span>
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400" style={ICO}>
              search
            </span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by student, ID or course..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all bg-slate-50"
            />
          </div>

          <button type="submit" className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-95">
            Search
          </button>
          
          {(q || collegeFilter) && (
            <Link href={buildUrl({ q: "", college: "", page: 1 })} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-xl transition-all text-center">
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* ── Applications Table ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        {appRows.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <span className="material-symbols-rounded text-3xl text-slate-300" style={ICO_FILL}>
                folder_open
              </span>
            </div>
            <h3 className="text-slate-800 font-bold text-lg">
              No matching applications
            </h3>
            <p className="text-slate-400 text-sm mt-1 max-w-[280px] mx-auto font-medium">
              We couldn't find any records matching your current filter criteria.
            </p>
            {(q || statusFilter !== "all" || collegeFilter) && (
              <Link href="/admin/applications" className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-teal-50 text-teal-700 text-xs font-bold rounded-xl hover:bg-teal-100 transition-all active:scale-95">
                Reset Filters
              </Link>
            )}
          </div>
        ) : (
          <>
            <ApplicationsListClient initialRows={appRows} offset={offset} />
            
            {/* ── Pagination ─────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 border-t border-slate-50 bg-slate-50/50">
              <p className="text-xs text-slate-500 font-semibold">
                Showing <span className="text-slate-900">{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</span> of <span className="text-slate-900">{total.toLocaleString()}</span> entries
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  {page > 1 && (
                    <Link href={buildUrl({ page: page - 1 })} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all text-slate-600 shadow-sm">
                      <span className="material-symbols-rounded text-[18px]" style={ICO}>chevron_left</span>
                    </Link>
                  )}
                  
                  <div className="flex items-center gap-1 px-1 py-1 bg-white border border-slate-200 rounded-xl shadow-sm">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let p = 1;
                      if (totalPages <= 5) p = i + 1;
                      else if (page <= 3) p = i + 1;
                      else if (page >= totalPages - 2) p = totalPages - 4 + i;
                      else p = page - 2 + i;

                      return (
                        <Link
                          key={p}
                          href={buildUrl({ page: p })}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                            p === page 
                              ? "bg-teal-600 text-white shadow-sm" 
                              : "text-slate-500 hover:bg-slate-50 hover:text-teal-600"
                          }`}
                        >
                          {p}
                        </Link>
                      );
                    })}
                  </div>

                  {page < totalPages && (
                    <Link href={buildUrl({ page: page + 1 })} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all text-slate-600 shadow-sm">
                      <span className="material-symbols-rounded text-[18px]" style={ICO}>chevron_right</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Footer Notice ────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 bg-slate-100/50 border border-slate-200/50 rounded-2xl px-6 py-5 text-xs text-slate-500">
        <span className="material-symbols-rounded text-slate-400 text-[20px]" style={ICO_FILL}>
          info
        </span>
        <div className="space-y-1">
          <p className="font-bold text-slate-700">System Information</p>
          <p className="leading-relaxed font-semibold">
            Application statuses are managed directly by individual institutions. 
            Administrators can monitor progress and view details, but cannot modify application states from this dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
