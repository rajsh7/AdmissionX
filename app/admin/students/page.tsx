import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import StudentsTableClient from "./StudentsTableClient";

async function toggleStudentAction(formData: FormData): Promise<void> {
  "use server";
  const id  = parseInt(formData.get("id")  as string, 10);
  const cur = parseInt(formData.get("cur") as string, 10);
  if (isNaN(id)) return;
  try {
    await pool.query("UPDATE next_student_signups SET is_active = ? WHERE id = ?", [cur ? 0 : 1, id]);
  } catch (e) {
    console.error("[admin/students toggleStudent]", e);
  }
  revalidatePath("/admin/students");
}

const PAGE_SIZE = 25;

async function safeQuery<T>(sql: string, params: (string | number)[] = []): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/students safeQuery]", err);
    return [];
  }
}

interface StudentRow  { id: number; name: string; email: string; phone: string | null; is_active: number; created_at: string; }
interface CountRow    { total: number; }
interface StatsRow    { total: number; today: number; this_week: number; this_month: number; }

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const q      = (sp.q ?? "").trim();
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const sort   = (sp.sort ?? "newest") as "newest" | "oldest" | "name";
  const filter = sp.filter ?? "all";
  const offset = (page - 1) * PAGE_SIZE;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(name LIKE ? OR email LIKE ? OR phone LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (filter === "active")   conditions.push("is_active = 1");
  if (filter === "inactive") conditions.push("is_active = 0");

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderMap: Record<string, string> = { newest: "created_at DESC", oldest: "created_at ASC", name: "name ASC" };
  const orderBy = orderMap[sort] ?? "created_at DESC";

  const [rawStudents, countRows, statsRows, activeRow, inactiveRow] = await Promise.all([
    safeQuery<any>(
      `SELECT id, name, email, phone, is_active, created_at FROM next_student_signups ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(`SELECT COUNT(*) AS total FROM next_student_signups ${where}`, params),
    safeQuery<any>(`SELECT COUNT(*) AS total, SUM(created_at >= CURDATE()) AS today, SUM(created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS this_week, SUM(created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS this_month FROM next_student_signups`),
    safeQuery<CountRow>("SELECT COUNT(*) AS total FROM next_student_signups WHERE is_active = 1"),
    safeQuery<CountRow>("SELECT COUNT(*) AS total FROM next_student_signups WHERE is_active = 0"),
  ]);

  const total      = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const stats = {
    total:      Number(statsRows[0]?.total      ?? 0),
    today:      Number(statsRows[0]?.today      ?? 0),
    this_week:  Number(statsRows[0]?.this_week  ?? 0),
    this_month: Number(statsRows[0]?.this_month ?? 0),
  };

  // Serialize MySQL RowDataPacket → plain objects (created_at is a Date object in MySQL2)
  const students: StudentRow[] = rawStudents.map((s: any) => ({
    id:         Number(s.id),
    name:       String(s.name       ?? ""),
    email:      String(s.email      ?? ""),
    phone:      s.phone != null ? String(s.phone) : null,
    is_active:  Number(s.is_active  ?? 0),
    created_at: s.created_at instanceof Date ? s.created_at.toISOString() : String(s.created_at ?? ""),
  }));

  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: "1", sort, filter, ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => String(v) !== "" && String(v) !== "1" && String(v) !== "newest" && String(v) !== "all")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/students${qs ? `?${qs}` : ""}`;
  }

  const FILTER_TABS = [
    { value: "all",      label: "All Students", count: Number(statsRows[0]?.total      ?? 0) },
    { value: "active",   label: "Active",        count: Number(activeRow[0]?.total      ?? 0) },
    { value: "inactive", label: "Inactive",      count: Number(inactiveRow[0]?.total    ?? 0) },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-emerald-600 text-[22px]" style={ICO_FILL}>school</span>
            Student Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">All registered student accounts on the platform.</p>
        </div>
        <button disabled title="Export coming soon"
          className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-slate-400 cursor-not-allowed px-4 py-2 rounded-xl border border-dashed border-slate-200"
        >
          <span className="material-symbols-rounded text-[16px]" style={ICO}>download</span>
          Export CSV
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: stats.total.toLocaleString(),      icon: "group",          color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Joined Today",   value: stats.today.toLocaleString(),      icon: "today",          color: "text-blue-600",    bg: "bg-blue-50"    },
          { label: "Last 7 Days",    value: stats.this_week.toLocaleString(),  icon: "date_range",     color: "text-violet-600",  bg: "bg-violet-50"  },
          { label: "Last 30 Days",   value: stats.this_month.toLocaleString(), icon: "calendar_month", color: "text-amber-600",   bg: "bg-amber-50"   },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`${s.bg} ${s.color} p-2.5 rounded-xl flex-shrink-0`}>
              <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>{s.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-slate-800 leading-tight">{s.value}</p>
              <p className="text-xs font-semibold text-slate-500 truncate">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-shrink-0">
          {FILTER_TABS.map((tab) => (
            <Link key={tab.value} href={buildUrl({ filter: tab.value, page: 1 })}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === tab.value ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {tab.label}
              <span className="ml-1.5 text-[10px] font-bold opacity-60">({tab.count})</span>
            </Link>
          ))}
        </div>

        <form method="GET" action="/admin/students" className="flex-1 flex gap-2">
          {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
          {filter !== "all"  && <input type="hidden" name="filter" value={filter} />}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px] pointer-events-none" style={ICO}>search</span>
            <input name="q" defaultValue={q} placeholder="Search by name, email, or phone…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all bg-slate-50"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors flex-shrink-0">Search</button>
          {q && (
            <Link href={buildUrl({ q: "" })} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-xl transition-colors flex-shrink-0">Clear</Link>
          )}
        </form>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-semibold text-slate-400 hidden sm:block">Sort:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {([ { value: "newest", label: "Newest" }, { value: "oldest", label: "Oldest" }, { value: "name", label: "A–Z" } ] as const).map((opt) => (
              <Link key={opt.value} href={buildUrl({ sort: opt.value, page: 1 })}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${sort === opt.value ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {students.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-200 mb-4 block" style={ICO_FILL}>school</span>
            <p className="text-slate-500 font-semibold text-sm">
              {q ? `No students found matching "${q}"` : "No student accounts yet."}
            </p>
            {q && <Link href="/admin/students" className="mt-3 inline-block text-sm text-emerald-600 hover:underline">Clear search</Link>}
          </div>
        ) : (
          <StudentsTableClient
            students={students}
            total={total}
            page={page}
            totalPages={totalPages}
            offset={offset}
            PAGE_SIZE={PAGE_SIZE}
          />
        )}
      </div>

      <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
        <span className="material-symbols-rounded text-[13px]" style={ICO}>shield</span>
        Phone numbers are partially obfuscated for display. Full data available in DB.
      </p>
    </div>
  );
}
