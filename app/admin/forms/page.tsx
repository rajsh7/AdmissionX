import pool from "@/lib/db";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

async function deleteFormEntry(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM query WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/forms deleteAction]", e);
  }
  revalidatePath("/admin/forms");
  revalidatePath("/", "layout");
}

async function safeQuery<T >(
  sql: string,
  params: (string | number | boolean)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/forms safeQuery]", err);
    return [];
  }
}

interface FormRow  {
  id: number;
  subject: string;
  message: string;
  guestname: string | null;
  guestemail: string | null;
  guestphone: string | null;
  created_at: string;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function AdminFormPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  // Filter only for guest inquiries if appropriate, or show all general ones
  const where = q 
    ? "WHERE (subject LIKE ? OR message LIKE ? OR guestname LIKE ?) AND queryflowtype = 'guest-to-admin'" 
    : "WHERE queryflowtype = 'guest-to-admin'";
  const params = q ? [`%${q}%`, `%${q}%`, `%${q}%`] : [];

  const data = await safeQuery<FormRow>(
    `SELECT id, subject, message, guestname, guestemail, guestphone, created_at
     FROM query
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
            <span className="material-symbols-rounded text-indigo-600 text-[24px]" style={ICO_FILL}>app_registration</span>
            General Forms
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage messages and inquiries from general contact forms.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search forms..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
           />
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Subject & Message</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Guest Info</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-20 text-center">
                     <div className="flex flex-col items-center gap-2 text-slate-400">
                        <span className="material-symbols-rounded text-[40px]" style={ICO}>inbox</span>
                        <p className="font-semibold">No form queries found.</p>
                     </div>
                  </td>
                </tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id} className="hover:bg-indigo-50/20 transition-colors group">
                    <td className="px-5 py-5 min-w-[300px]">
                      <div className="flex flex-col">
                         <span className="font-bold text-slate-800 line-clamp-1">{r.subject}</span>
                         <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{r.message}</p>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex flex-col gap-0.5">
                         <span className="text-xs font-bold text-slate-700">{r.guestname || "Anonymous"}</span>
                         <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                            <span className="material-symbols-rounded text-[14px]">mail</span>
                            <span>{r.guestemail || "N/A"}</span>
                         </div>
                         <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                            <span className="material-symbols-rounded text-[14px]">call</span>
                            <span>{r.guestphone || "N/A"}</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-xs text-slate-500 font-mono">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : "—"}
                    </td>
                    <td className="px-4 py-5 text-right">
                       <DeleteButton action={deleteFormEntry.bind(null, r.id)} size="sm" />
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




