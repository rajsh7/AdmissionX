import { getDb } from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import PlacementListClient from "./PlacementListClient";

export const dynamic = "force-dynamic";

async function createPlacement(formData: FormData) {
  "use server";
  const db = await getDb();
  const collegeprofile_id = Number(formData.get("collegeprofile_id"));
  try {
    const last = await db.collection("placement").find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray();
    const nextId = ((last[0]?.id as number) ?? 0) + 1;
    await db.collection("placement").insertOne({
      id: nextId, collegeprofile_id,
      numberofrecruitingcompany: String(formData.get("numberofrecruitingcompany") || "") || null,
      ctchighest: String(formData.get("ctchighest") || "") || null,
      ctclowest: String(formData.get("ctclowest") || "") || null,
      ctcaverage: String(formData.get("ctcaverage") || "") || null,
      placementinfo: String(formData.get("placementinfo") || "") || null,
      created_at: new Date(), updated_at: new Date(),
    });
  } catch (e) { console.error("[admin/colleges/placements createAction]", e); }
  revalidatePath("/admin/colleges/placements");
}

async function updatePlacement(formData: FormData) {
  "use server";
  const db = await getDb();
  const id = Number(formData.get("id"));
  const collegeprofile_id = Number(formData.get("collegeprofile_id"));
  try {
    await db.collection("placement").updateOne({ id }, {
      $set: {
        collegeprofile_id,
        numberofrecruitingcompany: String(formData.get("numberofrecruitingcompany") || "") || null,
        ctchighest: String(formData.get("ctchighest") || "") || null,
        ctclowest: String(formData.get("ctclowest") || "") || null,
        ctcaverage: String(formData.get("ctcaverage") || "") || null,
        placementinfo: String(formData.get("placementinfo") || "") || null,
        updated_at: new Date(),
      }
    });
  } catch (e) { console.error("[admin/colleges/placements updateAction]", e); }
  revalidatePath("/admin/colleges/placements");
}

async function deletePlacementRow(id: number) {
  "use server";
  try {
    const db = await getDb();
    await db.collection("placement").deleteOne({ id });
  } catch (e) { console.error("[admin/colleges/placements deleteAction]", e); }
  revalidatePath("/admin/colleges/placements");
}

const PAGE_SIZE = 45;

interface PlacementRow {
  id: number;
  collegeprofile_id: number;
  college_name: string;
  recruiting_companies: string;
  highest_ctc: string;
  lowest_ctc: string;
  average_ctc: string;
  placement_info: string;
}

interface OptionRow {
  id: number;
  name: string;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function CollegePlacementsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const collegeId = (sp.collegeId ?? "").trim();
  const highestCtc = (sp.highestCtc ?? "").trim();
  const lowestCtc = (sp.lowestCtc ?? "").trim();
  const averageCtc = (sp.averageCtc ?? "").trim();
  const recruitingCompanies = (sp.recruitingCompanies ?? "").trim();
  const placementInfo = (sp.placementInfo ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const db = await getDb();

  // Build filter
  const match: Record<string, unknown> = {};
  if (collegeId) match.collegeprofile_id = Number(collegeId);
  if (highestCtc) match.ctchighest = { $regex: highestCtc, $options: "i" };
  if (lowestCtc) match.ctclowest = { $regex: lowestCtc, $options: "i" };
  if (averageCtc) match.ctcaverage = { $regex: averageCtc, $options: "i" };
  if (recruitingCompanies) match.numberofrecruitingcompany = { $regex: recruitingCompanies, $options: "i" };
  if (placementInfo) match.placementinfo = { $regex: placementInfo, $options: "i" };
  if (q) match.$or = [
    { placementinfo: { $regex: q, $options: "i" } },
    { ctchighest: { $regex: q, $options: "i" } },
  ];

  const [total, placementRows] = await Promise.all([
    db.collection("placement").countDocuments(match),
    db.collection("placement").find(match).sort({ created_at: -1 }).skip(offset).limit(PAGE_SIZE).toArray(),
  ]);

  // Batch lookup college names
  const cpIds = [...new Set(placementRows.map((p: any) => Number(p.collegeprofile_id)).filter(Boolean))];
  const cpRows = cpIds.length > 0
    ? await db.collection("collegeprofile").aggregate([
        { $match: { id: { $in: cpIds } } },
        { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        { $project: { _id: 0, id: 1, name: { $ifNull: ["$user.firstname", "$slug"] } } },
      ]).toArray()
    : [];
  const cpMap = new Map(cpRows.map((c: any) => [Number(c.id), String(c.name || "").trim()]));

  const placements: PlacementRow[] = placementRows.map((p: any) => ({
    id: Number(p.id),
    collegeprofile_id: Number(p.collegeprofile_id),
    college_name: cpMap.get(Number(p.collegeprofile_id)) || "Unknown College",
    recruiting_companies: String(p.numberofrecruitingcompany || "").trim(),
    highest_ctc: String(p.ctchighest || "").trim(),
    lowest_ctc: String(p.ctclowest || "").trim(),
    average_ctc: String(p.ctcaverage || "").trim(),
    placement_info: String(p.placementinfo || "").trim(),
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // College options
  const collegeOptions = await db.collection("collegeprofile").aggregate([
    { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, id: 1, name: { $ifNull: [{ $trim: { input: "$user.firstname" } }, "$slug"] } } },
    { $sort: { name: 1 } }, { $limit: 500 },
  ]).toArray();
  const colleges: OptionRow[] = collegeOptions.map((c: any) => ({ id: Number(c.id), name: String(c.name || "").trim() }));

  const buildPageHref = (targetPage: number) => {
    const query = new URLSearchParams({ page: String(targetPage) });
    if (q) query.set("q", q);
    if (collegeId) query.set("collegeId", collegeId);
    if (highestCtc) query.set("highestCtc", highestCtc);
    if (lowestCtc) query.set("lowestCtc", lowestCtc);
    if (averageCtc) query.set("averageCtc", averageCtc);
    if (recruitingCompanies) query.set("recruitingCompanies", recruitingCompanies);
    if (placementInfo) query.set("placementInfo", placementInfo);
    return `/admin/colleges/placements?${query.toString()}`;
  };

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>monitoring</span>
            Placement stats
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Track and manage college placement records and CTC data.</p>
        </div>
        <form method="GET" action="/admin/colleges/placements" className="w-full sm:w-80">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
            <input type="text" name="q" defaultValue={q} placeholder="Search colleges, placement info..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
          </div>
        </form>
      </div>

      <PlacementListClient
        placements={JSON.parse(JSON.stringify(placements))}
        colleges={JSON.parse(JSON.stringify(colleges))}
        offset={offset}
        total={total}
        pageSize={PAGE_SIZE}
        page={page}
        totalPages={totalPages}
        searchQuery={q}
        selectedCollegeId={collegeId}
        selectedHighestCtc={highestCtc}
        selectedLowestCtc={lowestCtc}
        selectedAverageCtc={averageCtc}
        selectedRecruitingCompanies={recruitingCompanies}
        selectedPlacementInfo={placementInfo}
        onAdd={createPlacement}
        onDelete={deletePlacementRow}
      />
    </div>
  );
}
