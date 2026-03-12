import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyStudentToken } from "@/lib/auth";
import pool from "@/lib/db";

// ── Auth helper ───────────────────────────────────────────────────────────────
async function checkAuth(studentId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_student")?.value;
  if (!token) return null;
  const payload = await verifyStudentToken(token);
  if (!payload || String(payload.id) !== studentId) return null;
  return payload;
}

// ── Ensure table exists ───────────────────────────────────────────────────────
async function ensureTable(conn: Awaited<ReturnType<typeof pool.getConnection>>) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS next_student_bookmarks (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT          NOT NULL,
      type       VARCHAR(20)  NOT NULL DEFAULT 'college',
      item_id    INT          NOT NULL,
      title      VARCHAR(255) DEFAULT NULL,
      url        VARCHAR(500) DEFAULT NULL,
      image      VARCHAR(500) DEFAULT NULL,
      created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_nsb_student_item (student_id, type, item_id),
      INDEX idx_nsb_student (student_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

// ── GET /api/student/[id]/bookmarks ──────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const payload = await checkAuth(id);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const typeFilter = req.nextUrl.searchParams.get("type"); // college | course | blog | null (all)

  const conn = await pool.getConnection();
  try {
    await ensureTable(conn);

    const whereExtra = typeFilter ? ` AND b.type = ?` : "";
    const queryParams: unknown[] = typeFilter ? [id, typeFilter] : [id];

    const [rows] = await conn.query(
      `SELECT
         b.id,
         b.type,
         b.item_id,
         b.title,
         b.url,
         b.image,
         b.created_at,

         /* College enrichment */
         CASE WHEN b.type = 'college'
           THEN COALESCE(NULLIF(TRIM(u.firstname), ''), cp.slug)
           ELSE NULL
         END AS college_name,
         CASE WHEN b.type = 'college'
           THEN cp.bannerimage
           ELSE NULL
         END AS college_image,
         CASE WHEN b.type = 'college'
           THEN cp.slug
           ELSE NULL
         END AS college_slug,
         CASE WHEN b.type = 'college'
           THEN cp.registeredSortAddress
           ELSE NULL
         END AS college_address,

         /* Course enrichment */
         CASE WHEN b.type = 'course'
           THEN co.name
           ELSE NULL
         END AS course_name,
         CASE WHEN b.type = 'course'
           THEN d.name
           ELSE NULL
         END AS degree_name,
         CASE WHEN b.type = 'course'
           THEN fa.name
           ELSE NULL
         END AS stream_name,

         /* Blog enrichment */
         CASE WHEN b.type = 'blog'
           THEN bl.topic
           ELSE NULL
         END AS blog_topic,
         CASE WHEN b.type = 'blog'
           THEN bl.slug
           ELSE NULL
         END AS blog_slug,
         CASE WHEN b.type = 'blog'
           THEN bl.featimage
           ELSE NULL
         END AS blog_image

       FROM next_student_bookmarks b

       /* College joins */
       LEFT JOIN collegeprofile cp
         ON b.type = 'college' AND cp.id = b.item_id
       LEFT JOIN users u
         ON b.type = 'college' AND u.id = cp.users_id

       /* Course joins */
       LEFT JOIN course co
         ON b.type = 'course' AND co.id = b.item_id
       LEFT JOIN degree d
         ON b.type = 'course' AND d.id = co.degree_id
       LEFT JOIN functionalarea fa
         ON b.type = 'course' AND fa.id = co.functionalarea_id

       /* Blog joins */
       LEFT JOIN blogs bl
         ON b.type = 'blog' AND bl.id = b.item_id

       WHERE b.student_id = ?${whereExtra}
       ORDER BY b.created_at DESC`,
      queryParams,
    );

    const bookmarks = (rows as Record<string, unknown>[]).map((row) => {
      const type = String(row.type ?? "college");

      let displayTitle = String(row.title ?? "");
      let displayImage = String(row.image ?? "");
      let displayUrl   = String(row.url ?? "");

      if (type === "college") {
        displayTitle = displayTitle || String(row.college_name ?? "Unknown College");
        displayImage = displayImage || String(row.college_image ?? "");
        displayUrl   = displayUrl   || `/college/${row.college_slug ?? ""}`;
      } else if (type === "course") {
        displayTitle = displayTitle || String(row.course_name ?? "Unknown Course");
        displayUrl   = displayUrl   || `/search?course=${encodeURIComponent(String(row.course_name ?? ""))}`;
      } else if (type === "blog") {
        displayTitle = displayTitle || String(row.blog_topic ?? "Unknown Blog");
        displayImage = displayImage || String(row.blog_image ?? "");
        displayUrl   = displayUrl   || `/blog/${row.blog_slug ?? ""}`;
      }

      return {
        id:            row.id,
        type,
        item_id:       row.item_id,
        title:         displayTitle,
        image:         displayImage,
        url:           displayUrl,
        created_at:    row.created_at,
        // type-specific extras
        college_name:  row.college_name ?? null,
        college_slug:  row.college_slug ?? null,
        college_address: row.college_address ?? null,
        course_name:   row.course_name ?? null,
        degree_name:   row.degree_name ?? null,
        stream_name:   row.stream_name ?? null,
        blog_topic:    row.blog_topic ?? null,
        blog_slug:     row.blog_slug ?? null,
      };
    });

    const counts = {
      total:   bookmarks.length,
      college: bookmarks.filter((b) => b.type === "college").length,
      course:  bookmarks.filter((b) => b.type === "course").length,
      blog:    bookmarks.filter((b) => b.type === "blog").length,
    };

    return NextResponse.json({ bookmarks, counts });
  } finally {
    conn.release();
  }
}

// ── POST /api/student/[id]/bookmarks ─────────────────────────────────────────
// Body: { type: "college"|"course"|"blog", item_id: number, title?, url?, image? }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const payload = await checkAuth(id);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    type?: string;
    item_id?: number;
    title?: string;
    url?: string;
    image?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { type, item_id, title, url, image } = body;

  if (!type || !item_id) {
    return NextResponse.json(
      { error: "type and item_id are required" },
      { status: 400 },
    );
  }

  const allowedTypes = ["college", "course", "blog"];
  if (!allowedTypes.includes(type)) {
    return NextResponse.json(
      { error: `type must be one of: ${allowedTypes.join(", ")}` },
      { status: 400 },
    );
  }

  const conn = await pool.getConnection();
  try {
    await ensureTable(conn);

    // Upsert — ignore duplicate silently
    await conn.query(
      `INSERT INTO next_student_bookmarks
         (student_id, type, item_id, title, url, image)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         title = COALESCE(VALUES(title), title),
         url   = COALESCE(VALUES(url),   url),
         image = COALESCE(VALUES(image), image)`,
      [
        id,
        type,
        item_id,
        title?.trim() || null,
        url?.trim()   || null,
        image?.trim() || null,
      ],
    );

    return NextResponse.json({ success: true, message: "Bookmark saved" });
  } finally {
    conn.release();
  }
}

// ── DELETE /api/student/[id]/bookmarks?bookmarkId=X ──────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const payload = await checkAuth(id);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookmarkId = req.nextUrl.searchParams.get("bookmarkId");
  if (!bookmarkId) {
    return NextResponse.json(
      { error: "bookmarkId query param is required" },
      { status: 400 },
    );
  }

  const conn = await pool.getConnection();
  try {
    await ensureTable(conn);

    const [result] = await conn.query(
      `DELETE FROM next_student_bookmarks
       WHERE id = ? AND student_id = ?`,
      [bookmarkId, id],
    );

    const affectedRows = (result as { affectedRows: number }).affectedRows;
    if (!affectedRows) {
      return NextResponse.json(
        { error: "Bookmark not found or does not belong to this student" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, message: "Bookmark removed" });
  } finally {
    conn.release();
  }
}
