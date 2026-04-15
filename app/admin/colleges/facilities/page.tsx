import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import FacilitiesClient from "./FacilitiesClient";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function deleteFacilityRow(id: string) {
  "use server";
  const db = await getDb();
  try {
    await db.collection("collegefacilities").deleteOne({ _id: new ObjectId(id) });
  } catch (e) {
    console.error("[admin/colleges/facilities deleteAction]", e);
  }
  revalidatePath("/admin/colleges/facilities");
  revalidatePath("/", "layout");
}

async function createFacility(formData: FormData) {
  "use server";
  const db = await getDb();
  const collegeprofile_id = Number(formData.get("collegeprofile_id"));
  const facilities_id = Number(formData.get("facilities_id")) || null;
  const name = String(formData.get("name") || "") || null;
  const description = String(formData.get("description") || "") || null;
  try {
    const last = await db.collection("collegefacilities").find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray();
    const nextId = ((last[0]?.id as number) ?? 0) + 1;
    await db.collection("collegefacilities").insertOne({ id: nextId, collegeprofile_id, facilities_id, name, description, created_at: new Date() });
  } catch (e) { console.error("[admin/colleges/facilities createAction]", e); }
  revalidatePath("/admin/colleges/facilities");
  revalidatePath("/", "layout");
}

async function updateFacility(formData: FormData) {
  "use server";
  const db = await getDb();
  const id = String(formData.get("id") || "");
  const collegeprofile_id = Number(formData.get("collegeprofile_id"));
  const facilities_id = Number(formData.get("facilities_id")) || null;
  const name = String(formData.get("name") || "") || null;
  const description = String(formData.get("description") || "") || null;
  try {
    await db.collection("collegefacilities").updateOne(
      { _id: new ObjectId(id) },
      { $set: { collegeprofile_id, facilities_id, name, description } }
    );
  } catch (e) { console.error("[admin/colleges/facilities updateAction]", e); }
  revalidatePath("/admin/colleges/facilities");
  revalidatePath("/", "layout");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

// ─── Types ────────────────────────────────────────────────────────────────────

interface FacilityRow  {
  id: string;
  college_name: string;
  facility_name: string;
  facility_name_raw: string | null;
  description: string;
  icon: string | null;
  collegeprofile_id: string;
  facilities_id: string | null;
  created_at?: string;
}

interface CountRow  {
  total: number;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CollegeFacilitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const collegeId = sp.collegeId ?? "";
  const facilityTypeId = (sp.facilityTypeId ?? "").trim();
  const displayName = (sp.displayName ?? "").trim();
  const description = (sp.description ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const db = await getDb();

  // Build direct match on collegefacilities
  const facMatch: Record<string, unknown> = {};
  if (collegeId) facMatch.collegeprofile_id = Number(collegeId);
  if (displayName) facMatch.name = { $regex: displayName, $options: "i" };
  if (description) facMatch.description = { $regex: description, $options: "i" };
  if (q) facMatch.$or = [
    { name: { $regex: q, $options: "i" } },
    { description: { $regex: q, $options: "i" } },
  ];

  const [total, facRows] = await Promise.all([
    db.collection("collegefacilities").countDocuments(facMatch),
    db.collection("collegefacilities").find(facMatch).sort({ created_at: -1 }).skip(offset).limit(PAGE_SIZE).toArray(),
  ]);

  // Batch lookup college names
  const cpIds = [...new Set(facRows.map((f: any) => Number(f.collegeprofile_id)).filter(Boolean))];
  const cpRows = cpIds.length > 0
    ? await db.collection("collegeprofile").aggregate([
        { $match: { id: { $in: cpIds } } },
        { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        { $project: { _id: 0, id: 1, name: { $ifNull: ["$user.firstname", "$slug"] } } },
      ]).toArray()
    : [];
  const cpMap = new Map(cpRows.map((c: any) => [Number(c.id), String(c.name || "").trim()]));

  // Batch lookup facility type names
  const facTypeIds = [...new Set(facRows.map((f: any) => Number(f.facilities_id)).filter(Boolean))];
  const facTypeRows = facTypeIds.length > 0
    ? await db.collection("facilities").find({ id: { $in: facTypeIds } }, { projection: { id: 1, name: 1, iconname: 1 } }).toArray()
    : [];
  const facTypeMap = new Map(facTypeRows.map((f: any) => [Number(f.id), f]));

  const facilitiesList = facRows.map((f: any) => ({
    id: String(f._id),
    collegeprofile_id: String(f.collegeprofile_id),
    facilities_id: f.facilities_id ? String(f.facilities_id) : null,
    name: String(f.name || "").trim(),
    facility_name_raw: String(f.name || "").trim() || null,
    college_name: cpMap.get(Number(f.collegeprofile_id)) || "Unknown College",
    facility_name: String(f.name || facTypeMap.get(Number(f.facilities_id))?.name || "").trim(),
    description: String(f.description || "").trim(),
    icon: facTypeMap.get(Number(f.facilities_id))?.iconname || null,
    created_at: f.created_at ? String(f.created_at) : null,
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // College options
  const collegeOptions = await db.collection("collegeprofile").aggregate([
    { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, id: 1, name: { $ifNull: [{ $trim: { input: "$user.firstname" } }, "$slug"] } } },
    { $sort: { name: 1 } }, { $limit: 500 },
  ]).toArray();
  const colleges = collegeOptions.map((c: any) => ({ id: String(c.id), name: String(c.name || "").trim() }));

  // Facility type options
  const facilityTypes = await db.collection("facilities").find({}, { projection: { id: 1, name: 1 } }).sort({ name: 1 }).toArray();
  const facilityTypeOptions = facilityTypes.map((f: any) => ({ id: String(f.id || f._id), name: String(f.name || "").trim() }));
  const buildPageHref = (targetPage: number) => {
    const query = new URLSearchParams({ page: String(targetPage) });
    if (q) query.set("q", q);
    if (collegeId) query.set("collegeId", collegeId);
    if (facilityTypeId) query.set("facilityTypeId", facilityTypeId);
    if (displayName) query.set("displayName", displayName);
    if (description) query.set("description", description);
    return `/admin/colleges/facilities?${query.toString()}`;
  };

  return (
    <div className="p-6 space-y-6 w-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>location_city</span>
            College facilities
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage campus facilities and amenities.</p>
        </div>
      </div>

      <FacilitiesClient 
         facilitiesList={facilitiesList}
         colleges={colleges}
         facilityTypes={facilityTypeOptions}
         offset={offset}
         total={total}
         pageSize={PAGE_SIZE}
         onAdd={createFacility}
         onDelete={deleteFacilityRow}
         q={q}
         collegeId={collegeId}
         facilityTypeId={facilityTypeId}
         displayName={displayName}
         description={description}
      />

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500">
            Showing <strong>{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> of{" "}
            <strong>{total.toLocaleString()}</strong> facilities
          </p>
          <div className="flex items-center gap-1">
            {page > 1 ? (
              <Link
                href={buildPageHref(page - 1)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                ← Prev
              </Link>
            ) : (
              <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">← Prev</span>
            )}
            <span className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-blue-50 border border-blue-100 rounded-lg">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={buildPageHref(page + 1)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Next →
              </Link>
            ) : (
              <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">Next →</span>
            )}
          </div>
        </div>
      )}
    </div>


  );
}




