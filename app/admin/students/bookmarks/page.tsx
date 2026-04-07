import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import BookmarkClient from "./BookmarkClient";

const PAGE_SIZE = 25;

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
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(s.name LIKE ? OR s.email LIKE ? OR b.title LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [bookmarks, countRows, users, types] = await Promise.all([
    safeQuery<BookmarkRow>(
      `SELECT b.*, s.name as student_name, s.email as student_email, bt.name as type_name
       FROM bookmarks b
       LEFT JOIN next_student_signups s ON b.student_id = s.id
       LEFT JOIN bookmarktypeinfos bt ON b.bookmarktypeinfo_id = bt.id
       ${where}
       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset]
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total 
       FROM bookmarks b
       LEFT JOIN next_student_signups s ON b.student_id = s.id
       ${where}`,
      params
    ),
    safeQuery<UserRow>(`SELECT id, name, email FROM next_student_signups ORDER BY name ASC LIMIT 1000`),
    safeQuery<TypeRow>(`SELECT id, name FROM bookmarktypeinfos ORDER BY name ASC`)
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 w-full">
      <BookmarkClient 
        bookmarks={JSON.parse(JSON.stringify(bookmarks))}
        users={JSON.parse(JSON.stringify(users))}
        types={JSON.parse(JSON.stringify(types))}
        offset={offset}
        PAGE_SIZE={PAGE_SIZE}
        total={total}
        totalPages={totalPages}
        q={q}
        createBookmark={createBookmark}
        deleteBookmark={deleteBookmark}
      />
    </div>
  );
}




