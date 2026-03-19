import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

async function deleteUpdate(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM latest_updates WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/website-content/updates deleteAction]", e);
  }
  revalidatePath("/admin/website-content/updates");
  revalidatePath("/", "layout");
}

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number | boolean)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/website-content/updates safeQuery]", err);
    return [];
  }
}

interface UpdateRow extends RowDataPacket {
  id: number;
  desc: string | null;
  date: string | null;
  status: number;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function UpdatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const where = q ? "WHERE `desc` LIKE ?" : "";
  const params = q ? [`%${q}%`] : [];

  const data = await safeQuery<UpdateRow>(
    `SELECT id, \`desc\`, \`date\`, status
     FROM latest_updates
     ${where}
     ORDER BY id DESC
     LIMIT 100`,
    params
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-rose-600 text-[22px]" style={ICO_FILL}>campaign</span>
            Latest Update
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage latest updates, alerts, and scrolls shown on the website.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search updates..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
           />
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Update Description</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Date</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-400">
                     No updates found.
                  </td>
                </tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id} className="hover:bg-rose-50/20 transition-colors group">
                    <td className="px-5 py-4 min-w-[300px]">
                      <p className="text-slate-700 font-medium line-clamp-2" title={r.desc || ""}>
                        {r.desc || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-center text-slate-500 text-xs">
                       {r.date || "—"}
                    </td>
                    <td className="px-4 py-4 text-center">
                       <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${r.status ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                          <span className="material-symbols-rounded text-[14px]" style={ICO_FILL}>{r.status ? 'check_circle' : 'pending'}</span>
                          {r.status ? 'Active' : 'Inactive'}
                       </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                       <DeleteButton action={deleteUpdate.bind(null, r.id)} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
