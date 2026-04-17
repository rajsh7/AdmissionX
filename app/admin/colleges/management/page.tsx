import pool, { getDb } from "@/lib/db";
import Link from "next/link";
import { revalidatePath, unstable_cache } from "next/cache";
import ManagementListClient from "./ManagementListClient";

const PAGE_SIZE = 45;

interface ManagementRow {
  id: number;
  collegeprofile_id: number;
  name: string;
  suffix: string;
  designation: string;
  emailaddress: string;
  phoneno: string;
  picture: string;
  college_name: string;
}

interface OptionRow {
  id: number;
  name: string;
}

interface AggregatedManagementResult {
  data?: Partial<ManagementRow>[];
  total?: { total?: number }[];
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const parsed = String(value).trim();
  return parsed ? parsed : null;
}

const getCachedCollegeOptions = unstable_cache(
  async (): Promise<OptionRow[]> => {
    try {
      const db = await getDb();
      const rows = await db
        .collection("collegeprofile")
        .aggregate([
          {
            $lookup: {
              from: "users",
              localField: "users_id",
              foreignField: "id",
              as: "user",
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 0,
              id: { $toInt: "$id" },
              name: {
                $trim: {
                  input: { $ifNull: ["$user.firstname", "Unnamed College"] },
                },
              },
            },
          },
          { $sort: { name: 1, id: 1 } },
        ])
        .toArray();

      return rows.map((row, idx) => ({
        id: Number(row.id) || idx + 1,
        name: String(row.name || "Unnamed College"),
      }));
    } catch (error) {
      console.error("[admin/colleges/management colleges]", error);
      return [];
    }
  },
  ["admin-colleges-management-college-options-v1"],
  { revalidate: 300 },
);

