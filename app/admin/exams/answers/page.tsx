import pool from "@/lib/db";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

async function deleteAnswer(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM exam_question_answers WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/exams/answers deleteAction]", e);
  }
  revalidatePath("/admin/exams/answers");
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
    console.error("[admin/exams/answers safeQuery]", err);
    return [];
  }
}

interface AnswerRow  {
  id: number;
  answer: string;
  answerDate: string | null;
  question: string | null;
  userName: string | null;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function ExamAnswersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const { getDb } = await import("@/lib/db");
  const db = await getDb();
  const filter = q ? { answer: { $regex: q, $options: "i" } } : {};
  const docs = await db.collection("exam_question_answers").find(filter).sort({ id: -1 }).limit(100).toArray();
  const qIds = [...new Set(docs.map((d: any) => Number(d.questionId)).filter(Boolean))];
  const uIds = [...new Set(docs.map((d: any) => Number(d.userId)).filter(Boolean))];
  const [qDocs, uDocs] = await Promise.all([
    qIds.length ? db.collection("exam_questions").find({ id: { $in: qIds } }, { projection: { id: 1, question: 1 } }).toArray() : [],
    uIds.length ? db.collection("users").find({ id: { $in: uIds } }, { projection: { id: 1, firstname: 1 } }).toArray() : [],
  ]);
  const qMap = new Map(qDocs.map((d: any) => [Number(d.id), String(d.question ?? "").replace(/<[^>]*>/g, "").trim()]));
  const uMap = new Map(uDocs.map((d: any) => [Number(d.id), String(d.firstname ?? "").trim()]));
  const data: AnswerRow[] = docs.map((d: any) => ({
    id: Number(d.id ?? 0),
    answer: String(d.answer ?? "").replace(/<[^>]*>/g, "").trim(),
    answerDate: d.answerDate ? String(d.answerDate).trim() : null,
    question: qMap.get(Number(d.questionId)) || null,
    userName: uMap.get(Number(d.userId)) || null,
  }));

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-indigo-600 text-[22px]" style={ICO_FILL}>forum</span>
            All Exam Answers
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage answers given to entrance examination questions.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search answers, questions or users..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
           />
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Answer / Question</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Date</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-400">
                     No answers found.
                  </td>
                </tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id} className="hover:bg-indigo-50/20 transition-colors group">
                    <td className="px-5 py-4 min-w-[300px]">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-800 line-clamp-2">{r.answer}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 italic">
                          <span className="material-symbols-rounded text-[12px]">quiz</span>
                          Q: {r.question || "Deleted Question"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-600">
                      {r.userName || "Guest"}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500 text-right">
                      {r.answerDate ? new Date(r.answerDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-4 text-right">
                       <DeleteButton action={deleteAnswer.bind(null, r.id)} size="sm" />
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




