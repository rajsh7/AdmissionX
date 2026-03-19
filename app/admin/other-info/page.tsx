import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

async function deleteInfoRecord(id: number) {
  "use server";
  try {
    console.log("Delete info record ID:", id);
  } catch (e) {
    console.error("[admin/other-info deleteAction]", e);
  }
  revalidatePath("/admin/other-info");
  revalidatePath("/", "layout");
}

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/other-info safeQuery]", err);
    return [];
  }
}

interface InfoRow extends RowDataPacket {
  id: number;
  key_label: string;
  value_text: string;
  category: string;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function OtherInformationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const [data] = await Promise.all([
    safeQuery<InfoRow>(
      `SELECT 1 as id, 'Privacy Policy Version' as key_label, 'v2.1' as value_text, 'Legal' as category 
       UNION ALL
       SELECT 2 as id, 'Admissions Open Notice' as key_label, 'Admission for 2026 is now open' as value_text, 'General' as category`,
    ),
  ]);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>info</span>
            Other Website Information
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage miscellaneous content, dynamic alerts, and site-wide metadata.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Field Label</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Content Value</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((r) => (
                <tr key={r.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-5 py-4">
                    <span className="font-bold text-slate-800">{r.key_label}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs text-slate-600 italic font-medium">"{r.value_text}"</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 uppercase">
                      {r.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                     <DeleteButton action={deleteInfoRecord.bind(null, r.id)} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
