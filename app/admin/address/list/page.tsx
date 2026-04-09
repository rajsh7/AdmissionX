import pool from "@/lib/db";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

async function deleteAddress(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM address WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/address/list deleteAction]", e);
  }
  revalidatePath("/admin/address/list");
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
    console.error("[admin/address/list safeQuery]", err);
    return [];
  }
}

interface AddressRow  {
  id: number;
  name: string | null;
  address1: string | null;
  postalcode: string | null;
  cityName: string | null;
  stateName: string | null;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function AddressListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const where = q ? "WHERE a.name LIKE ? OR a.address1 LIKE ? OR a.postalcode LIKE ?" : "";
  const params = q ? [`%${q}%`, `%${q}%`, `%${q}%`] : [];

  const data = await safeQuery<AddressRow>(
    `SELECT a.id, a.name, a.address1, a.postalcode, ci.name as cityName, s.name as stateName
     FROM address a
     LEFT JOIN city ci ON ci.id = a.city_id
     LEFT JOIN state s ON s.id = ci.state_id
     ${where}
     ORDER BY a.id DESC
     LIMIT 100`,
    params
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-violet-600 text-[22px]" style={ICO_FILL}>location_on</span>
            Address Information
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage and list specific physical addresses stored in the system.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search addresses, names or postal codes..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
           />
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Address Details</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Region</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-slate-400">
                     No addresses found.
                  </td>
                </tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id} className="hover:bg-violet-50/20 transition-colors group">
                    <td className="px-5 py-4">
                       <p className="font-bold text-slate-800">{r.name || "Unnamed Address"}</p>
                       <p className="text-xs text-slate-500 line-clamp-1">{r.address1 || "—"}</p>
                       <p className="text-[10px] font-mono text-slate-400 mt-1">Zip: {r.postalcode || "—"}</p>
                    </td>
                    <td className="px-4 py-4">
                       <p className="text-xs text-slate-700 font-medium">{r.cityName || "Unknown City"}</p>
                       <p className="text-[10px] text-slate-400 uppercase tracking-tight">{r.stateName || "Unknown State"}</p>
                    </td>
                    <td className="px-4 py-4 text-right">
                       <DeleteButton action={deleteAddress.bind(null, r.id)} size="sm" />
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




