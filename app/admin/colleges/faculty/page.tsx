import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { revalidatePath } from "next/cache";
import FacultyListClient from "./FacultyListClient";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createFaculty(formData: FormData) {
  "use server";
  const collegeprofile_id = formData.get("collegeprofile_id") as string;
  const name = formData.get("name") as string;
  const suffix = formData.get("suffix") as string || "";
  const email = formData.get("email") as string || "";
  const phone = formData.get("phone") as string || "";
  const description = formData.get("description") as string || "";
  const languageKnown = formData.get("languageKnown") as string || "";
  const sortorder = formData.get("sortorder") as string || "0";
  const gender = formData.get("gender") ? parseInt(formData.get("gender") as string, 10) : null;
  const dob = formData.get("dob") as string || null;

  if (!collegeprofile_id || !name) return;

  try {
    await pool.query(
      `INSERT INTO faculty (collegeprofile_id, name, suffix, email, phone, description, languageKnown, sortorder, gender, dob, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [collegeprofile_id, name, suffix, email, phone, description, languageKnown, sortorder, gender, dob || null]
    );
  } catch (e) {
    console.error("[admin/colleges/faculty createFaculty]", e);
  }
  revalidatePath("/admin/colleges/faculty");
}

async function updateFaculty(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const collegeprofile_id = formData.get("collegeprofile_id") as string;
  const name = formData.get("name") as string;
  const suffix = formData.get("suffix") as string || "";
  const email = formData.get("email") as string || "";
  const phone = formData.get("phone") as string || "";
  const description = formData.get("description") as string || "";
  const languageKnown = formData.get("languageKnown") as string || "";
  const sortorder = formData.get("sortorder") as string || "0";
  const gender = formData.get("gender") ? parseInt(formData.get("gender") as string, 10) : null;
  const dob = formData.get("dob") as string || null;

  if (isNaN(id) || !collegeprofile_id || !name) return;

  try {
    await pool.query(
      `UPDATE faculty SET collegeprofile_id = ?, name = ?, suffix = ?, email = ?, phone = ?, description = ?, languageKnown = ?, sortorder = ?, gender = ?, dob = ?, updated_at = NOW()
       WHERE id = ?`,
      [collegeprofile_id, name, suffix, email, phone, description, languageKnown, sortorder, gender, dob || null, id]
    );
  } catch (e) {
    console.error("[admin/colleges/faculty updateFaculty]", e);
  }
  revalidatePath("/admin/colleges/faculty");
}

async function deleteFaculty(id: number) {
  "use server";
  if (!id) return;
  try {
    await pool.query("DELETE FROM faculty WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/colleges/faculty deleteFaculty]", e);
  }
  revalidatePath("/admin/colleges/faculty");
  revalidatePath("/", "layout");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/colleges/faculty safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FacultyRow extends RowDataPacket {
  id: number;
  name: string;
  suffix: string | null;
  designation_name: string | null;
  email: string | null;
  phone: string | null;
  imagename: string | null;
  college_name: string;
  collegeprofile_id: string;
  description: string | null;
  languageKnown: string | null;
  sortorder: string | null;
  gender: number | null;
  dob: string | null;
}

interface CountRow extends RowDataPacket { total: number; }
interface CollegeOption extends RowDataPacket { id: number; name: string; }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CollegeFacultyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp   = await searchParams;
  const q    = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(f.name LIKE ? OR u.firstname LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [facultyMembers, countRows, colleges] = await Promise.all([
    safeQuery<FacultyRow>(
      `SELECT 
        f.id,
        f.name,
        f.suffix,
        f.email,
        f.phone,
        f.imagename,
        f.description,
        f.languageKnown,
        f.sortorder,
        f.gender,
        f.dob,
        f.collegeprofile_id,
        COALESCE(u.firstname, 'Unnamed College') as college_name,
        'Senior Professor' as designation_name
       FROM faculty f
       JOIN collegeprofile cp ON cp.id = f.collegeprofile_id
       JOIN users u ON u.id = cp.users_id
       ${where}
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total 
       FROM faculty f 
       JOIN collegeprofile cp ON cp.id = f.collegeprofile_id
       JOIN users u ON u.id = cp.users_id
       ${where}`,
      params,
    ),
    safeQuery<CollegeOption>(
      `SELECT cp.id, COALESCE(u.firstname, 'Unnamed College') as name 
       FROM collegeprofile cp JOIN users u ON u.id = cp.users_id 
       ORDER BY u.firstname ASC LIMIT 500`
    ),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <FacultyListClient
        facultyMembers={JSON.parse(JSON.stringify(facultyMembers))}
        colleges={JSON.parse(JSON.stringify(colleges))}
        total={total}
        page={page}
        totalPages={totalPages}
        offset={offset}
        pageSize={PAGE_SIZE}
        q={q}
        createFaculty={createFaculty}
        updateFaculty={updateFaculty}
        deleteFaculty={deleteFaculty}
      />
    </div>
  );
}
