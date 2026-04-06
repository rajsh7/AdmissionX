import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import ReviewsListClient from "./ReviewsListClient";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createReview(formData: FormData) {
  "use server";
  const collegeprofile_id = formData.get("collegeprofile_id") as string;
  const title = formData.get("title") as string;
  if (!collegeprofile_id || !title) return;

  const parse = (key: string) => {
    const v = formData.get(key) as string;
    return v ? parseFloat(v) : 0;
  };

  try {
    await pool.query(
      `INSERT INTO college_reviews (collegeprofile_id, title, description, academic, infrastructure, faculty, accommodation, placement, social, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        collegeprofile_id, title, formData.get("description") || "",
        parse("academic"), parse("infrastructure"), parse("faculty"),
        parse("accommodation"), parse("placement"), parse("social"),
      ]
    );
  } catch (e) {
    console.error("[admin/colleges/reviews createReview]", e);
  }
  revalidatePath("/admin/colleges/reviews");
}

async function updateReview(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const collegeprofile_id = formData.get("collegeprofile_id") as string;
  const title = formData.get("title") as string;
  if (isNaN(id) || !collegeprofile_id || !title) return;

  const parse = (key: string) => {
    const v = formData.get(key) as string;
    return v ? parseFloat(v) : 0;
  };

  try {
    await pool.query(
      `UPDATE college_reviews SET collegeprofile_id = ?, title = ?, description = ?, academic = ?, infrastructure = ?, faculty = ?, accommodation = ?, placement = ?, social = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        collegeprofile_id, title, formData.get("description") || "",
        parse("academic"), parse("infrastructure"), parse("faculty"),
        parse("accommodation"), parse("placement"), parse("social"),
        id,
      ]
    );
  } catch (e) {
    console.error("[admin/colleges/reviews updateReview]", e);
  }
  revalidatePath("/admin/colleges/reviews");
}

async function deleteReview(id: number) {
  "use server";
  if (isNaN(id)) return;
  try {
    await pool.query("DELETE FROM college_reviews WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/colleges/reviews deleteReview]", e);
  }
  revalidatePath("/admin/colleges/reviews");
  revalidatePath("/", "layout");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

async function safeQuery<T >(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/colleges/reviews safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReviewRow {
  id: number;
  college_name: string;
  collegeprofile_id: number;
  title: string;
  description: string;
  academic: number;
  accommodation: number;
  faculty: number;
  infrastructure: number;
  placement: number;
  social: number;
  student_name: string | null;
  student_email: string | null;
  created_at: string | null;
  updated_at: string | null;
  vote: number | null;
}

interface CountRow  { total: number; }
interface CollegeOption  { id: number; name: string; }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CollegeReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp   = await searchParams;
  const q    = (sp.q ?? "").trim();
  const collegeName = (sp.collegeName ?? "").trim();
  const studentName = (sp.studentName ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(u.firstname LIKE ? OR r.title LIKE ? OR r.description LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (collegeName) {
    conditions.push("u.firstname LIKE ?");
    params.push(`%${collegeName}%`);
  }
  if (studentName) {
    conditions.push("r.title LIKE ?");
    params.push(`%${studentName}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [reviews, countRows, colleges] = await Promise.all([
    safeQuery<ReviewRow>(
      `SELECT 
        r.id,
        r.collegeprofile_id,
        COALESCE(u.firstname, 'Unnamed College') as college_name,
        r.title,
        r.description,
        r.academic,
        r.accommodation,
        r.faculty,
        r.infrastructure,
        r.placement,
        r.social,
        COALESCE(u2.firstname, 'Anonymous') as student_name,
        u2.email as student_email,
        DATE_FORMAT(r.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
        DATE_FORMAT(r.updated_at, '%Y-%m-%d %H:%i:%s') as updated_at,
        r.votes as vote
       FROM college_reviews r
       JOIN collegeprofile cp ON cp.id = r.collegeprofile_id
       JOIN users u ON u.id = cp.users_id
       LEFT JOIN users u2 ON u2.id = r.users_id
       ${where}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total 
       FROM college_reviews r 
       JOIN collegeprofile cp ON cp.id = r.collegeprofile_id
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

  // Deeply map to plain objects to strip hidden Buffer/Date fields from the DB shim
  const cleanReviews = (reviews as any[]).map((r, idx) => ({
    id: Number(r.id) || (idx + 1),
    collegeprofile_id: Number(r.collegeprofile_id),
    college_name: String(r.college_name || "Unnamed College"),
    title: String(r.title || ""),
    description: String(r.description || ""),
    academic: Number(r.academic || 0),
    accommodation: Number(r.accommodation || 0),
    faculty: Number(r.faculty || 0),
    infrastructure: Number(r.infrastructure || 0),
    placement: Number(r.placement || 0),
    social: Number(r.social || 0),
    student_name: r.student_name ? String(r.student_name) : "Anonymous",
    student_email: r.student_email ? String(r.student_email) : null,
    created_at: r.created_at ? String(r.created_at) : null,
    updated_at: r.updated_at ? String(r.updated_at) : null,
    vote: r.vote ? Number(r.vote) : 0,
  }));

  const cleanColleges = (colleges as any[]).map((c, idx) => ({
    id: Number(c.id) || (idx + 1),
    name: String(c.name || ""),
  }));

  return (
    <div className="p-6 space-y-6 w-full overflow-x-hidden">
      <ReviewsListClient
        reviews={cleanReviews}
        colleges={cleanColleges}
        total={total}
        page={page}
        totalPages={totalPages}
        offset={offset}
        pageSize={PAGE_SIZE}
        q={q}
        collegeName={collegeName}
        studentName={studentName}
        createReview={createReview}
        updateReview={updateReview}
        deleteReview={deleteReview}
      />
    </div>
  );
}




