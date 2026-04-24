import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import AnswerListClient from "./AnswerListClient";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createAnswer(formData: FormData) {
  "use server";
  const answer = formData.get("answer") as string;
  const questionId = parseInt(formData.get("questionId") as string, 10);
  const status = formData.get("status") === "on" ? 1 : 0;

  if (!answer || isNaN(questionId)) return;

  try {
    await pool.query(
      `INSERT INTO ask_question_answers (answer, questionId, status, answerDate, created_at, updated_at) 
       VALUES (?, ?, ?, NOW(), NOW(), NOW())`,
      [answer, questionId, status]
    );
  } catch (e) {
    console.error("[admin/academic/ask-qa/answers createAction]", e);
  }
  revalidatePath("/admin/academic/ask-qa/answers");
  revalidatePath("/", "layout");
}

async function updateAnswer(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const answer = formData.get("answer") as string;
  const questionId = parseInt(formData.get("questionId") as string, 10);
  const status = formData.get("status") === "on" ? 1 : 0;

  if (!id || !answer || isNaN(questionId)) return;

  try {
    await pool.query(
      `UPDATE ask_question_answers SET answer = ?, questionId = ?, status = ?, updated_at = NOW() 
       WHERE id = ?`,
      [answer, questionId, status, id]
    );
  } catch (e) {
    console.error("[admin/academic/ask-qa/answers updateAction]", e);
  }
  revalidatePath("/admin/academic/ask-qa/answers");
  revalidatePath("/", "layout");
}

async function deleteAnswer(id: number) {
  "use server";
  if (!id) return;
  try {
    await pool.query("DELETE FROM ask_question_answers WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/academic/ask-qa/answers deleteAction]", e);
  }
  revalidatePath("/admin/academic/ask-qa/answers");
  revalidatePath("/", "layout");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function safeQuery<T>(
  sql: string,
  params: (string | number | boolean)[] = []
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/academic/ask-qa/answers safeQuery]", err);
    return [];
  }
}

interface AnswerRow {
  id: number;
  answer: string;
  answerDate: string | null;
  status: number | null;
  question: string | null;
  questionId: number | null;
  userName: string | null;
}

interface QuestionOption {
  id: number;
  question: string;
}

export default async function AskAnswersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const { getDb } = await import("@/lib/db");
  const db = await getDb();

  const filter = q
    ? { answer: { $regex: q, $options: "i" } }
    : {};

  const [answerDocs, questionDocs] = await Promise.all([
    db.collection("ask_question_answers").find(filter).sort({ id: -1 }).limit(200).toArray(),
    db.collection("ask_questions").find({}, { projection: { id: 1, question: 1 } }).toArray(),
  ]);

  // Lookup user names
  const userIds = [...new Set(answerDocs.map((d: any) => Number(d.userId)).filter(Boolean))];
  const userDocs = userIds.length
    ? await db.collection("users").find({ id: { $in: userIds } }, { projection: { id: 1, firstname: 1, lastname: 1 } }).toArray()
    : [];
  const userMap = new Map(userDocs.map((u: any) => [Number(u.id), `${String(u.firstname ?? "").trim()} ${String(u.lastname ?? "").trim()}`.trim()]));
  const questionMap = new Map(questionDocs.map((q: any) => [Number(q.id), String(q.question ?? "").replace(/<[^>]*>/g, "").trim()]));

  const answers: AnswerRow[] = answerDocs.map((d: any) => ({
    id: Number(d.id ?? 0),
    answer: String(d.answer ?? "").replace(/<[^>]*>/g, "").trim(),
    answerDate: d.answerDate ? String(d.answerDate).trim() : null,
    status: Number(String(d.status ?? "0").trim()),
    questionId: Number(d.questionId ?? 0),
    question: questionMap.get(Number(d.questionId)) || null,
    userName: userMap.get(Number(d.userId)) || null,
  }));

  const questions: QuestionOption[] = questionDocs.map((d: any) => ({
    id: Number(d.id ?? 0),
    question: String(d.question ?? "").replace(/<[^>]*>/g, "").trim(),
  }));

  const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <form method="GET" className="relative max-w-sm w-full font-sans">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px]" style={ICO}>search</span>
            <input 
              name="q" 
              defaultValue={q}
              placeholder="Search answers or questions..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition text-slate-800"
            />
        </form>
      </div>

      <AnswerListClient 
        answers={answers}
        questions={questions}
        createAnswer={createAnswer}
        updateAnswer={updateAnswer}
        deleteAnswer={deleteAnswer}
      />
    </div>
  );
}




