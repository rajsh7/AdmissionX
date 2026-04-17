import { getDb } from "@/lib/db";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import BookmarkClient from "./BookmarkClient";

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 25;
const FETCH_SIZE = 100;

async function safeQuery<T >(
  sql: string,
  params: (string | number)[] = []
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/students/bookmarks safeQuery]", err);
    return [];
  }
}

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createBookmark(formData: FormData) {
  "use server";
  const student_id = parseInt(formData.get("student_id") as string, 10);
  const bookmarktypeinfo_id = formData.get("bookmarktypeinfo_id") as string;
  const title = formData.get("title") as string;
  const url = formData.get("url") as string;
  const college_id = parseInt(formData.get("college_id") as string, 10) || 0;
  const course_id = parseInt(formData.get("course_id") as string, 10) || 0;
  const blog_id = parseInt(formData.get("blog_id") as string, 10) || 0;

  if (isNaN(student_id) || !bookmarktypeinfo_id || !title || !url) return;

  try {
    await pool.query(
      `INSERT INTO bookmarks 
        (student_id, college_id, course_id, blog_id, url, bookmarktypeinfo_id, title, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [student_id, college_id, course_id, blog_id, url, bookmarktypeinfo_id, title]
    );
  } catch (e) {
    console.error("[admin/students/bookmarks createBookmark]", e);
  }
  revalidatePath("/admin/students/bookmarks");
  revalidatePath("/student/dashboard/bookmarks");
}

async function updateBookmark(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const student_id = parseInt(formData.get("student_id") as string, 10);
  const bookmarktypeinfo_id = formData.get("bookmarktypeinfo_id") as string;
  const title = formData.get("title") as string;
  const url = formData.get("url") as string;
  const college_id = parseInt(formData.get("college_id") as string, 10) || 0;
  const course_id = parseInt(formData.get("course_id") as string, 10) || 0;
  const blog_id = parseInt(formData.get("blog_id") as string, 10) || 0;

  if (isNaN(id) || isNaN(student_id) || !bookmarktypeinfo_id || !title || !url) return;

  try {
    await pool.query(
      `UPDATE bookmarks SET 
        student_id = ?, college_id = ?, course_id = ?, blog_id = ?, url = ?, bookmarktypeinfo_id = ?, title = ?, updated_at = NOW()
       WHERE id = ?`,
      [student_id, college_id, course_id, blog_id, url, bookmarktypeinfo_id, title, id]
    );
  } catch (e) {
    console.error("[admin/students/bookmarks updateBookmark]", e);
  }
  revalidatePath("/admin/students/bookmarks");
  revalidatePath("/student/dashboard/bookmarks");
}

async function deleteBookmark(id: number) {
  "use server";
  if (isNaN(id)) return;
  try {
    await pool.query("DELETE FROM bookmarks WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/students/bookmarks deleteBookmark]", e);
  }
  revalidatePath("/admin/students/bookmarks");
  revalidatePath("/student/dashboard/bookmarks");
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface BookmarkRow  {
  id: number;
  student_id: number;
  college_id: number;
  course_id: number;
  blog_id: number;
  student_name: string;
  student_email: string;
  title: string;
  url: string;
  bookmarktypeinfo_id: string;
  type_name: string;
  created_at: string;
}

interface CountRow  {
  total: number;
}

interface UserRow  {
  id: number;
  name: string;
  email: string;
}

interface TypeRow  {
  id: number;
  name: string;
}

export default async function StudentBookmarksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const studentId = (sp.studentId ?? "").trim();
  const typeId = (sp.typeId ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * FETCH_SIZE;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(s.name LIKE ? OR s.email LIKE ? OR b.title LIKE ? OR b.url LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }

  if (studentId) {
    conditions.push("b.student_id = ?");
    params.push(studentId);
  }

  if (typeId) {
    conditions.push("b.bookmarktypeinfo_id = ?");
    params.push(typeId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [bookmarks, countRows, types] = await Promise.all([
    safeQuery<BookmarkRow>(
      `SELECT b.*, bt.name as type_name
       FROM bookmarks b
       LEFT JOIN bookmarktypeinfos bt ON b.bookmarktypeinfo_id = bt.id
       ${where}
       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, FETCH_SIZE, offset]
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM bookmarks b ${where}`,
      params
    ),
    safeQuery<TypeRow>(`SELECT id, name FROM bookmarktypeinfos ORDER BY name ASC`)
  ]);

  // Fetch user names from MongoDB users collection
  const db = await getDb();
  const studentIds = [...new Set(bookmarks.map((b: any) => Number(b.student_id)).filter(Boolean))];
  const userRows = studentIds.length > 0
    ? await db.collection("users").find({ id: { $in: studentIds } }, { projection: { id: 1, firstname: 1, email: 1 } }).toArray()
    : [];
  const userMap = new Map(userRows.map((u: any) => [Number(u.id), u]));

  // Enrich bookmarks with student names — serialize fully to avoid RowDataPacket toJSON error
  const enrichedBookmarks = bookmarks.map((b: any) => ({
    id:                  Number(b.id),
    student_id:          Number(b.student_id),
    college_id:          Number(b.college_id  ?? 0),
    course_id:           Number(b.course_id   ?? 0),
    blog_id:             Number(b.blog_id     ?? 0),
    title:               String(b.title       ?? ""),
    url:                 String(b.url         ?? ""),
    bookmarktypeinfo_id: String(b.bookmarktypeinfo_id ?? ""),
    type_name:           String(b.type_name   ?? ""),
    created_at:          b.created_at instanceof Date ? b.created_at.toISOString() : String(b.created_at ?? ""),
    student_name:        userMap.get(Number(b.student_id))?.firstname?.trim() || "Unknown",
    student_email:       userMap.get(Number(b.student_id))?.email?.trim()     || "-",
  }));

  // Users list for filter dropdown
  const users = userRows.map((u: any) => ({ id: u.id, name: (u.firstname || "").trim(), email: (u.email || "").trim() }));

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / FETCH_SIZE);

  return (
    <div className="p-6 space-y-6 w-full">
      <BookmarkClient 
        bookmarks={enrichedBookmarks}
        users={users}
        types={types.map((t: any) => ({ id: Number(t.id), name: String(t.name ?? "") }))}
        offset={offset}
        PAGE_SIZE={PAGE_SIZE}
        total={total}
        totalPages={totalPages}
        page={page}
        q={q}
        selectedStudentId={studentId}
        selectedTypeId={typeId}
        createBookmark={createBookmark}
        deleteBookmark={deleteBookmark}
      />
    </div>
  );
}




