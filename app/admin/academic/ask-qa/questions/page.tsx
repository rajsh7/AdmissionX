import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import QuestionListClient from "./QuestionListClient";

// --- Server Actions -----------------------------------------------------------

async function createQuestion(formData: FormData) {
  "use server";
  const question = formData.get("question") as string;
  const slug = formData.get("slug") as string;
  const status = formData.get("status") === "on" ? 1 : 0;

  if (!question) return;

  try {
    await pool.query(
      `INSERT INTO ask_questions (question, slug, status, questionDate, created_at, updated_at) 
       VALUES (?, ?, ?, NOW(), NOW(), NOW())`,
      [question, slug, status]
    );
  } catch (e) {
    console.error("[admin/academic/ask-qa/questions createAction]", e);
  }
  revalidatePath("/admin/academic/ask-qa/questions");
  revalidatePath("/", "layout");
}

async function updateQuestion(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const question = formData.get("question") as string;
  const slug = formData.get("slug") as string;
  const status = formData.get("status") === "on" ? 1 : 0;

  if (!id || !question) return;

  try {
    await pool.query(
      `UPDATE ask_questions SET question = ?, slug = ?, status = ?, updated_at = NOW() 
       WHERE id = ?`,
      [question, slug, status, id]
    );
  } catch (e) {
    console.error("[admin/academic/ask-qa/questions updateAction]", e);
  }
  revalidatePath("/admin/academic/ask-qa/questions");
  revalidatePath("/", "layout");
}

async function deleteQuestion(id: number) {
  "use server";
  if (!id) return;
  try {
    await pool.query("DELETE FROM ask_questions WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/academic/ask-qa/questions deleteAction]", e);
  }
  revalidatePath("/admin/academic/ask-qa/questions");
  revalidatePath("/", "layout");
}

// --- Helpers ------------------------------------------------------------------

async function safeQuery<T >(
  sql: string,
  params: (string | number | boolean)[] = []
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/academic/ask-qa/questions safeQuery]", err);
    return [];
  }
}

interface QuestionRow  {
  id: number;
  question: string;
  questionDate: string | null;
  status: number | null;
  slug: string | null;
}

export default async function AskQaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const where = q ? "WHERE question LIKE ? OR slug LIKE ?" : "";
  const params = q ? [`%${q}%`, `%${q}%`] : [];

  const questions = await safeQuery<QuestionRow>(
    `SELECT id, question, questionDate, status, slug
     FROM ask_questions
     ${where}
     ORDER BY id DESC
     LIMIT 200`,
    params
  );

  const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <form method="GET" className="relative max-w-sm w-full font-sans">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px]" style={ICO}>search</span>
            <input 
              name="q" 
              defaultValue={q}
              placeholder="Search questions or slugs..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition text-slate-800"
            />
        </form>
      </div>

      <QuestionListClient 
        questions={questions}
        createQuestion={createQuestion}
        updateQuestion={updateQuestion}
        deleteQuestion={deleteQuestion}
      />
    </div>
  );
}




