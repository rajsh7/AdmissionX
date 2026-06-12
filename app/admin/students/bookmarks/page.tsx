import { getDb } from "@/lib/db";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import BookmarkClient from "./BookmarkClient";
import { ObjectId } from "mongodb";

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
  const rawId = formData.get("student_id") as string;
  const student_id = isNaN(Number(rawId)) ? rawId : parseInt(rawId, 10);
  const bookmarktypeinfo_id = formData.get("bookmarktypeinfo_id") as string;
  const title = formData.get("title") as string;
  const url = formData.get("url") as string;
  const college_id = parseInt(formData.get("college_id") as string, 10) || 0;
  const course_id = parseInt(formData.get("course_id") as string, 10) || 0;
  const blog_id = parseInt(formData.get("blog_id") as string, 10) || 0;

  if (!student_id || !bookmarktypeinfo_id || !title || !url) return;

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
  const rawId = formData.get("student_id") as string;
  const student_id = isNaN(Number(rawId)) ? rawId : parseInt(rawId, 10);
  const bookmarktypeinfo_id = formData.get("bookmarktypeinfo_id") as string;
  const title = formData.get("title") as string;
  const url = formData.get("url") as string;
  const college_id = parseInt(formData.get("college_id") as string, 10) || 0;
  const course_id = parseInt(formData.get("course_id") as string, 10) || 0;
  const blog_id = parseInt(formData.get("blog_id") as string, 10) || 0;

  if (isNaN(id) || !student_id || !bookmarktypeinfo_id || !title || !url) return;

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

  if (studentId) {
    conditions.push("b.student_id = ?");
    params.push(studentId);
  }

  if (typeId) {
    conditions.push("b.bookmarktypeinfo_id = ?");
    params.push(typeId);
  }

  if (q) {
    conditions.push("(b.title LIKE ? OR b.url LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
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

  // Fetch user names from MongoDB users collection and next_student_signups
  const db = await getDb();

  // Extract student IDs of all types (numbers and string ObjectIds)
  const rawStudentIds = bookmarks.map((b: any) => b.student_id).filter(Boolean);
  const numericIds = rawStudentIds.map(id => Number(id)).filter(id => !isNaN(id) && id > 0);
  const stringIds = rawStudentIds.map(id => String(id)).filter(id => isNaN(Number(id)));

  // If searching by name/email in q, also search MongoDB for matching users
  let mongoUserFilter: Record<string, unknown> = {};
  let nextStudentFilter: Record<string, unknown> = {};
  if (q) {
    mongoUserFilter = { $or: [
      { firstname: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ]};
    nextStudentFilter = { $or: [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ]};
  }

  const objectIds = stringIds.map(id => ObjectId.isValid(id) ? new ObjectId(id) : id);

  const [userRows, nextStudentRows, matchedUserRows, matchedNextStudentRows] = await Promise.all([
    numericIds.length > 0
      ? db.collection("users").find({ id: { $in: numericIds } }, { projection: { id: 1, firstname: 1, email: 1 } }).toArray()
      : Promise.resolve([]),
    stringIds.length > 0
      ? db.collection("next_student_signups").find({ _id: { $in: objectIds as any } }, { projection: { _id: 1, name: 1, email: 1 } }).toArray()
      : Promise.resolve([]),
    q
      ? db.collection("users").find(mongoUserFilter, { projection: { id: 1, firstname: 1, email: 1 } }).limit(200).toArray()
      : Promise.resolve([]),
    q
      ? db.collection("next_student_signups").find(nextStudentFilter, { projection: { _id: 1, name: 1, email: 1 } }).limit(200).toArray()
      : Promise.resolve([]),
  ]);

  // Build a unified map of student info indexed by String representation of ID
  const userMap = new Map<string, { name: string; email: string }>();
  userRows.forEach((u: any) => userMap.set(String(u.id), { name: u.firstname || "Unknown", email: u.email || "-" }));
  nextStudentRows.forEach((s: any) => userMap.set(String(s._id), { name: s.name || "Unknown", email: s.email || "-" }));
  matchedUserRows.forEach((u: any) => userMap.set(String(u.id), { name: u.firstname || "Unknown", email: u.email || "-" }));
  matchedNextStudentRows.forEach((s: any) => userMap.set(String(s._id), { name: s.name || "Unknown", email: s.email || "-" }));

  // If q matches student names/emails, fetch their bookmarks too and merge
  let extraBookmarks: any[] = [];
  if (q) {
    const matchedIds = [
      ...matchedUserRows.map((u: any) => String(u.id)),
      ...matchedNextStudentRows.map((s: any) => String(s._id))
    ].filter(id => !rawStudentIds.map(String).includes(id));

    if (matchedIds.length > 0) {
      const matchedIdFilters = matchedIds.map(id => isNaN(Number(id)) ? id : Number(id));
      const queryFilter: any = { student_id: { $in: matchedIdFilters } };
      if (typeId) {
        queryFilter.bookmarktypeinfo_id = { $in: [Number(typeId), typeId] };
      }
      extraBookmarks = await db.collection("bookmarks").find(queryFilter).sort({ created_at: -1 }).limit(FETCH_SIZE).toArray();
    }
  }

  const allBookmarks = [...bookmarks, ...extraBookmarks];

  // Enrich bookmarks with student names
  const enrichedBookmarks = allBookmarks.map((b: any) => {
    const sId = String(b.student_id);
    const userInfo = userMap.get(sId);
    return {
      id:                  Number(b.id),
      student_id:          b.student_id,
      college_id:          Number(b.college_id  ?? 0),
      course_id:           Number(b.course_id   ?? 0),
      blog_id:             Number(b.blog_id     ?? 0),
      title:               String(b.title       ?? ""),
      url:                 String(b.url         ?? ""),
      bookmarktypeinfo_id: String(b.bookmarktypeinfo_id ?? ""),
      type_name:           String(b.type_name   ?? ""),
      created_at:          b.created_at instanceof Date ? b.created_at.toISOString() : String(b.created_at ?? ""),
      student_name:        userInfo?.name || "Unknown",
      student_email:       userInfo?.email || "-",
    };
  });

  // Users list for filter dropdown — fetch all users who have bookmarks
  const allStudentIds = [...new Set(allBookmarks.map((b: any) => b.student_id).filter(Boolean))];
  const dropdownNumericIds = allStudentIds.map(id => Number(id)).filter(id => !isNaN(id));
  const dropdownStringIds = allStudentIds.map(id => String(id)).filter(id => isNaN(Number(id)));
  
  const [dropdownUserRows, dropdownNextStudentRows] = await Promise.all([
    dropdownNumericIds.length > 0
      ? db.collection("users").find({ id: { $in: dropdownNumericIds } }, { projection: { id: 1, firstname: 1, email: 1 } }).toArray()
      : Promise.resolve([]),
    dropdownStringIds.length > 0
      ? db.collection("next_student_signups").find({ _id: { $in: dropdownStringIds.map(id => ObjectId.isValid(id) ? new ObjectId(id) : id) as any } }, { projection: { _id: 1, name: 1, email: 1 } }).toArray()
      : Promise.resolve([]),
  ]);

  const dropdownUsers = [
    ...dropdownUserRows.map((u: any) => ({ id: String(u.id), name: (u.firstname || "").trim(), email: (u.email || "").trim() })),
    ...dropdownNextStudentRows.map((s: any) => ({ id: String(s._id), name: (s.name || "").trim(), email: (s.email || "").trim() }))
  ];

  const total = Number(countRows[0]?.total ?? 0) + extraBookmarks.length;
  const totalPages = Math.ceil(total / FETCH_SIZE);

  return (
    <div className="p-6 space-y-6 w-full">
      <BookmarkClient 
        bookmarks={enrichedBookmarks}
        users={dropdownUsers}
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




