import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import AieaListClient from "./AieaListClient";

// ─── Server Actions ────────────────────────────────────────────────────────────

async function createAieaExam(formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const status = parseInt(formData.get("status") as string, 10) || 0;
  const description = formData.get("description") as string;
  const featimage = formData.get("featimage") as string;
  const fullimage = formData.get("fullimage") as string;
  const brochure = formData.get("brochure") as string;
  const website = formData.get("website") as string;
  const appFrom = formData.get("applicationFrom") as string;
  const appTo = formData.get("applicationTo") as string;
  const appFees = formData.get("applicationFees") as string;
  const eligibility = formData.get("eligibility") as string;
  const syllabus = formData.get("syllabus") as string;
  const pattern = formData.get("pattern") as string;
  const prepare = formData.get("prepare") as string;
  const contact = formData.get("contact") as string;
  const typeId = formData.get("examination_types_id") as string;

  if (!title) return;

  try {
    await pool.query(
      `INSERT INTO examination_details 
       (title, slug, status, description, featimage, fullimage, brochure, website, 
        applicationFrom, applicationTo, applicationFees, eligibility, syllabus, pattern, 
        prepare, contact, examination_types_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [title, slug || null, status, description || null, featimage || null, fullimage || null,
       brochure || null, website || null, appFrom || null, appTo || null, appFees || null,
       eligibility || null, syllabus || null, pattern || null, prepare || null, contact || null, typeId || null]
    );
  } catch (e) {
    console.error("[admin/exams/aiea createAction]", e);
  }
  revalidatePath("/admin/exams/aiea");
  revalidatePath("/", "layout");
}

async function updateAieaExam(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const status = parseInt(formData.get("status") as string, 10) || 0;
  const description = formData.get("description") as string;
  const featimage = formData.get("featimage") as string;
  const fullimage = formData.get("fullimage") as string;
  const brochure = formData.get("brochure") as string;
  const website = formData.get("website") as string;
  const appFrom = formData.get("applicationFrom") as string;
  const appTo = formData.get("applicationTo") as string;
  const appFees = formData.get("applicationFees") as string;
  const eligibility = formData.get("eligibility") as string;
  const syllabus = formData.get("syllabus") as string;
  const pattern = formData.get("pattern") as string;
  const prepare = formData.get("prepare") as string;
  const contact = formData.get("contact") as string;
  const typeId = formData.get("examination_types_id") as string;

  if (!id || !title) return;

  try {
    await pool.query(
      `UPDATE examination_details 
       SET title = ?, slug = ?, status = ?, description = ?, featimage = ?, fullimage = ?, 
           brochure = ?, website = ?, applicationFrom = ?, applicationTo = ?, applicationFees = ?, 
           eligibility = ?, syllabus = ?, pattern = ?, prepare = ?, contact = ?, 
           examination_types_id = ?, updated_at = NOW() 
       WHERE id = ?`,
      [title, slug || null, status, description || null, featimage || null, fullimage || null,
       brochure || null, website || null, appFrom || null, appTo || null, appFees || null,
       eligibility || null, syllabus || null, pattern || null, prepare || null, contact || null, 
       typeId || null, id]
    );
  } catch (e) {
    console.error("[admin/exams/aiea updateAction]", e);
  }
  revalidatePath("/admin/exams/aiea");
  revalidatePath("/", "layout");
}

async function deleteAieaExam(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM examination_details WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/exams/aiea deleteAction]", e);
  }
  revalidatePath("/admin/exams/aiea");
  revalidatePath("/", "layout");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 75;

async function safeQuery<T >(
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExamRow  {
  id: number;
  title: string;
  slug: string | null;
  status: number;
  applicationFrom: string | null;
  applicationTo: string | null;
  created_at: string;
}

interface ExamTypeRow  {
  id: number;
  name: string;
}

interface CountRow  {
  total: number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AieaExamPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp       = await searchParams;
  const q        = (sp.q ?? "").trim();
  const page     = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset   = (page - 1) * PAGE_SIZE;

  const aieaFilter = q
    ? { $or: [{ title: { $regex: q, $options: "i" } }, { slug: { $regex: q, $options: "i" } }] }
    : {};

  const db = await (await import("@/lib/db")).getDb();
  const col = db.collection("examination_details");

  const [exams, total, allTypes] = await Promise.all([
    col.find(aieaFilter).sort({ created_at: -1 }).skip(offset).limit(PAGE_SIZE).toArray(),
    col.countDocuments(aieaFilter),
    safeQuery<ExamTypeRow>("SELECT id, name FROM examination_types ORDER BY name ASC"),
  ]);

  const cleanExams: ExamRow[] = exams.map((e: any) => ({
    id: Number(e.id ?? 0),
    title: String(e.title ?? ""),
    slug: e.slug ? String(e.slug) : null,
    status: Number(e.status ?? 0),
    applicationFrom: e.applicationFrom ? String(e.applicationFrom) : null,
    applicationTo: e.applicationTo ? String(e.applicationTo) : null,
    created_at: e.created_at ? String(e.created_at) : "",
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2 text-blue-600">
            <span className="material-symbols-rounded text-[22px]" style={ICO_FILL}>quiz</span>
            AIEA Exam Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage schedules, applications, and results for All India Entrance Assessment.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            {total.toLocaleString()} records
          </span>
        </div>
      </div>

      <AieaListClient 
        data={cleanExams}
        total={total}
        page={page}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        offset={offset}
        examTypes={allTypes}
        createAction={createAieaExam}
        updateAction={updateAieaExam}
        deleteAction={deleteAieaExam}
      />
    </div>
  );
}
