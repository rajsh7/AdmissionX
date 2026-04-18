import { getDb } from "@/lib/db";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

async function deleteDepartment(id: number) {
  "use server";
  try {
    const db = await getDb();
    await db.collection("faculty_departments").deleteOne({ id });
  } catch (e) {
    console.error("[admin/exams/department deleteAction]", e);
  }
  revalidatePath("/admin/exams/department");
  revalidatePath("/", "layout");
}

interface DeptRow {
  id: number;
  collegeName: string | null;
  functionalArea: string | null;
  degree: string | null;
  course: string | null;
  created_at: string | null;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function ExamDeptPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const db = await getDb();

  const pipeline: object[] = [
    {
      $lookup: {
        from: "collegeprofile",
        localField: "collegeprofile_id",
        foreignField: "id",
        as: "college",
      },
    },
    { $unwind: { path: "$college", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "college.users_id",
        foreignField: "id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "functionalarea",
        localField: "functionalarea_id",
        foreignField: "id",
        as: "fa",
      },
    },
    { $unwind: { path: "$fa", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "degree",
        localField: "degree_id",
        foreignField: "id",
        as: "deg",
      },
    },
    { $unwind: { path: "$deg", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "course",
        localField: "course_id",
        foreignField: "id",
        as: "crs",
      },
    },
    { $unwind: { path: "$crs", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        id: 1,
        created_at: 1,
        collegeName: { $ifNull: ["$user.firstname", "$college.slug"] },
        functionalArea: { $ifNull: ["$fa.name", null] },
        degree: { $ifNull: ["$deg.name", null] },
        course: { $ifNull: ["$crs.name", null] },
      },
    },
    { $sort: { id: -1 } },
    { $limit: 100 },
  ];

  if (q) {
    const regex = { $regex: q, $options: "i" };
    pipeline.splice(pipeline.length - 2, 0, {
      $match: {
        $or: [
          { "user.firstname": regex },
          { "fa.name": regex },
          { "deg.name": regex },
        ],
      },
    });
  }

  const raw = await db.collection("faculty_departments").aggregate(pipeline).toArray();

  const data: DeptRow[] = raw.map((r: any) => ({
    id: Number(r.id),
    collegeName: r.collegeName || null,
    functionalArea: r.functionalArea || null,
    degree: r.degree || null,
    course: r.course || null,
    created_at: r.created_at ? String(r.created_at) : null,
  }));

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-rose-600 text-[22px]" style={ICO_FILL}>domain</span>
            Exam Department
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage academic departments associated with examinations and colleges.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search colleges, areas or degrees..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
           />
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">College / Area</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Degree</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Course</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Created At</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                     No departments found.
                  </td>
                </tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id} className="hover:bg-rose-50/20 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-800">{r.collegeName || "—"}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{r.functionalArea || "—"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-600">
                      {r.degree || "—"}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500">
                      {r.course || "—"}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-4 py-4 text-right">
                       <DeleteButton action={deleteDepartment.bind(null, r.id)} size="sm" />
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




