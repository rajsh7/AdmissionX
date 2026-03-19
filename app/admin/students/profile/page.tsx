import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { revalidatePath } from "next/cache";
import StudentProfileClient from "./StudentProfileClient";

const PAGE_SIZE = 25;

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = []
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/students/profile safeQuery]", err);
    return [];
  }
}

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createProfile(formData: FormData) {
  "use server";
  const users_id = parseInt(formData.get("users_id") as string, 10);
  const gender = formData.get("gender") as string || "Default";
  const dateofbirth = formData.get("dateofbirth") as string || "2000-01-01";
  const parentsname = formData.get("parentsname") as string || "";
  const parentsnumber = formData.get("parentsnumber") as string || "";
  const hobbies = formData.get("hobbies") as string || "";
  const interests = formData.get("interests") as string || "";
  const projects = formData.get("projects") as string || "";
  const entranceexamname = formData.get("entranceexamname") as string || "";
  const entranceexamnumber = formData.get("entranceexamnumber") as string || "";

  if (isNaN(users_id)) return;

  try {
    await pool.query(
      `INSERT INTO studentprofile 
        (users_id, gender, dateofbirth, parentsname, parentsnumber, entranceexamname, entranceexamnumber, hobbies, interests, projects, created_at, updated_at, slug) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
      [users_id, gender, dateofbirth, parentsname, parentsnumber, entranceexamname, entranceexamnumber, hobbies, interests, projects, `user-${users_id}-${Date.now()}`]
    );
  } catch (e) {
    console.error("[admin/students/profile createProfile]", e);
  }
  revalidatePath("/admin/students/profile");
}

async function updateProfile(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const users_id = parseInt(formData.get("users_id") as string, 10);
  const gender = formData.get("gender") as string;
  const dateofbirth = formData.get("dateofbirth") as string;
  const parentsname = formData.get("parentsname") as string;
  const parentsnumber = formData.get("parentsnumber") as string;
  const hobbies = formData.get("hobbies") as string;
  const interests = formData.get("interests") as string;
  const projects = formData.get("projects") as string;
  const entranceexamname = formData.get("entranceexamname") as string;
  const entranceexamnumber = formData.get("entranceexamnumber") as string;

  if (isNaN(id) || isNaN(users_id)) return;

  try {
    await pool.query(
      `UPDATE studentprofile SET 
        users_id = ?, gender = ?, dateofbirth = ?, parentsname = ?, parentsnumber = ?, entranceexamname = ?, entranceexamnumber = ?, hobbies = ?, interests = ?, projects = ?, updated_at = NOW()
       WHERE id = ?`,
      [users_id, gender, dateofbirth, parentsname, parentsnumber, entranceexamname, entranceexamnumber, hobbies, interests, projects, id]
    );
  } catch (e) {
    console.error("[admin/students/profile updateProfile]", e);
  }
  revalidatePath("/admin/students/profile");
}

async function deleteProfile(id: number) {
  "use server";
  if (!id) return;
  try {
    await pool.query("DELETE FROM studentprofile WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/students/profile deleteProfile]", e);
  }
  revalidatePath("/admin/students/profile");
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface StudentProfileRow extends RowDataPacket {
  id: number;
  users_id: number;
  student_name: string;
  student_email: string;
  gender: string;
  dateofbirth: string;
  parentsname: string;
  parentsnumber: string;
  entranceexamname: string;
  entranceexamnumber: string;
  hobbies: string;
  interests: string;
  projects: string;
  created_at: string;
  updated_at: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
}

export default async function StudentProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(s.name LIKE ? OR s.email LIKE ? OR sp.parentsname LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [profiles, countRows, users] = await Promise.all([
    safeQuery<StudentProfileRow>(
      `SELECT sp.*, s.name as student_name, s.email as student_email
       FROM studentprofile sp
       LEFT JOIN next_student_signups s ON sp.users_id = s.id
       ${where}
       ORDER BY sp.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset]
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total 
       FROM studentprofile sp
       LEFT JOIN next_student_signups s ON sp.users_id = s.id
       ${where}`,
      params
    ),
    safeQuery<UserRow>(`SELECT id, name, email FROM next_student_signups ORDER BY name ASC LIMIT 1000`)
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <StudentProfileClient 
        profiles={JSON.parse(JSON.stringify(profiles))}
        users={JSON.parse(JSON.stringify(users))}
        offset={offset}
        PAGE_SIZE={PAGE_SIZE}
        total={total}
        totalPages={totalPages}
        q={q}
        createProfile={createProfile}
        updateProfile={updateProfile}
        deleteProfile={deleteProfile}
      />
    </div>
  );
}
