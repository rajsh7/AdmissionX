import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

async function deleteComment(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM exam_question_answer_comments WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/exams/comments deleteAction]", e);
  }
  revalidatePath("/admin/exams/comments");
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
    console.error("[admin/exams/comments safeQuery]", err);
    return [];
  }
}

interface CommentRow extends RowDataPacket {
  id: number;
  replyanswer: string;
  answerDate: string | null;
  parentAnswer: string | null;
  question: string | null;
  userName: string | null;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function ExamCommentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const where = q ? "WHERE ec.replyanswer LIKE ? OR ea.answer LIKE ? OR u.firstname LIKE ?" : "";
  const params = q ? [`%${q}%`, `%${q}%`, `%${q}%`] : [];

  const data = await safeQuery<CommentRow>(
    `SELECT 
      ec.id, 
      ec.replyanswer, 
      ec.answerDate,
      ea.answer as parentAnswer,
      eq.question as question,
      u.firstname as userName
     FROM exam_question_answer_comments ec
     LEFT JOIN exam_question_answers ea ON ea.id = ec.answerId
     LEFT JOIN exam_questions eq ON eq.id = ec.questionId
     LEFT JOIN users u ON u.id = ec.userId
     ${where}
     ORDER BY ec.id DESC
     LIMIT 100`,
    params
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-teal-600 text-[22px]" style={ICO_FILL}>speaker_notes</span>
            All Exam Comments
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage user comments on examination answers.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search comments, answers or users..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
           />
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Comment / Context</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Date</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-400">
                     No comments found.
                  </td>
                </tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id} className="hover:bg-teal-50/20 transition-colors group">
                    <td className="px-5 py-4 min-w-[300px]">
                      <div className="space-y-1.5">
                        <p className="font-semibold text-slate-800 line-clamp-2">{r.replyanswer}</p>
                        <div className="space-y-0.5 pl-2 border-l-2 border-slate-100">
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 italic">
                            <span className="material-symbols-rounded text-[12px]">forum</span>
                            Ans: {r.parentAnswer || "Deleted Answer"}
                          </p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 italic">
                            <span className="material-symbols-rounded text-[12px]">quiz</span>
                            Q: {r.question || "Deleted Question"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-600">
                      {r.userName || "Guest"}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500 text-right">
                      {r.answerDate ? new Date(r.answerDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-4 text-right">
                       <DeleteButton action={deleteComment.bind(null, r.id)} size="sm" />
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
