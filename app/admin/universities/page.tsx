import pool from "@/lib/db";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { saveUpload } from "@/lib/upload-utils";
import Link from "next/link";
import UniversityListClient from "./UniversityListClient";

async function updateUniversityImages(formData: FormData) {
  "use server";
  try {
    const id         = formData.get("id") as string;
    const bannerFile = formData.get("bannerimage_file") as File;
    const logoFile   = formData.get("logoimage_file") as File;
    let bannerimage  = formData.get("bannerimage_existing") as string || "";
    let logoimage    = formData.get("logoimage_existing") as string || "";
    if (bannerFile && bannerFile.size > 0)
      bannerimage = await saveUpload(bannerFile, `college/${id}`, "banner");
    if (logoFile && logoFile.size > 0)
      logoimage = await saveUpload(logoFile, `college/${id}`, "logo");
    const db = await getDb();
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: parseInt(id, 10) };
    await db.collection("collegeprofile").updateOne(filter, {
      $set: { bannerimage, logoimage, updated_at: new Date() },
    });
  } catch (e) {
    console.error("[admin/universities updateImages]", e);
  }
  revalidatePath("/admin/universities");
  revalidatePath("/", "layout");
}
// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;
const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

async function safeQuery<T >(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/universities safeQuery]", err);
    return [];
  }
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return "—"; }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface UniversityRow  {
  id: number;
  slug: string | null;
  college_name: string | null;
  verified: number;
  isTopUniversity: number;
  topUniversityRank: string | null;
  universityType: string | null;
  ranking: string | null;
  rating: string | null;
  totalStudent: string | null;
  estyear: string | null;
  city_name: string | null;
  payment_status: string | null;
  bannerimage: string | null;
  logoimage: string | null;
  created_at: string;
}

interface CountRow  {
  total?: number;
  verified_count?: number;
  paid_count?: number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminUniversitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp       = await searchParams;
  const q        = (sp.q ?? "").trim();
  const page     = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const verified = sp.verified ?? "all"; // all | yes | no
  const offset   = (page - 1) * PAGE_SIZE;

