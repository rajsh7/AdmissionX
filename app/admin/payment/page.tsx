import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import PaymentListClient from "./PaymentListClient";

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

const PAGE_SIZE = 75;

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
  const payments = (result[0]?.data ?? []).map((p: any) => ({
    id: Number(p.id ?? 0),
    fees: p.fees ? String(p.fees) : null,
    seats: p.seats ? Number(p.seats) : null,
    college_name: String(p.college_name ?? ""),
    slug: String(p.slug ?? ""),
    course_name: String(p.course_name ?? ""),
    degree_name: String(p.degree_name ?? ""),
    stream_name: String(p.stream_name ?? ""),
  }));
  const total    = Number(result[0]?.total?.[0]?.count ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

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
        <PaymentListClient
          payments={payments}
          offset={offset}
          total={total}
          page={page}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          onDelete={deletePaymentRecord}
        />
      </div>
    </div>
  );
}
