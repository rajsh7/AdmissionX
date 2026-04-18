import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import ContactListClient from "./ContactListClient";

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

// Fetch 45 per page so client can show 15 → 30 → 45 via Show More
const PAGE_SIZE = 45;

interface ContactRow {
  _id: string;
  college_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  college_type: string;
  _source: "old" | "new";
}

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
    return { $or: [{ college_name: regex }, { contact_name: regex }, { email: regex }, { phone: regex }] };
  };

  const normalizeNewPipeline = [
    { $project: { college_name: { $ifNull: ["$college_name", ""] }, contact_name: { $ifNull: ["$contact_name", ""] }, email: { $ifNull: ["$email", ""] }, phone: { $ifNull: ["$phone", ""] }, address: { $ifNull: ["$address", ""] }, city: { $ifNull: ["$city", ""] }, state: { $ifNull: ["$state", ""] }, pincode: { $ifNull: ["$pincode", ""] }, college_type: { $ifNull: ["$college_type", ""] }, _source: { $literal: "new" } } },
  ];

  const normalizeOldPipeline = [
    { $project: { college_name: { $ifNull: ["$collegeName", "$college_name", ""] }, contact_name: { $ifNull: ["$contactPersonName", "$contact_name", ""] }, email: { $ifNull: ["$email", ""] }, phone: { $ifNull: ["$phone", ""] }, address: { $ifNull: ["$address", ""] }, city: { $ifNull: ["$city", ""] }, state: { $ifNull: ["$state", ""] }, pincode: { $ifNull: ["$pincode", ""] }, college_type: { $ifNull: ["$college_type", ""] }, _source: { $literal: "old" } } },
  ];

  const pipeline: Record<string, unknown>[] = [
    ...normalizeNewPipeline,
    { $unionWith: { coll: oldCollection, pipeline: normalizeOldPipeline } },
    ...(q ? [{ $match: buildSearchMatch(q) }] : []),
    { $sort: { college_name: 1 } },
    { $facet: { data: [{ $skip: offset }, { $limit: PAGE_SIZE }], total: [{ $count: "count" }] } },
  ];

  const aggResult = await db.collection(newCollection).aggregate(pipeline).toArray();
  const view      = aggResult[0] ?? { data: [], total: [] };
  const rows: ContactRow[] = (view.data ?? []).map((c: any) => ({
    _id:          String(c._id),
    college_name: String(c.college_name ?? ""),
    contact_name: String(c.contact_name ?? ""),
    email:        String(c.email        ?? ""),
    phone:        String(c.phone        ?? ""),
    address:      String(c.address      ?? ""),
    city:         String(c.city         ?? ""),
    state:        String(c.state        ?? ""),
    pincode:      String(c.pincode      ?? ""),
    college_type: String(c.college_type ?? ""),
    _source:      c._source === "old" ? "old" : "new",
  }));
  const total      = Number(view.total?.[0]?.count ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 w-full max-w-none">
      <ContactListClient
        rows={rows}
        total={total}
        page={page}
        totalPages={totalPages}
        offset={offset}
        pageSize={PAGE_SIZE}
        q={q}
        onDelete={deleteContactRow}
      />
    </div>
  );
}
