import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

async function deleteInvite(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM invite WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/other-info/invite deleteAction]", e);
  }
  revalidatePath("/admin/other-info/invite");
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
    console.error("[admin/other-info/invite safeQuery]", err);
    return [];
  }
}

interface InviteRow extends RowDataPacket {
  id: number;
  link: string | null;
  referemail: string | null;
  isactive: number | null;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const where = q ? "WHERE referemail LIKE ? OR link LIKE ?" : "";
  const params = q ? [`%${q}%`, `%${q}%`] : [];

  const data = await safeQuery<InviteRow>(
    `SELECT id, link, referemail, isactive
     FROM invite
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
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>mail</span>
            Invitations
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage referral invitations and invitation links.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search emails or links..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
           />
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Referral Email</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Link / Status</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-slate-400">
                     No invitations found.
                  </td>
                </tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-5 py-4">
                       <p className="font-bold text-slate-800">{r.referemail || "No Email"}</p>
                    </td>
                    <td className="px-4 py-4">
                       <div className="flex flex-col gap-1">
                         <p className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">{r.link || "—"}</p>
                         <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase w-fit ${r.isactive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                           {r.isactive ? 'Active' : 'Expired'}
                         </span>
                       </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                       <DeleteButton action={deleteInvite.bind(null, r.id)} size="sm" />
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
