import pool from "@/lib/db";
import Link from "next/link";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

// --- Server Actions -----------------------------------------------------------

async function deleteMediaRecord(id: number) {
  "use server";
  try {
    // This is a placeholder action. In a real scenario, you might delete from a specific media table.
    // For now, we'll just revalidate.
    console.log("Delete media for college ID:", id);
  } catch (e) {
    console.error("[admin/media deleteAction]", e);
  }
  revalidatePath("/admin/media");
  revalidatePath("/", "layout");
}

// --- Helpers ------------------------------------------------------------------

const PAGE_SIZE = 25;
const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=600";

function buildImageUrl(raw: string | null): string {
    if (!raw) return DEFAULT_IMAGE;
    if (raw.startsWith("http")) return raw;
    return `${IMAGE_BASE}${raw}`;
}

async function safeQuery<T >(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/media safeQuery]", err);
    return [];
  }
}

// --- Types --------------------------------------------------------------------

interface MediaRow  {
  id: number;
  college_name: string;
  banner_image: string | null;
  slug: string;
}

interface CountRow  {
  total: number;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

// --- Page ---------------------------------------------------------------------

export default async function MediaInformationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp   = await searchParams;
  const q    = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // -- Build WHERE clause -----------------------------------------------------
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push(
      "(u.firstname LIKE ? OR cp.slug LIKE ?)",
    );
    params.push(`%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // -- Query profiles ---------------------------------------------------------
  const [profiles, countRows] = await Promise.all([
    safeQuery<MediaRow>(
      `SELECT 
        cp.id,
        cp.slug,
        COALESCE(u.firstname, 'Unnamed College') as college_name,
        cp.bannerimage as banner_image
       FROM collegeprofile cp
       JOIN users u ON u.id = cp.users_id
       ${where}
       ORDER BY cp.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM collegeprofile cp JOIN users u ON u.id = cp.users_id ${where}`,
      params,
    ),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      
      {/* -- Header --------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>image</span>
            Media Information
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage college banners, brochures, and visual assets.</p>
        </div>
        <div className="flex items-center gap-3">
          <form method="GET" action="/admin/media" className="w-full sm:w-80">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
              <input 
                type="text" 
                name="q" 
                defaultValue={q}
                placeholder="Search colleges..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
              />
            </div>
          </form>
        </div>
      </div>

      {/* -- Table ----------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {profiles.length === 0 && (
          <div className="py-24 text-center">
            <span className="material-symbols-rounded text-7xl text-slate-200 block mb-4" style={ICO_FILL}>image</span>
            <p className="text-slate-500 font-semibold text-sm">No colleges found with media records.</p>
          </div>
        )}
        {profiles.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10">#</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">College & Slug</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Banner Preview</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assets</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {profiles.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 leading-snug truncate max-w-[250px]">{p.college_name}</span>
                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">{p.slug}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="w-32 h-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm relative group/img">
                        <img 
                          src={buildImageUrl(p.banner_image)} 
                          alt={p.college_name}
                          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                        />
                        {!p.banner_image && (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-[10px] font-bold text-slate-400">
                             NO BANNER
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                           <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${p.banner_image ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                              BANNER Image
                           </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit Assets">
                           <span className="material-symbols-rounded text-[20px]">edit</span>
                        </button>
                        <DeleteButton action={deleteMediaRecord.bind(null, p.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* -- Pagination ----------------------------------------------------- */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
            <p className="text-xs text-slate-400 font-medium">
              Showing <span className="text-slate-700 font-bold">{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</span> of <span className="text-slate-700 font-bold">{total}</span> colleges
            </p>
            <div className="flex items-center gap-1.5">
              {page > 1 ? (
                <Link href={`/admin/media?page=${page - 1}${q ? `&q=${q}` : ''}`} className="w-9 h-9 flex items-center justify-center text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                   <span className="material-symbols-rounded text-[18px]">chevron_left</span>
                </Link>
              ) : (
                <span className="w-9 h-9 flex items-center justify-center text-slate-300 bg-white border border-slate-100 rounded-xl cursor-not-allowed">
                   <span className="material-symbols-rounded text-[18px]">chevron_left</span>
                </span>
              )}
              
              <div className="flex items-center gap-1 mx-1">
                 <span className="text-xs font-bold text-slate-700 bg-blue-50 w-9 h-9 flex items-center justify-center rounded-xl border border-blue-100">{page}</span>
                 <span className="text-[10px] text-slate-300 font-bold">/</span>
                 <span className="text-xs font-bold text-slate-400 w-9 h-9 flex items-center justify-center">{totalPages}</span>
              </div>

              {page < totalPages ? (
                <Link href={`/admin/media?page=${page + 1}${q ? `&q=${q}` : ''}`} className="w-9 h-9 flex items-center justify-center text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                   <span className="material-symbols-rounded text-[18px]">chevron_right</span>
                </Link>
              ) : (
                <span className="w-9 h-9 flex items-center justify-center text-slate-300 bg-white border border-slate-100 rounded-xl cursor-not-allowed">
                   <span className="material-symbols-rounded text-[18px]">chevron_right</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




