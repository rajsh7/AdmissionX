import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

async function deleteQuestion(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM exam_questions WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/exams/questions deleteAction]", e);
  }
  revalidatePath("/admin/exams/questions");
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
    console.error("[admin/exams/questions safeQuery]", err);
    return [];
  }
}

interface QuestionRow extends RowDataPacket {
  id: number;
  question: string;
  questionDate: string | null;
  userName: string | null;
  examType: string | null;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function ExamQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const where = q ? "WHERE eq.question LIKE ? OR u.firstname LIKE ? OR et.name LIKE ?" : "";
  const params = q ? [`%${q}%`, `%${q}%`, `%${q}%`] : [];

  const data = await safeQuery<QuestionRow>(
    `SELECT 
      eq.id, 
      eq.question, 
      eq.questionDate,
      u.firstname as userName,
      et.name as examType
     FROM exam_questions eq
     LEFT JOIN users u ON u.id = eq.userId
     LEFT JOIN type_of_examinations et ON et.id = eq.typeOfExaminations_id
     ${where}
     ORDER BY eq.id DESC
     LIMIT 100`,
    params
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-orange-600 text-[22px]" style={ICO_FILL}>quiz</span>
            All Exam Questions
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage user-submitted questions specific to entrance examinations.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search questions, users or exam types..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
           />
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Question / Exam Type</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Date</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-400">
                     No questions found.
                  </td>
                </tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id} className="hover:bg-orange-50/20 transition-colors group">
                    <td className="px-5 py-4 min-w-[300px]">
                      <p className="font-semibold text-slate-800 line-clamp-2">{r.question}</p>
                      <span className="text-[10px] text-orange-600 font-bold uppercase tracking-tight">{r.examType || "General"}</span>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-600">
                      {r.userName || "Guest"}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500 text-right">
                      {r.questionDate ? new Date(r.questionDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-4 text-right">
                       <DeleteButton action={deleteQuestion.bind(null, r.id)} size="sm" />
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
