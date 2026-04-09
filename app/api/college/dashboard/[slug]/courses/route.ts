import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCollegeToken } from "@/lib/auth";
import pool from "@/lib/db";

// -- Auth + ownership helper ---------------------------------------------------
async function checkAuth(slug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_college")?.value;
  if (!token) return null;
  const payload = await verifyCollegeToken(token);
  if (!payload) return null;

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT cp.id AS collegeprofile_id, cp.users_id
       FROM collegeprofile cp
       JOIN users u ON u.id = cp.users_id
       WHERE cp.slug = ? AND TRIM(LOWER(u.email)) = LOWER(?)
       LIMIT 1`,
      [slug, payload.email],
    );
    const list = rows as { collegeprofile_id: number; users_id: number }[];
    if (!list.length) return null;
    return { payload, collegeprofile_id: list[0].collegeprofile_id };
  } finally {
    conn.release();
  }
}

// -- GET /api/college/dashboard/[slug]/courses ---------------------------------
// Returns all courses for this college + dropdown lists for the form
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conn = await pool.getConnection();
  try {
    // Fetch courses (collegemaster rows) with joined names
    const [courseRows] = await conn.query(
      `SELECT
         cm.id,
         cm.course_id,
         cm.degree_id,
         cm.functionalarea_id,
         cm.fees,
         cm.seats,
         cm.courseduration,
         cm.twelvemarks,
         cm.description,
         co.name  AS course_name,
         d.name   AS degree_name,
         fa.name  AS stream_name
       FROM collegemaster cm
       LEFT JOIN course         co ON co.id = cm.course_id
       LEFT JOIN degree         d  ON d.id  = cm.degree_id
       LEFT JOIN functionalarea fa ON fa.id = cm.functionalarea_id
       WHERE cm.collegeprofile_id = ?
       ORDER BY fa.name ASC, d.name ASC, co.name ASC`,
      [auth.collegeprofile_id],
    );

    // Fetch dropdown options in parallel
    const [courseOptions] = await conn.query(
      `SELECT id, name FROM course ORDER BY name ASC LIMIT 500`,
    );
    const [degreeOptions] = await conn.query(
      `SELECT id, name FROM degree ORDER BY name ASC LIMIT 200`,
    );
    const [streamOptions] = await conn.query(
      `SELECT id, name FROM functionalarea ORDER BY name ASC LIMIT 100`,
    );

    return NextResponse.json({
      courses: courseRows,
      options: {
        courses: courseOptions,
        degrees: degreeOptions,
        streams: streamOptions,
      },
    });
  } finally {
    conn.release();
  }
}

// -- POST /api/college/dashboard/[slug]/courses --------------------------------
// Body: { course_id, degree_id, functionalarea_id, fees?, seats?, courseduration?, twelvemarks?, description? }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    course_id?: number;
    degree_id?: number;
    functionalarea_id?: number;
    fees?: number | string;
    seats?: number | string;
    courseduration?: string;
    twelvemarks?: number | string;
    description?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { course_id, degree_id, functionalarea_id, fees, seats, courseduration, twelvemarks, description } = body;

  if (!course_id || !degree_id || !functionalarea_id) {
    return NextResponse.json(
      { error: "course_id, degree_id, and functionalarea_id are required." },
      { status: 400 },
    );
  }

  const conn = await pool.getConnection();
  try {
    // Guard: prevent duplicate course+degree+stream combo for same college
    const [existing] = await conn.query(
      `SELECT id FROM collegemaster
       WHERE collegeprofile_id = ? AND course_id = ? AND degree_id = ? AND functionalarea_id = ?
       LIMIT 1`,
      [auth.collegeprofile_id, course_id, degree_id, functionalarea_id],
    );
    if ((existing as unknown[]).length) {
      return NextResponse.json(
        { error: "This course/degree/stream combination already exists for your college." },
        { status: 409 },
      );
    }

    const [result] = await conn.query(
      `INSERT INTO collegemaster
         (collegeprofile_id, course_id, degree_id, functionalarea_id,
          fees, seats, courseduration, twelvemarks, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        auth.collegeprofile_id,
        course_id,
        degree_id,
        functionalarea_id,
        fees ? Number(fees) : null,
        seats ? Number(seats) : null,
        courseduration?.trim() || null,
        twelvemarks ? Number(twelvemarks) : null,
        description?.trim() || null,
      ],
    );

    const insertId = (result as { insertId: number }).insertId;

    // Return the newly created row with joined names
    const [newRows] = await conn.query(
      `SELECT
         cm.id,
         cm.course_id,
         cm.degree_id,
         cm.functionalarea_id,
         cm.fees,
         cm.seats,
         cm.courseduration,
         cm.twelvemarks,
         cm.description,
         co.name  AS course_name,
         d.name   AS degree_name,
         fa.name  AS stream_name
       FROM collegemaster cm
       LEFT JOIN course         co ON co.id = cm.course_id
       LEFT JOIN degree         d  ON d.id  = cm.degree_id
       LEFT JOIN functionalarea fa ON fa.id = cm.functionalarea_id
       WHERE cm.id = ?`,
      [insertId],
    );

    return NextResponse.json(
      { success: true, message: "Course added successfully.", course: (newRows as unknown[])[0] },
      { status: 201 },
    );
  } finally {
    conn.release();
  }
}

