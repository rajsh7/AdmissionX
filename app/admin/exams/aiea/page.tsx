import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

async function deleteExamRecord(id: number) {
  "use server";
  try {
    console.log("Delete exam record ID:", id);
  } catch (e) {
    console.error("[admin/exams/aiea deleteAction]", e);
  }
  revalidatePath("/admin/exams/aiea");
}

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/exams/aiea safeQuery]", err);
    return [];
  }
}

interface ExamRow extends RowDataPacket {
  id: number;
  exam_name: string;
  date: string;
  type: string;
  status: string;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function AieaExamPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp   = await searchParams;
  const q    = (sp.q ?? "").trim();
  
  const [exams] = await Promise.all([
    safeQuery<ExamRow>(
      `SELECT 
        1 as id, 
        'All India Entrance Assessment (AIEA) 2026' as exam_name, 
        '2026-06-15' as date,
        'National Level' as type,
        'Upcoming' as status
       LIMIT 1`,
    ),
  ]);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>quiz</span>
            AIEA Exam Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage schedules, applications, and results for the AIEA examination.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-900/10">
           <span className="material-symbols-rounded text-[20px]">add</span>
           Schedule New Exam
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Examination Name</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Exam Date</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Level / Type</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {exams.map((r) => (
                <tr key={r.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-5 py-4">
                    <span className="font-bold text-slate-800">{r.exam_name}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                       <span className="material-symbols-rounded text-[18px]">calendar_today</span>
                       <span className="font-medium">{r.date}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-tight">{r.type}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 uppercase">
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                     <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                           <span className="material-symbols-rounded text-[18px]">edit</span>
                        </button>
                        <DeleteButton action={deleteExamRecord.bind(null, r.id)} size="sm" />
                     </div>
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
