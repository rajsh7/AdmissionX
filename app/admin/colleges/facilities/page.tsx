import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import FacilitiesClient from "./FacilitiesClient";

// --- Server Actions -----------------------------------------------------------

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
  const collegeprofile_id = formData.get("collegeprofile_id") as string;
  const facilities_id = formData.get("facilities_id") as string || null;
  const name = formData.get("name") as string || null;
  const description = formData.get("description") as string || null;

  try {
    await db.collection("collegefacilities").insertOne({
      collegeprofile_id: new ObjectId(collegeprofile_id),
      facilities_id: facilities_id ? new ObjectId(facilities_id) : null,
      name,
      description,
      created_at: new Date()
    });
  } catch (e) {
    console.error("[admin/colleges/facilities createAction]", e);
  }
  revalidatePath("/admin/colleges/facilities");
  revalidatePath("/", "layout");
}

async function updateFacility(formData: FormData) {
  "use server";
  const db = await getDb();
  const id = formData.get("id") as string;
  const collegeprofile_id = formData.get("collegeprofile_id") as string;
  const facilities_id = formData.get("facilities_id") as string || null;
  const name = formData.get("name") as string || null;
  const description = formData.get("description") as string || null;

  try {
    await db.collection("collegefacilities").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          collegeprofile_id: new ObjectId(collegeprofile_id),
          facilities_id: facilities_id ? new ObjectId(facilities_id) : null,
          name,
          description
        }
      }
    );
  } catch (e) {
    console.error("[admin/colleges/facilities updateAction]", e);
  }
  revalidatePath("/admin/colleges/facilities");
  revalidatePath("/", "layout");
}

// --- Helpers ------------------------------------------------------------------

const PAGE_SIZE = 25;

// --- Types --------------------------------------------------------------------

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

// --- Page ---------------------------------------------------------------------

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

  // Build match for aggregation
  const matchClauses: Record<string, unknown>[] = [];
  if (q) {
    matchClauses.push({
      $or: [
      { "user.firstname": { $regex: q, $options: "i" } },
      { name: { $regex: q, $options: "i" } },
      { "facility.name": { $regex: q, $options: "i" } }
      ],
    });
  }
  if (collegeId) {
    matchClauses.push({ collegeprofile_id: new ObjectId(collegeId) });
  }
  if (facilityTypeId === "custom") {
    matchClauses.push({ facilities_id: null });
  } else if (facilityTypeId) {
    matchClauses.push({ facilities_id: new ObjectId(facilityTypeId) });
  }
  if (displayName) {
    matchClauses.push({ name: { $regex: displayName, $options: "i" } });
  }
  if (description) {
    matchClauses.push({ description: { $regex: description, $options: "i" } });
  }
  const match = matchClauses.length > 0 ? { $and: matchClauses } : {};

  // Aggregation for facilities
  const facilitiesAggregation = [
    {
      $lookup: {
        from: "collegeprofile",
        localField: "collegeprofile_id",
        foreignField: "_id",
        as: "college"
      }
    },
    { $unwind: "$college" },
    {
      $lookup: {
        from: "users",
        localField: "college.users_id",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "facilities",
        localField: "facilities_id",
        foreignField: "_id",
        as: "facility"
      }
    },
    {
      $unwind: {
        path: "$facility",
        preserveNullAndEmptyArrays: true
      }
    },
    { $match: match },
    {
      $project: {
        id: { $toString: "$_id" },
        collegeprofile_id: { $toString: "$collegeprofile_id" },
        facilities_id: { $toString: "$facilities_id" },
        name: 1,
        facility_name_raw: "$name",
        college_name: { $ifNull: ["$user.firstname", "Unnamed College"] },
        facility_name: { $ifNull: ["$name", "$facility.name"] },
        description: 1,
        created_at: 1,
        icon: "$facility.iconname"
      }
    },
    { $sort: { created_at: -1 } },
    {
      $facet: {
        data: [{ $skip: offset }, { $limit: PAGE_SIZE }],
        total: [{ $count: "count" }]
      }
    }
  ];

  // Aggregation for colleges
  const collegesAggregation = [
    {
      $lookup: {
        from: "users",
        localField: "users_id",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $project: {
        id: { $toString: "$_id" },
        name: "$user.firstname"
      }
    },
    { $sort: { name: 1 } }
  ];

  // Aggregation for facility types
  const facilityTypesAggregation = [
    {
      $project: {
        id: { $toString: "$_id" },
        name: 1
      }
    },
    { $sort: { name: 1 } }
  ];

  const [facilitiesResult, collegesResult, facilityTypesResult] = await Promise.all([
    db.collection("collegefacilities").aggregate(facilitiesAggregation).toArray(),
    db.collection("collegeprofile").aggregate(collegesAggregation).toArray(),
    db.collection("facilities").aggregate(facilityTypesAggregation).toArray()
  ]);

  const facilitiesList = facilitiesResult[0]?.data || [];
  const total = facilitiesResult[0]?.total[0]?.count || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const colleges = collegesResult as { id: string; name: string }[];
  const facilityTypes = facilityTypesResult as { id: string; name: string }[];
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
         facilityTypes={facilityTypes}
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

      {/* -- Pagination ----------------------------------------------------- */}
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




