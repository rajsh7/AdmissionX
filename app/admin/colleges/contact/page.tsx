import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import Link from "next/link";
import ContactActions from "./ContactActions";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

// --- Server Actions -----------------------------------------------------------

async function deleteContactRow(id: string, src: string) {
  "use server";
  try {
    const db  = await getDb();
    const col = src === "old" ? "request_for_create_college_accounts" : "next_college_signups";
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: parseInt(id, 10) };
    await db.collection(col).deleteOne(filter);
  } catch (e) {
    console.error("[admin/colleges/contact deleteAction]", e);
  }
  revalidatePath("/admin/colleges/contact");
  revalidatePath("/", "layout");
}

// --- Helpers ------------------------------------------------------------------

const PAGE_SIZE = 15;

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

interface ContactRow {
  _id: string;
  college_name: string;
  contact_name: string;
  email: string;
  phone: string;
  _source: "old" | "new";
}

// --- Page ---------------------------------------------------------------------

export default async function CollegeContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const q      = (sp.q ?? "").trim();
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const db = await getDb();
  const oldCollection = "request_for_create_college_accounts";
  const newCollection = "next_college_signups";

  const escapeRegExp = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const buildSearchMatch = (query: string) => {
    const regex = { $regex: escapeRegExp(query), $options: "i" };
    return {
      $or: [
        { college_name: regex },
        { contact_name: regex },
        { email: regex },
        { phone: regex },
      ],
    };
  };

  const normalizeNewPipeline = [
    {
      $project: {
        college_name: { $ifNull: ["$college_name", ""] },
        contact_name: { $ifNull: ["$contact_name", ""] },
        email: { $ifNull: ["$email", ""] },
        phone: { $ifNull: ["$phone", ""] },
        _source: { $literal: "new" },
      },
    },
  ];

  const normalizeOldPipeline = [
    {
      $project: {
        college_name: { $ifNull: ["$collegeName", "$college_name", ""] },
        contact_name: { $ifNull: ["$contactPersonName", "$contact_name", ""] },
        email: { $ifNull: ["$email", ""] },
        phone: { $ifNull: ["$phone", ""] },
        _source: { $literal: "old" },
      },
    },
  ];

  const pipeline: Record<string, unknown>[] = [
    ...normalizeNewPipeline,
    { $unionWith: { coll: oldCollection, pipeline: normalizeOldPipeline } },
    ...(q ? [{ $match: buildSearchMatch(q) }] : []),
    { $sort: { college_name: 1 } },
    {
      $facet: {
        data: [{ $skip: offset }, { $limit: PAGE_SIZE }],
        total: [{ $count: "count" }],
      },
    },
  ];

  const aggResult = await db.collection(newCollection).aggregate(pipeline).toArray();
  const view = aggResult[0] ?? { data: [], total: [] };
  const rows: ContactRow[] = (view.data ?? []) as ContactRow[];
  const total = Number(view.total?.[0]?.count ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 w-full max-w-none">

      {/* -- Grid of Contact Cards -------------------------------------- */}
      <div className="bg-transparent rounded-2xl overflow-hidden">
        {rows.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center shadow-sm">
            <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>contact_mail</span>
            <p className="text-slate-500 font-bold text-sm">
              {q ? `No contacts matching "${q}"` : "No contact records found."}
            </p>
            {q && (
              <Link href="/admin/colleges/contact" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
                Clear search
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
            {rows.map((c, idx) => (
              <div 
                key={c._id} 
                className="bg-white rounded-[5px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow relative"
              >
                {/* Delete button (positioned absolute for clean card UI) */}
                <div className="absolute top-4 right-4 z-10">
                  <DeleteButton action={deleteContactRow.bind(null, c._id, c._source)} size="sm" />
                </div>

                <div className="p-6">
                  {/* Card Header: Logo + Title Section */}
                  <div className="flex gap-4 items-start mb-4">
                    {/* Placeholder Logo / AKT Styled */}
                    <div className="w-[137px] h-[127px] bg-[#D16B0D] rounded-[5px] shrink-0 flex items-center justify-center p-2">
                       <span className="text-white text-3xl font-black tracking-tighter">AKT</span>
                    </div>

                    <div className="flex-1 min-w-0 pr-8">
                       <h3 className="font-semibold text-[#6C6C6C] text-[20px] leading-tight uppercase truncate">
                         {c.college_name || "Unknown College"}
                         {idx % 2 === 0 && <span className="block text-[#6C6C6C]">Polytechnic College</span>}
                       </h3>
                       <p className="text-[14px] font-medium text-[#6C6C6C] leading-tight mt-2">
                         Directorate of Technical Education, Chennai ( DoTE Chennai )
                       </p>
                    </div>
                  </div>

                  {/* Address Line Separator */}
                  <div className="border-t border-slate-100 pt-4 mb-4">
                    <p className="text-[15px] font-semibold text-[#6C6C6C] truncate">
                       AKT Nagar, Neelamangalam, Kallakurichi
                    </p>
                  </div>

                  {/* Contact Info Rows */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-rounded text-[18px] shrink-0" style={ICO_FILL}>location_on</span>
                      <span className="text-[13px] font-normal leading-tight text-[#6C6C6C]">
                         Villupuram, Tamil Nadu 606202
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="material-symbols-rounded text-[18px] shrink-0" style={ICO_FILL}>mail</span>
                      <span className="text-[13px] font-normal leading-tight truncate text-[#6C6C6C]">
                         {c.email || "no-email@yahoo.co.in"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="material-symbols-rounded text-[18px] shrink-0" style={ICO_FILL}>call</span>
                      <span className="text-[13px] font-normal leading-tight tracking-wide text-[#6C6C6C]">
                         {c.phone || "04364222202"}
                      </span>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <ContactActions
                    email={c.email}
                    collegeName={c.college_name}
                    contactName={c.contact_name}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* -- Pagination ----------------------------------------------------- */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border border-slate-100 bg-white rounded-2xl shadow-sm mt-6">
            <p className="text-xs text-slate-500 font-medium">
              Showing <strong>{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total.toLocaleString()}</strong> contacts
            </p>
            <div className="flex items-center gap-1">
              {page > 1 ? (
                <Link href={`/admin/colleges/contact?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">← Prev</Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-bold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">← Prev</span>
              )}
              {page < totalPages ? (
                <Link href={`/admin/colleges/contact?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Next →</Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-bold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">Next →</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




