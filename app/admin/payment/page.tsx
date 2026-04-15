import { getDb } from "@/lib/db";
import Link from "next/link";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

async function deletePaymentRecord(id: number) {
  "use server";
  try {
    console.log("Delete payment info for course assignment ID:", id);
  } catch (e) {
    console.error("[admin/payment deleteAction]", e);
  }
  revalidatePath("/admin/payment");
  revalidatePath("/", "layout");
}

const PAGE_SIZE = 25;

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function ApplicationPaymentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const q      = (sp.q ?? "").trim();
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const db = await getDb();

  // Build search match
  const searchMatch = q ? {
    $or: [
      { "college_name": { $regex: q, $options: "i" } },
      { "slug":         { $regex: q, $options: "i" } },
      { "course_name":  { $regex: q, $options: "i" } },
      { "degree_name":  { $regex: q, $options: "i" } },
      { "stream_name":  { $regex: q, $options: "i" } },
    ]
  } : {};

  const pipeline = [
    // Join collegeprofile
    {
      $lookup: {
        from: "collegeprofile",
        localField: "collegeprofile_id",
        foreignField: "id",
        as: "cp",
      },
    },
    { $unwind: { path: "$cp", preserveNullAndEmptyArrays: true } },

    // Join users for college name
    {
      $lookup: {
        from: "users",
        localField: "cp.users_id",
        foreignField: "id",
        as: "u",
      },
    },
    { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },

    // Join course
    {
      $lookup: {
        from: "course",
        localField: "course_id",
        foreignField: "id",
        as: "c",
      },
    },
    { $unwind: { path: "$c", preserveNullAndEmptyArrays: true } },

    // Join degree
    {
      $lookup: {
        from: "degree",
        localField: "degree_id",
        foreignField: "id",
        as: "d",
      },
    },
    { $unwind: { path: "$d", preserveNullAndEmptyArrays: true } },

    // Join functionalarea (stream)
    {
      $lookup: {
        from: "functionalarea",
        localField: "functionalarea_id",
        foreignField: "id",
        as: "fa",
      },
    },
    { $unwind: { path: "$fa", preserveNullAndEmptyArrays: true } },

    // Project fields
    {
      $project: {
        id: 1,
        fees: 1,
        seats: 1,
        college_name: {
          $cond: [
            { $and: [{ $ne: ["$u.firstname", null] }, { $ne: [{ $trim: { input: "$u.firstname" } }, ""] }] },
            { $trim: { input: "$u.firstname" } },
            { $ifNull: ["$cp.slug", "Unnamed College"] },
          ],
        },
        slug: { $ifNull: ["$cp.slug", ""] },
        course_name: { $ifNull: ["$c.name", ""] },
        degree_name: { $ifNull: ["$d.name", ""] },
        stream_name: { $ifNull: ["$fa.name", ""] },
      },
    },

    // Search filter
    ...(q ? [{ $match: searchMatch }] : []),

    // Facet for data + total
    {
      $facet: {
        data:  [{ $skip: offset }, { $limit: PAGE_SIZE }],
        total: [{ $count: "count" }],
      },
    },
  ];

  const result = await db.collection("collegemaster").aggregate(pipeline).toArray();
  const payments = (result[0]?.data ?? []) as any[];
  const total    = Number(result[0]?.total?.[0]?.count ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>school</span>
            College Fee Structure
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Course-wise fee listings set by colleges. This is not actual payment data.</p>
        </div>
        <form method="GET" action="/admin/payment" className="w-full sm:w-80">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
            <input
              type="text" name="q" defaultValue={q}
              placeholder="Search colleges, courses..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
            />
          </div>
        </form>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {payments.length === 0 ? (
            <div className="py-24 text-center">
              <span className="material-symbols-rounded text-7xl text-slate-200 block mb-4" style={ICO_FILL}>payments</span>
              <p className="text-slate-500 font-semibold text-sm">No payment records found.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10">#</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">College Name</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Course / Degree / Stream</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Listed Fee</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payments.map((p: any, idx: number) => (
                  <tr key={p.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>

                    {/* College */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-800 leading-snug truncate max-w-[220px] block">
                          {p.college_name || "—"}
                        </span>
                        {p.slug && (
                          <span className="text-[10px] text-slate-400 font-mono truncate max-w-[220px]">{p.slug}</span>
                        )}
                      </div>
                    </td>

                    {/* Course / Degree / Stream */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-0.5">
                        {p.course_name ? (
                          <span className="font-semibold text-slate-700 line-clamp-1">{p.course_name}</span>
                        ) : (
                          <span className="text-slate-400 text-xs">No course</span>
                        )}
                        {p.degree_name && (
                          <span className="text-[11px] text-blue-600 font-bold">{p.degree_name}</span>
                        )}
                        {p.stream_name && (
                          <span className="text-[10px] text-slate-400 font-medium">{p.stream_name}</span>
                        )}
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                          {p.seats || 0} seats
                        </span>
                      </div>
                    </td>

                    {/* Fee */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-black text-blue-600">
                          {p.fees ? `₹ ${p.fees}` : "N/A"}
                        </span>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Listed Course Fee</p>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Update Fee">
                          <span className="material-symbols-rounded text-[20px]">edit_note</span>
                        </button>
                        <DeleteButton action={deletePaymentRecord.bind(null, p.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
            <p className="text-xs text-slate-400 font-medium">
              Showing <span className="text-slate-700 font-bold">{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</span> of <span className="text-slate-700 font-bold">{total.toLocaleString()}</span> records
            </p>
            <div className="flex items-center gap-1.5">
              {page > 1 ? (
                <Link href={`/admin/payment?page=${page - 1}${q ? `&q=${q}` : ""}`} className="w-9 h-9 flex items-center justify-center text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                  <span className="material-symbols-rounded text-[18px]">chevron_left</span>
                </Link>
              ) : (
                <span className="w-9 h-9 flex items-center justify-center text-slate-300 bg-white border border-slate-100 rounded-xl cursor-not-allowed">
                  <span className="material-symbols-rounded text-[18px]">chevron_left</span>
                </span>
              )}
              <div className="flex items-center gap-1 mx-1">
                <span className="text-xs font-bold text-slate-700 bg-blue-50 w-9 h-9 flex items-center justify-center rounded-xl border border-blue-100">{page}</span>
                <span className="text-[10px] text-slate-300 font-bold">/</span>
                <span className="text-xs font-bold text-slate-400 w-9 h-9 flex items-center justify-center">{totalPages}</span>
              </div>
              {page < totalPages ? (
                <Link href={`/admin/payment?page=${page + 1}${q ? `&q=${q}` : ""}`} className="w-9 h-9 flex items-center justify-center text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                  <span className="material-symbols-rounded text-[18px]">chevron_right</span>
                </Link>
              ) : (
                <span className="w-9 h-9 flex items-center justify-center text-slate-300 bg-white border border-slate-100 rounded-xl cursor-not-allowed">
                  <span className="material-symbols-rounded text-[18px]">chevron_right</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
