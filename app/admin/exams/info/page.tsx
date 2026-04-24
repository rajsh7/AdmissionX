import { getDb } from "@/lib/db";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import ExamInfoListClient from "./ExamInfoListClient";

// ─── Server Actions ────────────────────────────────────────────────────────────

async function deleteExamInfo(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM examination_details WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/exams/info deleteAction]", e);
  }
  revalidatePath("/admin/exams/info");
  revalidatePath("/", "layout");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 75;
const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ExaminationInformationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp   = await searchParams;
  const q    = (sp.q || "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const db  = await getDb();
  const col = db.collection("examination_details");

  const filter = q
    ? { $or: [{ title: { $regex: q, $options: "i" } }, { slug: { $regex: q, $options: "i" } }] }
    : {};

  const [docs, total] = await Promise.all([
    col.find(filter).sort({ id: -1 }).skip(offset).limit(PAGE_SIZE).toArray(),
    col.countDocuments(filter),
  ]);

  const data = docs.map((d: any) => ({
    id: Number(d.id ?? 0),
    title: String(d.title ?? ""),
    slug: d.slug ? String(d.slug) : null,
    exminationDate: d.exminationDate ? String(d.exminationDate) : null,
    description: d.description ? String(d.description).replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim().slice(0, 150) : null,
  })).filter((d) => d.title.trim() !== "");

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 mx-auto space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Examination Information
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage details and schedules for major examinations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            {total.toLocaleString()} records
          </span>
          <form method="GET" className="relative max-w-sm w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search exams..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </form>
        </div>
      </div>

      <ExamInfoListClient
        data={data}
        total={total}
        page={page}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        offset={offset}
        deleteAction={deleteExamInfo}
      />
    </div>
  );
}
