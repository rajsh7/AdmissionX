import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import { fetchCollegeOptions } from "../_components/college-options";
import CollegeFilterBar from "../_components/CollegeFilterBar";
import FacultyListClient from "./FacultyListClient";

async function createFaculty(formData: FormData) {
  "use server";
  const collegeprofile_id = formData.get("collegeprofile_id") as string;
  const name = formData.get("name") as string;
  if (!collegeprofile_id || !name) return;
  try {
    await pool.query(
      `INSERT INTO faculty (collegeprofile_id, name, suffix, email, phone, description, languageKnown, sortorder, gender, dob, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [collegeprofile_id, name, formData.get("suffix") as string || "", formData.get("email") as string || "", formData.get("phone") as string || "", formData.get("description") as string || "", formData.get("languageKnown") as string || "", formData.get("sortorder") as string || "0", formData.get("gender") ? parseInt(formData.get("gender") as string, 10) : null, formData.get("dob") as string || null]
    );
  } catch (e) { console.error("[admin/colleges/faculty createFaculty]", e); }
  revalidatePath("/admin/colleges/faculty");
}

async function updateFaculty(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const collegeprofile_id = formData.get("collegeprofile_id") as string;
  const name = formData.get("name") as string;
  if (isNaN(id) || !collegeprofile_id || !name) return;
  try {
    await pool.query(
      `UPDATE faculty SET collegeprofile_id=?, name=?, suffix=?, email=?, phone=?, description=?, languageKnown=?, sortorder=?, gender=?, dob=?, updated_at=NOW() WHERE id=?`,
      [collegeprofile_id, name, formData.get("suffix") as string || "", formData.get("email") as string || "", formData.get("phone") as string || "", formData.get("description") as string || "", formData.get("languageKnown") as string || "", formData.get("sortorder") as string || "0", formData.get("gender") ? parseInt(formData.get("gender") as string, 10) : null, formData.get("dob") as string || null, id]
    );
  } catch (e) { console.error("[admin/colleges/faculty updateFaculty]", e); }
  revalidatePath("/admin/colleges/faculty");
}

async function deleteFaculty(id: number) {
  "use server";
  if (isNaN(id)) return;
  try { await pool.query("DELETE FROM faculty WHERE id = ?", [id]); }
  catch (e) { console.error("[admin/colleges/faculty deleteFaculty]", e); }
  revalidatePath("/admin/colleges/faculty");
  revalidatePath("/", "layout");
}

const PAGE_SIZE = 15;
async function safeQuery<T>(sql: string, params: (string | number)[] = []): Promise<T[]> {
  try { const [rows] = (await pool.query(sql, params)) as [T[], unknown]; return rows; }
  catch (err) { console.error("[admin/colleges/faculty safeQuery]", err); return []; }
}

interface FacultyRow { id: number; name: string; suffix: string | null; designation_name: string | null; email: string | null; phone: string | null; imagename: string | null; college_name: string; collegeprofile_id: string; description: string | null; languageKnown: string | null; sortorder: string | null; gender: number | null; dob: string | null; }
interface CountRow { total: number; }
interface CollegeOption { id: number; name: string; }

export default async function CollegeFacultyPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp          = await searchParams;
  const q           = (sp.q ?? "").trim();
  const collegeId   = sp.collegeId ?? "";
  const facultyName = (sp.facultyName ?? "").trim();
  const email       = (sp.email ?? "").trim();
  const phone       = (sp.phone ?? "").trim();
  const collegeName = (sp.collegeName ?? "").trim();
  const page        = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset      = (page - 1) * PAGE_SIZE;

  const conditions: string[] = [];
  const params: (string | number)[] = [];
  if (q)           { conditions.push("(f.name LIKE ? OR u.firstname LIKE ? OR f.email LIKE ? OR f.phone LIKE ?)"); params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`); }
  if (collegeId)   { conditions.push("f.collegeprofile_id = ?"); params.push(collegeId); }
  if (facultyName) { conditions.push("f.name LIKE ?"); params.push(`%${facultyName}%`); }
  if (email)       { conditions.push("f.email LIKE ?"); params.push(`%${email}%`); }
  if (phone)       { conditions.push("f.phone LIKE ?"); params.push(`%${phone}%`); }
  if (collegeName) { conditions.push("u.firstname LIKE ?"); params.push(`%${collegeName}%`); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [facultyMembers, countRows, colleges, collegeOptions] = await Promise.all([
    safeQuery<FacultyRow>(
      `SELECT f.id, f.name, f.suffix, f.email, f.phone, f.imagename, f.description, f.languageKnown, f.sortorder, f.gender,
        CASE WHEN f.dob IS NULL OR f.dob='0000-00-00' OR f.dob='0000-00-00 00:00:00' THEN NULL ELSE DATE_FORMAT(f.dob,'%Y-%m-%d') END as dob,
        f.collegeprofile_id, COALESCE(u.firstname,'Unnamed College') as college_name, 'Senior Professor' as designation_name
       FROM faculty f JOIN collegeprofile cp ON cp.id=f.collegeprofile_id JOIN users u ON u.id=cp.users_id ${where} ORDER BY f.created_at DESC LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(`SELECT COUNT(*) AS total FROM faculty f JOIN collegeprofile cp ON cp.id=f.collegeprofile_id JOIN users u ON u.id=cp.users_id ${where}`, params),
    safeQuery<CollegeOption>(`SELECT cp.id, COALESCE(u.firstname,'Unnamed College') as name FROM collegeprofile cp JOIN users u ON u.id=cp.users_id ORDER BY u.firstname ASC LIMIT 500`),
    fetchCollegeOptions(),
  ]);

  const total      = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 w-full overflow-x-hidden">
      <CollegeFilterBar
        colleges={collegeOptions}
        selectedId={collegeId}
        total={total}
        label="College Faculty"
        icon="groups"
        description="Manage faculty members — filter by college to see classified data."
      />
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