  // ── Build WHERE ────────────────────────────────────────────────────────────
  const conditions: string[] = ["cp.isTopUniversity = 1"];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(ncs.college_name LIKE ? OR cp.slug LIKE ? OR cp.universityType LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (verified === "yes") { conditions.push("cp.verified = 1"); }
  if (verified === "no")  { conditions.push("(cp.verified = 0 OR cp.verified IS NULL)"); }

  const where = `WHERE ${conditions.join(" AND ")}`;

  // ── Parallel queries ───────────────────────────────────────────────────────
  const [rows, countRows, statsRows] = await Promise.all([
    safeQuery<UniversityRow>(
      `SELECT
         cp.id,
         cp.slug,
         COALESCE(ncs.college_name, cp.slug) AS college_name,
         cp.verified,
         cp.isTopUniversity,
         cp.topUniversityRank,
         cp.universityType,
         cp.ranking,
         cp.rating,
         cp.totalStudent,
         cp.estyear,
         cp.bannerimage,
         cp.logoimage,
         cp.payment_status,
         c.name AS city_name,
         cp.created_at
       FROM collegeprofile cp
       LEFT JOIN users u ON u.id = cp.users_id
       LEFT JOIN next_college_signups ncs ON LOWER(ncs.email) = LOWER(u.email)
       LEFT JOIN city c ON c.id = cp.registeredAddressCityId
       ${where}
       ORDER BY
         COALESCE(cp.topUniversityRank + 0, 9999) ASC,
         cp.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total
       FROM collegeprofile cp
       LEFT JOIN users u ON u.id = cp.users_id
       LEFT JOIN next_college_signups ncs ON LOWER(ncs.email) = LOWER(u.email)
       ${where}`,
      params,
    ),
    safeQuery<CountRow>(
      `SELECT
         COUNT(*) AS total,
         SUM(cp.verified = 1) AS verified_count,
         SUM(cp.payment_status = 'active' OR cp.payment_status = 'paid') AS paid_count
       FROM collegeprofile cp
       WHERE cp.isTopUniversity = 1`,
    ),
  ]);

  const total       = Number(countRows[0]?.total ?? 0);
  const totalPages  = Math.ceil(total / PAGE_SIZE);
  const sRaw        = statsRows[0] || { total: 0, verified_count: 0, paid_count: 0 };
  const statsTotal  = {
    total: Number(sRaw.total ?? 0),
    verified_count: Number(sRaw.verified_count ?? 0),
    paid_count: Number(sRaw.paid_count ?? 0)
  };

  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: "1", verified, ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== "" && v !== "1" && v !== "all")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/universities${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-indigo-600 text-[22px]" style={ICO_FILL}>
              account_balance
            </span>
            Universities
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Colleges flagged as top universities (
            <code className="text-xs bg-slate-100 px-1 rounded">isTopUniversity = 1</code>
            ).
          </p>
        </div>
        <Link
          href="/top-university"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-colors flex-shrink-0"
        >
          <span className="material-symbols-rounded text-[16px]" style={ICO}>open_in_new</span>
          View Public Page
        </Link>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Universities", value: statsTotal.total,          icon: "account_balance", color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Verified",           value: statsTotal.verified_count, icon: "verified",        color: "text-green-600",  bg: "bg-green-50"  },
          { label: "Active Subscription",value: statsTotal.paid_count,     icon: "workspace_premium",color: "text-amber-600", bg: "bg-amber-50"  },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`${s.bg} ${s.color} p-2.5 rounded-xl flex-shrink-0`}>
              <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>{s.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{s.value.toLocaleString()}</p>
              <p className="text-xs font-semibold text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search + verified filter ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">

        {/* Search */}
        <form method="GET" action="/admin/universities" className="flex-1 flex gap-2 max-w-md">
          {verified !== "all" && <input type="hidden" name="verified" value={verified} />}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>
              search
            </span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by name, slug, type…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors flex-shrink-0">
            Search
          </button>
          {q && (
            <Link href={buildUrl({ q: "" })} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-xl transition-colors flex-shrink-0">
              Clear
            </Link>
          )}
        </form>

        {/* Verified filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-shrink-0">
          {([
            { value: "all", label: "All"        },
            { value: "yes", label: "Verified"   },
            { value: "no",  label: "Unverified" },
          ] as const).map((opt) => (
            <Link
              key={opt.value}
              href={buildUrl({ verified: opt.value, page: 1 })}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                verified === opt.value
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>account_balance</span>
            <p className="text-slate-500 font-semibold text-sm">
              {q ? `No universities matching "${q}"` : "No universities found."}
            </p>
            {(q || verified !== "all") && (
              <Link href="/admin/universities" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <>
            <UniversityListClient rows={rows} offset={offset} updateImages={updateUniversityImages} />

            {/* ── Pagination ──────────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <strong className="text-slate-700">{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong>{" "}
                  of <strong className="text-slate-700">{total}</strong> universities
                </p>
                <div className="flex items-center gap-1">
                  {page > 1 && (
                    <Link href={buildUrl({ page: page - 1 })} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      ← Prev
                    </Link>
                  )}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                    const p = start + i;
                    if (p > totalPages) return null;
                    return (
                      <Link
                        key={p}
                        href={buildUrl({ page: p })}
                        className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                          p === page
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-500 bg-white border border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                  {page < totalPages && (
                    <Link href={buildUrl({ page: page + 1 })} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      Next →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Footer note ───────────────────────────────────────────────────── */}
      <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
        <span className="material-symbols-rounded text-[13px]" style={ICO}>info</span>
        Universities are colleges with <code className="bg-slate-100 px-1 rounded">isTopUniversity = 1</code> in the collegeprofile table.
        Full profile management is available in the{" "}
        <Link href="/admin/colleges" className="text-indigo-500 hover:underline">Colleges</Link> section.
      </p>
    </div>
  );
}




