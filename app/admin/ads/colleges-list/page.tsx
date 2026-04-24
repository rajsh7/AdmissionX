import { getDb } from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import AdsCollegesListClient from "./AdsCollegesListClient";

interface OptionRow { id: number; name: string; }

// ─── Server Actions ───────────────────────────────────────────────────────────

async function toggleAdRowStatus(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const currentStatus = parseInt(formData.get("status") as string, 10);
  if (isNaN(id)) return;
  try {
    const db = await getDb();
    await db.collection("ads_top_college_lists").updateOne(
      { id },
      { $set: { status: currentStatus ? 0 : 1, updated_at: new Date().toISOString() } }
    );
  } catch (e) {
    console.error("[admin/ads/colleges-list toggleStatus]", e);
  }
  revalidatePath("/admin/ads/colleges-list");
  revalidatePath("/", "layout");
}

async function deleteAdRow(id: number) {
  "use server";
  if (isNaN(id)) return;
  try {
    const db = await getDb();
    await db.collection("ads_top_college_lists").deleteOne({ id });
  } catch (e) {
    console.error("[admin/ads/colleges-list deleteRow]", e);
  }
  revalidatePath("/admin/ads/colleges-list");
  revalidatePath("/", "layout");
}

async function createAdRow(formData: FormData) {
  "use server";
  try {
    const db = await getDb();
    const col = db.collection("ads_top_college_lists");
    const status = formData.get("status") ? 1 : 0;
    const method_type = formData.get("method_type") as string;
    const getIntOrNull = (name: string) => {
      const val = parseInt(formData.get(name) as string, 10);
      return isNaN(val) ? null : val;
    };
    const last = await col.find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray();
    const newId = ((last[0]?.id as number) ?? 0) + 1;
    await col.insertOne({
      id: newId, method_type: method_type || null, status,
      collegeprofile_id: getIntOrNull("collegeprofile_id"),
      functionalarea_id: getIntOrNull("functionalarea_id"),
      degree_id: getIntOrNull("degree_id"),
      course_id: getIntOrNull("course_id"),
      educationlevel_id: getIntOrNull("educationlevel_id"),
      city_id: getIntOrNull("city_id"),
      state_id: getIntOrNull("state_id"),
      country_id: getIntOrNull("country_id"),
      university_id: getIntOrNull("university_id"),
      employee_id: getIntOrNull("employee_id"),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[admin/ads/colleges-list createRow]", e);
  }
  revalidatePath("/admin/ads/colleges-list");
  revalidatePath("/", "layout");
}

async function updateAdRow(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  if (isNaN(id)) return;
  try {
    const db = await getDb();
    const status = formData.get("status") ? 1 : 0;
    const method_type = formData.get("method_type") as string;
    const getIntOrNull = (name: string) => {
      const val = parseInt(formData.get(name) as string, 10);
      return isNaN(val) ? null : val;
    };
    await db.collection("ads_top_college_lists").updateOne(
      { id },
      { $set: {
        method_type: method_type || null, status,
        collegeprofile_id: getIntOrNull("collegeprofile_id"),
        functionalarea_id: getIntOrNull("functionalarea_id"),
        degree_id: getIntOrNull("degree_id"),
        course_id: getIntOrNull("course_id"),
        educationlevel_id: getIntOrNull("educationlevel_id"),
        city_id: getIntOrNull("city_id"),
        state_id: getIntOrNull("state_id"),
        country_id: getIntOrNull("country_id"),
        university_id: getIntOrNull("university_id"),
        employee_id: getIntOrNull("employee_id"),
        updated_at: new Date().toISOString(),
      }}
    );
  } catch (e) {
    console.error("[admin/ads/colleges-list updateRow]", e);
  }
  revalidatePath("/admin/ads/colleges-list");
  revalidatePath("/", "layout");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;
const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdsCollegesListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const q      = (sp.q ?? "").trim();
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const status = sp.status ?? "all";
  const offset = (page - 1) * PAGE_SIZE;

  const db = await getDb();
  const col = db.collection("ads_top_college_lists");

  const mongoFilter: Record<string, any> = {};
  if (status === "active")  mongoFilter.status = { $in: [1, true, "1"] };
  if (status === "pending") mongoFilter.status = { $in: [0, false, "0", null] };

  const pipeline: any[] = [
    { $match: mongoFilter },
    {
      $addFields: {
        parsed_collegeprofile_id: {
          $let: {
            vars: {
              strVal: { 
                $cond: {
                  if: { $eq: [{ $type: "$collegeprofile_id" }, "string"] },
                  then: { $trim: { input: "$collegeprofile_id" } },
                  else: null
                }
              }
            },
            in: {
              $cond: {
                if: { $isNumber: "$collegeprofile_id" },
                then: "$collegeprofile_id",
                else: {
                  $cond: {
                    if: { $and: [{ $ne: ["$$strVal", ""] }, { $ne: ["$$strVal", "NULL"] }, { $ne: ["$$strVal", null] }] },
                    then: { $toInt: { $first: { $split: ["$$strVal", ","] } } },
                    else: null
                  }
                }
              }
            }
          }
        }
      }
    },
    { $lookup: { from: "collegeprofile", localField: "parsed_collegeprofile_id", foreignField: "id", as: "cp" } },
    { $unwind: { path: "$cp", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: "users", localField: "cp.users_id", foreignField: "id", as: "u" } },
    { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
    { $project: {
      _id: 0, id: 1, method_type: 1, status: 1, created_at: 1, updated_at: 1,
      collegeprofile_id: { $ifNull: ["$parsed_collegeprofile_id", "$collegeprofile_id"] }, functionalarea_id: 1, degree_id: 1, course_id: 1,
      educationlevel_id: 1, city_id: 1, state_id: 1, country_id: 1, university_id: 1, employee_id: 1,
      college_name: { $ifNull: ["$u.firstname", "Unnamed College"] },
      email: { $ifNull: ["$cp.contactpersonemail", null] },
      contact_name: { $ifNull: ["$cp.contactpersonname", null] },
      phone: { $ifNull: ["$cp.contactpersonnumber", null] },
    }},
    ...(q ? [{ $match: { $or: [
      { college_name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { contact_name: { $regex: q, $options: "i" } },
    ]}}] : []),
    { $sort: { created_at: -1 } },
    { $facet: {
      data: [{ $skip: offset }, { $limit: PAGE_SIZE }],
      total: [{ $count: "count" }],
    }},
  ];

  const [aggResult, statsResult, collegeOpsRaw, degreeOpsRaw, courseOpsRaw, cityOpsRaw, stateOpsRaw] = await Promise.all([
    col.aggregate(pipeline).toArray(),
    col.aggregate([{ $group: { _id: null,
      total: { $sum: 1 },
      active: { $sum: { $cond: [{ $in: ["$status", [1, true, "1"]] }, 1, 0] } },
      pending: { $sum: { $cond: [{ $in: ["$status", [0, false, "0", null]] }, 1, 0] } },
    }}]).toArray(),
    db.collection("collegeprofile").aggregate([
      { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "u" } },
      { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, id: 1, name: { $ifNull: ["$u.firstname", ""] } } },
      { $match: { name: { $ne: "" } } },
      { $sort: { name: 1 } },
    ]).toArray(),
    db.collection("degree").find({}, { projection: { _id: 0, id: 1, name: 1 } }).sort({ name: 1 }).toArray(),
    db.collection("course").find({}, { projection: { _id: 0, id: 1, name: 1 } }).sort({ name: 1 }).toArray(),
    db.collection("city").find({}, { projection: { _id: 0, id: 1, name: 1 } }).sort({ name: 1 }).toArray(),
    db.collection("state").find({}, { projection: { _id: 0, id: 1, name: 1 } }).sort({ name: 1 }).toArray(),
  ]);

  const raw = aggResult[0] ?? { data: [], total: [] };
  const total = Number(raw.total?.[0]?.count ?? 0);
  const stats = statsResult[0] ?? { total: 0, active: 0, pending: 0 };

  const collegesRows = (raw.data ?? []).map((a: any) => ({
    id: Number(a.id ?? 0),
    method_type: a.method_type ? String(a.method_type) : null,
    status: a.status === 1 || a.status === true || a.status === "1" ? 1 : 0,
    created_at: a.created_at ? String(a.created_at) : "",
    updated_at: a.updated_at ? String(a.updated_at) : "",
    college_name: String(a.college_name ?? "Unnamed College"),
    email: a.email ? String(a.email) : null,
    contact_name: a.contact_name ? String(a.contact_name) : null,
    phone: a.phone ? String(a.phone) : null,
    collegeprofile_id: a.collegeprofile_id ? Number(a.collegeprofile_id) : null,
    functionalarea_id: a.functionalarea_id ? Number(a.functionalarea_id) : null,
    degree_id: a.degree_id ? Number(a.degree_id) : null,
    course_id: a.course_id ? Number(a.course_id) : null,
    educationlevel_id: a.educationlevel_id ? Number(a.educationlevel_id) : null,
    city_id: a.city_id ? Number(a.city_id) : null,
    state_id: a.state_id ? Number(a.state_id) : null,
    country_id: a.country_id ? Number(a.country_id) : null,
    university_id: a.university_id ? Number(a.university_id) : null,
    employee_id: a.employee_id ? Number(a.employee_id) : null,
  }));

  const collegeOps = collegeOpsRaw.map((c: any) => ({ id: Number(c.id), name: String(c.name) }));
  const degreeOps  = degreeOpsRaw.map((c: any) => ({ id: Number(c.id), name: String(c.name) }));
  const courseOps  = courseOpsRaw.map((c: any) => ({ id: Number(c.id), name: String(c.name) }));
  const cityOps    = cityOpsRaw.map((c: any) => ({ id: Number(c.id), name: String(c.name) }));
  const stateOps   = stateOpsRaw.map((c: any) => ({ id: Number(c.id), name: String(c.name) }));

  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: "1", status, ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== "" && v !== "1" && v !== "all")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/ads/colleges-list${qs ? `?${qs}` : ""}`;
  }

  const STAT_CARDS = [
    { label: "Total", value: stats?.total ?? 0, icon: "list_alt", accent: "bg-blue-50 text-blue-600" },
    { label: "Inactive", value: stats?.pending ?? 0, icon: "pending", accent: "bg-amber-50 text-amber-600" },
    { label: "Active", value: stats?.active ?? 0, icon: "check_circle", accent: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>list_alt</span>
            ADS Colleges List
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Colleges registered for advertisement services.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STAT_CARDS.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`${card.accent} p-2.5 rounded-xl flex-shrink-0`}>
              <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>{card.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 leading-tight">{card.value}</p>
              <p className="text-xs font-semibold text-slate-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center">
        <form method="GET" action="/admin/ads/colleges-list" className="flex-1 w-full">
          <div className="relative group">
            <button
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 hover:text-blue-600 transition-colors z-10 p-1"
              style={ICO}
              title="Search"
            >
              search
            </button>
            <input
              name="q" defaultValue={q} placeholder="Search college, email, or contact..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition group-hover:border-slate-300"
            />
          </div>
        </form>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {["all", "pending", "active"].map((s) => (
            <Link
              key={s} href={buildUrl({ q, page: 1, status: s })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${status === s ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      <AdsCollegesListClient
        colleges={collegesRows}
        total={total}
        offset={offset}
        pageSize={PAGE_SIZE}
        q={q}
        toggleAction={toggleAdRowStatus}
        deleteAction={deleteAdRow}
        updateAction={updateAdRow}
        createAction={createAdRow}
        options={{
          colleges: collegeOps,
          degrees: degreeOps,
          courses: courseOps,
          cities: cityOps,
          states: stateOps,
        }}
      />
    </div>
  );
}