export default async function CollegeManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const collegeId = (sp.collegeId ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const db = await getDb();
  const mgmtCollection = db.collection("faculty");

  // Build base match conditions
  const match: any = {};
  if (collegeId) {
    const collegeIdNumber = Number(collegeId);
    if (Number.isFinite(collegeIdNumber)) {
      match.collegeprofile_id = collegeIdNumber;
    }
  }

  // Get total count first
  const total = await mgmtCollection.countDocuments(match);

  // Get paginated management records with minimal projection
  const managementRecords = await mgmtCollection
    .find(match, {
      projection: {
        id: 1,
        collegeprofile_id: 1,
        name: 1,
        suffix: 1,
        designation: 1,
        emailaddress: 1,
        phoneno: 1,
        picture: 1,
      }
    })
    .sort({ created_at: -1, id: -1 })
    .skip(offset)
    .limit(PAGE_SIZE)
    .toArray();

  // Get unique college IDs for batch lookup
  const collegeIds = [...new Set(managementRecords.map(m => m.collegeprofile_id).filter(Boolean))];

  // Batch lookup colleges with user data
  const [colleges] = await Promise.all([
    collegeIds.length > 0 ? db.collection("collegeprofile").aggregate([
      { $match: { id: { $in: collegeIds } } },
      {
        $lookup: {
          from: "users",
          localField: "users_id",
          foreignField: "id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          id: 1,
          name: { $ifNull: ["$user.firstname", "Unnamed College"] },
        },
      },
    ]).toArray() : Promise.resolve([]),
  ]);

  // Create lookup map for fast access
  const collegeMap = new Map(colleges.map(c => [c.id, c.name]));

  // Enrich management records with college names
  const cleanMembers = managementRecords.map((member, idx) => ({
    id: Number(member.id) || idx + 1,
    collegeprofile_id: Number(member.collegeprofile_id) || 0,
    name: toStringOrNull(member.name) || "",
    suffix: toStringOrNull(member.suffix) || "",
    designation: toStringOrNull(member.designation) || toStringOrNull(member.description) || "",
    emailaddress: toStringOrNull(member.emailaddress) || toStringOrNull(member.email) || "",
    phoneno: toStringOrNull(member.phoneno) || toStringOrNull(member.phone) || "",
    picture: toStringOrNull(member.picture) || toStringOrNull(member.imagename) || "",
    college_name: collegeMap.get(member.collegeprofile_id) ?? "Unnamed College",
  }));

  // Handle search query
  let finalMembers = cleanMembers;
  let finalTotal = total;

  if (q) {
    const searchRegex = new RegExp(escapeRegex(q), "i");

    // Filter already fetched records
    const filteredMembers = cleanMembers.filter(member =>
      searchRegex.test(member.name) ||
      searchRegex.test(member.designation) ||
      searchRegex.test(member.emailaddress) ||
      searchRegex.test(member.phoneno) ||
      searchRegex.test(member.college_name)
    );

    // If we have enough filtered results, use them
    if (filteredMembers.length >= PAGE_SIZE) {
      finalMembers = filteredMembers.slice(0, PAGE_SIZE);
      finalTotal = filteredMembers.length;
    } else {
      // Need to search all data for accurate results
      const allRecords = await mgmtCollection.find(match).toArray();

      // Get all unique college IDs
      const allCollegeIds = [...new Set(allRecords.map(m => m.collegeprofile_id).filter(Boolean))];

      const [allColleges] = await Promise.all([
        allCollegeIds.length > 0 ? db.collection("collegeprofile").aggregate([
          { $match: { id: { $in: allCollegeIds } } },
          {
            $lookup: {
              from: "users",
              localField: "users_id",
              foreignField: "id",
              as: "user",
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 0,
              id: 1,
              name: { $ifNull: ["$user.firstname", "Unnamed College"] },
            },
          },
        ]).toArray() : Promise.resolve([]),
      ]);

      const allCollegeMap = new Map(allColleges.map(c => [c.id, c.name]));

      const enrichedAllMembers = allRecords.map((member, idx) => ({
        id: Number(member.id) || idx + 1,
        collegeprofile_id: Number(member.collegeprofile_id) || 0,
        name: toStringOrNull(member.name) || "",
        suffix: toStringOrNull(member.suffix) || "",
        designation: toStringOrNull(member.designation) || toStringOrNull(member.description) || "",
        emailaddress: toStringOrNull(member.emailaddress) || toStringOrNull(member.email) || "",
        phoneno: toStringOrNull(member.phoneno) || toStringOrNull(member.phone) || "",
        picture: toStringOrNull(member.picture) || toStringOrNull(member.imagename) || "",
        college_name: allCollegeMap.get(member.collegeprofile_id) ?? "Unnamed College",
      }));

      const searchedMembers = enrichedAllMembers.filter(member =>
        searchRegex.test(member.name) ||
        searchRegex.test(member.designation) ||
        searchRegex.test(member.emailaddress) ||
        searchRegex.test(member.phoneno) ||
        searchRegex.test(member.college_name)
      );

      finalMembers = searchedMembers.slice(offset, offset + PAGE_SIZE);
      finalTotal = searchedMembers.length;
    }
  }

  const cleanColleges = await getCachedCollegeOptions();
  const totalPages = Math.ceil(finalTotal / PAGE_SIZE);
  const buildPageHref = (targetPage: number) => {
    const query = new URLSearchParams({ page: String(targetPage) });
    if (q) query.set("q", q);
    if (collegeId) query.set("collegeId", collegeId);
    return `/admin/colleges/management?${query.toString()}`;
  };

  return (
    <div className="p-6 space-y-6 w-full overflow-x-hidden">
      <div className="bg-white rounded-md border border-slate-200 shadow-sm p-6 mb-6">
        <h1 className="text-[22px] font-semibold text-slate-500 mb-8 border-b border-slate-100 pb-3">
          Search College  Management Details
        </h1>

        <form method="GET" action="/admin/colleges/management" className="flex flex-col sm:flex-row items-start sm:items-end gap-6 sm:gap-8">
          <div className="relative flex-1 w-full relative">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-sm font-semibold text-slate-500">
              College Name
            </label>
            <select
              name="collegeId"
              defaultValue={collegeId}
              className="w-full border border-slate-200 rounded-md px-3 py-3 text-sm text-slate-600 bg-transparent focus:outline-none focus:border-red-500 appearance-none cursor-pointer"
            >
              <option value="">Select college</option>
              {cleanColleges.map((college, idx) => (
                <option key={`college-${college.id}-${idx}`} value={college.id}>
                  {college.name}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none material-symbols-rounded text-xl">
              keyboard_arrow_down
            </span>
          </div>

          <div className="relative flex-1 w-full">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-sm font-semibold text-slate-500">
              Search
            </label>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Enter name, email, phone..."
              className="w-full border border-slate-200 rounded-md px-3 py-3 text-sm text-slate-600 bg-transparent focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto h-[46px]">
            <Link
              href="/admin/colleges/management"
              className="flex items-center justify-center px-6 h-full rounded-md bg-[#9CA3AF] hover:bg-[#8A9ba8] text-white font-medium text-[15px] transition-colors w-full sm:w-auto min-w-[100px]"
            >
              Clear
            </Link>
            <button
              type="submit"
              className="flex items-center justify-center px-6 h-full rounded-md bg-[#FF3C3C] hover:bg-red-600 text-white font-medium text-[15px] transition-colors w-full sm:w-auto min-w-[100px]"
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      <ManagementListClient
        members={finalMembers}
        colleges={cleanColleges}
        offset={offset}
        total={finalTotal}
        page={page}
        totalPages={totalPages}
        search={q}
        selectedCollegeId={collegeId}
      />
    </div>
  );
}
