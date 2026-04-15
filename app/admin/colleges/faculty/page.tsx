import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import FacultyListClient from "./FacultyListClient";

export const dynamic = "force-dynamic";

async function createFaculty(formData: FormData) {
  "use server";
  const db = await getDb();
  const collegeprofile_id = Number(formData.get("collegeprofile_id"));
  const name = String(formData.get("name") || "");
  if (!collegeprofile_id || !name) return;
  try {
    const last = await db.collection("faculty").find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray();
    const nextId = ((last[0]?.id as number) ?? 0) + 1;
    await db.collection("faculty").insertOne({
      id: nextId, collegeprofile_id, name,
      suffix: String(formData.get("suffix") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      description: String(formData.get("description") || ""),
      languageKnown: String(formData.get("languageKnown") || ""),
      sortorder: String(formData.get("sortorder") || "0"),
      gender: formData.get("gender") ? Number(formData.get("gender")) : null,
      dob: String(formData.get("dob") || "") || null,
      created_at: new Date(), updated_at: new Date(),
    });
  } catch (e) { console.error("[admin/colleges/faculty createFaculty]", e); }
  revalidatePath("/admin/colleges/faculty");
}

async function updateFaculty(formData: FormData) {
  "use server";
  const db = await getDb();
  const id = Number(formData.get("id"));
  const collegeprofile_id = Number(formData.get("collegeprofile_id"));
  const name = String(formData.get("name") || "");
  if (!id || !collegeprofile_id || !name) return;
  try {
    await db.collection("faculty").updateOne({ id }, {
      $set: {
        collegeprofile_id, name,
        suffix: String(formData.get("suffix") || ""),
        email: String(formData.get("email") || ""),
        phone: String(formData.get("phone") || ""),
        description: String(formData.get("description") || ""),
        languageKnown: String(formData.get("languageKnown") || ""),
        sortorder: String(formData.get("sortorder") || "0"),
        gender: formData.get("gender") ? Number(formData.get("gender")) : null,
        dob: String(formData.get("dob") || "") || null,
        updated_at: new Date(),
      }
    });
  } catch (e) { console.error("[admin/colleges/faculty updateFaculty]", e); }
  revalidatePath("/admin/colleges/faculty");
}

async function deleteFaculty(id: number) {
  "use server";
  if (!id) return;
  try {
    const db = await getDb();
    await db.collection("faculty").deleteOne({ id });
  } catch (e) { console.error("[admin/colleges/faculty deleteFaculty]", e); }
  revalidatePath("/admin/colleges/faculty");
  revalidatePath("/", "layout");
}

const PAGE_SIZE = 15;

interface FacultyRow { id: number; name: string; suffix: string | null; designation_name: string | null; email: string | null; phone: string | null; imagename: string | null; college_name: string; collegeprofile_id: string; description: string | null; languageKnown: string | null; sortorder: string | null; gender: number | null; dob: string | null; }
interface CollegeOption { id: number; name: string; }

export default async function CollegeFacultyPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const collegeId = sp.collegeId ?? "";
  const facultyName = (sp.facultyName ?? "").trim();
  const email = (sp.email ?? "").trim();
  const phone = (sp.phone ?? "").trim();
  const collegeName = (sp.collegeName ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const db = await getDb();

  // Build filter
  const match: Record<string, unknown> = {};
  if (collegeId) match.collegeprofile_id = Number(collegeId);
  if (facultyName) match.name = { $regex: facultyName, $options: "i" };
  if (email) match.email = { $regex: email, $options: "i" };
  if (phone) match.phone = { $regex: phone, $options: "i" };
  if (q) match.$or = [
    { name: { $regex: q, $options: "i" } },
    { email: { $regex: q, $options: "i" } },
    { phone: { $regex: q, $options: "i" } },
  ];

  const [total, facRows] = await Promise.all([
    db.collection("faculty").countDocuments(match),
    db.collection("faculty").find(match).sort({ created_at: -1 }).skip(offset).limit(PAGE_SIZE).toArray(),
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

  // Filter by college name if provided
  let facultyMembers: FacultyRow[] = facRows
    .filter((f: any) => {
      if (!collegeName) return true;
      const cn = cpMap.get(Number(f.collegeprofile_id)) || "";
      return cn.toLowerCase().includes(collegeName.toLowerCase());
    })
    .map((f: any) => ({
      id: Number(f.id),
      name: String(f.name || "").trim(),
      suffix: String(f.suffix || "").trim() || null,
      designation_name: String(f.description || "").trim() || null,
      email: String(f.email || "").trim() || null,
      phone: String(f.phone || "").trim() || null,
      imagename: String(f.imagename || "").trim() || null,
      college_name: cpMap.get(Number(f.collegeprofile_id)) || "Unknown College",
      collegeprofile_id: String(f.collegeprofile_id),
      description: String(f.description || "").trim() || null,
      languageKnown: String(f.languageKnown || "").trim() || null,
      sortorder: String(f.sortorder || "").trim() || null,
      gender: f.gender != null ? Number(f.gender) : null,
      dob: f.dob ? String(f.dob).trim() : null,
    }));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // College options for dropdown
  const collegeOptions = await db.collection("collegeprofile").aggregate([
    { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, id: 1, name: { $ifNull: [{ $trim: { input: "$user.firstname" } }, "$slug"] } } },
    { $sort: { name: 1 } }, { $limit: 500 },
  ]).toArray();
  const colleges: CollegeOption[] = collegeOptions.map((c: any) => ({ id: Number(c.id), name: String(c.name || "").trim() }));

  return (
    <div className="p-6 space-y-6 w-full overflow-x-hidden">
      <FacultyListClient
        facultyMembers={JSON.parse(JSON.stringify(facultyMembers))}
        colleges={JSON.parse(JSON.stringify(colleges))}
        total={total}
        page={page}
        totalPages={totalPages}
        offset={offset}
        pageSize={PAGE_SIZE}
        q={q}
        collegeId={collegeId}
        facultyName={facultyName}
        email={email}
        phone={phone}
        collegeName={collegeName}
        createFaculty={createFaculty}
        updateFaculty={updateFaculty}
        deleteFaculty={deleteFaculty}
      />
    </div>
  );
}
