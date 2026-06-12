import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import ContactListClient from "./ContactListClient";
import ContactSearchBar from "./ContactSearchBar";

async function deleteContactRow(id: string, src: string) {
  "use server";
  if (src === "profile") return;
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
  _source: "old" | "new" | "profile";
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

  const cleanText = (value: unknown) => {
    if (value == null) return "";
    const text = String(value).replace(/^null$/i, "").trim();
    return text.toUpperCase() === "NULL" ? "" : text;
  };

  const normalizeCollegeName = (value: unknown) => {
    const text = cleanText(value);
    return /^unknown college$/i.test(text) ? "" : text;
  };

  const normalizeCollegeType = (value: unknown) => {
    const text = cleanText(value);
    return /^unknown college$/i.test(text) ? "" : text;
  };

  const matchesQuery = (row: ContactRow, query: string) => {
    if (!query) return true;
    const needle = query.toLowerCase();
    return [
      row.college_name,
      row.contact_name,
      row.email,
      row.phone,
      row.address,
      row.city,
      row.state,
    ].some((value) => value.toLowerCase().includes(needle));
  };

  const sourcePriority: Record<ContactRow["_source"], number> = {
    new: 0,
    old: 1,
    profile: 2,
  };

  const qualityScore = (row: ContactRow) =>
    [
      row.college_name,
      row.contact_name,
      row.email,
      row.phone,
      row.address,
      row.city,
      row.state,
      row.pincode,
      row.college_type,
    ].filter(Boolean).length;

  const pickBestValue = (rows: ContactRow[], selector: (row: ContactRow) => string) =>
    rows
      .map(selector)
      .find(Boolean) ?? "";

  const normalizeNewPipeline = [
    { $project: { college_name: { $ifNull: ["$college_name", ""] }, contact_name: { $ifNull: ["$contact_name", ""] }, email: { $ifNull: ["$email", ""] }, phone: { $ifNull: ["$phone", ""] }, address: { $ifNull: ["$address", ""] }, city: { $ifNull: ["$city", ""] }, state: { $ifNull: ["$state", ""] }, pincode: { $ifNull: ["$pincode", ""] }, college_type: { $ifNull: ["$college_type", ""] }, _source: { $literal: "new" } } },
  ];

  const normalizeOldPipeline = [
    { $project: { college_name: { $ifNull: ["$collegeName", "$college_name", ""] }, contact_name: { $ifNull: ["$contactPersonName", "$contact_name", ""] }, email: { $ifNull: ["$email", ""] }, phone: { $ifNull: ["$phone", ""] }, address: { $ifNull: ["$address", ""] }, city: { $ifNull: ["$city", ""] }, state: { $ifNull: ["$state", ""] }, pincode: { $ifNull: ["$pincode", ""] }, college_type: { $ifNull: ["$college_type", ""] }, _source: { $literal: "old" } } },
  ];

  // Also pull from collegeprofile — join users by numeric id for college name
  const normalizeProfilePipeline = [
    {
      $lookup: {
        from: "users",
        let: { uid: "$users_id" },
        pipeline: [
          { $match: { $expr: { $or: [
            { $eq: ["$_id", "$$uid"] },
            { $eq: ["$id",  "$$uid"] },
          ] } } },
          { $limit: 1 },
        ],
        as: "_user",
      },
    },
    {
      $project: {
        college_name: {
          $ifNull: [
            "$college_name",
            { $arrayElemAt: ["$_user.firstname", 0] },
            "$slug",
            "",
          ],
        },
        contact_name: { $ifNull: ["$contactpersonname", ""] },
        email:        { $ifNull: ["$contactpersonemail", { $arrayElemAt: ["$_user.email", 0] }, ""] },
        phone:        { $ifNull: ["$contactpersonnumber", ""] },
        address:      { $ifNull: ["$registeredSortAddress", "$registeredFullAddress", ""] },
        city:         { $ifNull: ["$city_name", ""] },
        state:        { $literal: "" },
        pincode:      { $literal: "" },
        college_type: { $ifNull: ["$universityType", ""] },
        _source:      { $literal: "profile" },
      },
    },
    // Only include rows that have at least a name or email
    { $match: { $or: [{ college_name: { $ne: "" } }, { email: { $ne: "" } }] } },
  ];

  const pipeline: Record<string, unknown>[] = [
    ...normalizeProfilePipeline,
    { $unionWith: { coll: newCollection, pipeline: normalizeNewPipeline } },
    { $unionWith: { coll: oldCollection, pipeline: normalizeOldPipeline } },
    { $sort: { college_name: 1 } },
  ];

  const rawDocs = await db.collection("collegeprofile").aggregate<Record<string, unknown>>(pipeline).toArray();
  const normalizedRows: ContactRow[] = rawDocs.map((c) => ({
    _id:          String(c._id),
    college_name: normalizeCollegeName(c.college_name),
    contact_name: cleanText(c.contact_name),
    email:        cleanText(c.email).toLowerCase(),
    phone:        cleanText(c.phone),
    address:      cleanText(c.address),
    city:         cleanText(c.city),
    state:        cleanText(c.state),
    pincode:      cleanText(c.pincode),
    college_type: normalizeCollegeType(c.college_type),
    _source:      c._source === "old" ? "old" : c._source === "profile" ? "profile" : "new",
  }));

  const grouped = new Map<string, ContactRow[]>();
  for (const row of normalizedRows) {
    const dedupeKey =
      row.email ? `email:${row.email}` :
      row.phone ? `phone:${row.phone}` :
      `name:${row.college_name.toLowerCase()}|${row.contact_name.toLowerCase()}`;
    const existing = grouped.get(dedupeKey);
    if (existing) existing.push(row);
    else grouped.set(dedupeKey, [row]);
  }

  const dedupedRows = Array.from(grouped.values()).map((groupRows) => {
    const sortedRows = [...groupRows].sort((a, b) => {
      const qualityDiff = qualityScore(b) - qualityScore(a);
      if (qualityDiff !== 0) return qualityDiff;
      return sourcePriority[a._source] - sourcePriority[b._source];
    });
    const actionRow =
      sortedRows.find((row) => row._source !== "profile") ??
      sortedRows[0];

    return {
      _id: actionRow._id,
      _source: actionRow._source,
      college_name: pickBestValue(sortedRows, (row) => row.college_name),
      contact_name: pickBestValue(sortedRows, (row) => row.contact_name),
      email: pickBestValue(sortedRows, (row) => row.email),
      phone: pickBestValue(sortedRows, (row) => row.phone),
      address: pickBestValue(sortedRows, (row) => row.address),
      city: pickBestValue(sortedRows, (row) => row.city),
      state: pickBestValue(sortedRows, (row) => row.state),
      pincode: pickBestValue(sortedRows, (row) => row.pincode),
      college_type: pickBestValue(sortedRows, (row) => row.college_type),
    } satisfies ContactRow;
  });

  const filteredRows = dedupedRows
    .filter((row) => row.college_name)
    .filter((row) => matchesQuery(row, q))
    .sort((a, b) => a.college_name.localeCompare(b.college_name));

  const rows = filteredRows.slice(offset, offset + PAGE_SIZE);
  const total = filteredRows.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 w-full max-w-none">
      <ContactSearchBar initialQuery={q} />

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