// -- PUT /api/college/dashboard/[slug]/courses?courseId=X ---------------------
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const courseId = req.nextUrl.searchParams.get("courseId");
  if (!courseId) {
    return NextResponse.json({ error: "courseId query param is required." }, { status: 400 });
  }

  let body: {
    course_id?: number;
    degree_id?: number;
    functionalarea_id?: number;
    fees?: number | string;
    seats?: number | string;
    courseduration?: string;
    twelvemarks?: number | string;
    description?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const allowed: Record<string, "number" | "string"> = {
    course_id:        "number",
    degree_id:        "number",
    functionalarea_id:"number",
    fees:             "number",
    seats:            "number",
    courseduration:   "string",
    twelvemarks:      "number",
    description:      "string",
  };

  const setClauses: string[] = [];
  const values: unknown[] = [];

  for (const [key, type] of Object.entries(allowed)) {
    if (!Object.prototype.hasOwnProperty.call(body, key)) continue;
    const raw = (body as Record<string, unknown>)[key];
    let val: unknown;
    if (raw === "" || raw === null || raw === undefined) {
      val = null;
    } else if (type === "number") {
      const n = Number(raw);
      val = isNaN(n) ? null : n;
    } else {
      val = String(raw).trim() || null;
    }
    setClauses.push(`${key} = ?`);
    values.push(val);
  }

  if (setClauses.length === 0) {
    return NextResponse.json({ error: "No valid fields provided." }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    // Verify this collegemaster row belongs to this college
    const [check] = await conn.query(
      `SELECT id FROM collegemaster WHERE id = ? AND collegeprofile_id = ? LIMIT 1`,
      [courseId, auth.collegeprofile_id],
    );
    if (!(check as unknown[]).length) {
      return NextResponse.json(
        { error: "Course not found or does not belong to your college." },
        { status: 404 },
      );
    }

    setClauses.push("updated_at = CURRENT_TIMESTAMP");
    await conn.query(
      `UPDATE collegemaster SET ${setClauses.join(", ")} WHERE id = ?`,
      [...values, courseId],
    );

    // Return updated row with names
    const [updated] = await conn.query(
      `SELECT
         cm.id, cm.course_id, cm.degree_id, cm.functionalarea_id,
         cm.fees, cm.seats, cm.courseduration, cm.twelvemarks, cm.description,
         co.name AS course_name, d.name AS degree_name, fa.name AS stream_name
       FROM collegemaster cm
       LEFT JOIN course         co ON co.id = cm.course_id
       LEFT JOIN degree         d  ON d.id  = cm.degree_id
       LEFT JOIN functionalarea fa ON fa.id = cm.functionalarea_id
       WHERE cm.id = ?`,
      [courseId],
    );

    return NextResponse.json({
      success: true,
      message: "Course updated successfully.",
      course: (updated as unknown[])[0],
    });
  } finally {
    conn.release();
  }
}

// -- DELETE /api/college/dashboard/[slug]/courses?courseId=X ------------------
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const courseId = req.nextUrl.searchParams.get("courseId");
  if (!courseId) {
    return NextResponse.json({ error: "courseId query param is required." }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      `DELETE FROM collegemaster WHERE id = ? AND collegeprofile_id = ?`,
      [courseId, auth.collegeprofile_id],
    );
    const affected = (result as { affectedRows: number }).affectedRows;
    if (!affected) {
      return NextResponse.json(
        { error: "Course not found or does not belong to your college." },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, message: "Course deleted successfully." });
  } finally {
    conn.release();
  }
}
