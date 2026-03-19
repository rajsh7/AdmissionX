import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyStudentToken } from "@/lib/auth";
import pool from "@/lib/db";

// ── Auth helper ───────────────────────────────────────────────────────────────
async function checkAuth(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_student")?.value;
  if (!token) return null;
  const payload = await verifyStudentToken(token);
  if (!payload) return null;
  return payload;
}

// ── Ensure tables exist ───────────────────────────────────────────────────────
async function ensureTables(conn: Awaited<ReturnType<typeof pool.getConnection>>) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS next_student_applications (
      id                INT AUTO_INCREMENT PRIMARY KEY,
      application_ref   VARCHAR(20)   NOT NULL UNIQUE,
      student_id        INT           NOT NULL,
      collegeprofile_id INT           DEFAULT NULL,
      collegemaster_id  INT           DEFAULT NULL,
      college_name      VARCHAR(255)  DEFAULT NULL,
      course_name       VARCHAR(255)  DEFAULT NULL,
      degree_name       VARCHAR(255)  DEFAULT NULL,
      stream_name       VARCHAR(255)  DEFAULT NULL,
      fees              DECIMAL(10,2) DEFAULT 0.00,
      status            VARCHAR(30)   NOT NULL DEFAULT 'submitted',
      payment_status    VARCHAR(30)   NOT NULL DEFAULT 'pending',
      transaction_id    VARCHAR(255)  DEFAULT NULL,
      amount_paid       DECIMAL(10,2) DEFAULT 0.00,
      notes             TEXT          DEFAULT NULL,
      created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
      updated_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_nsa_student (student_id),
      INDEX idx_nsa_status  (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

// ── Generate unique application reference ─────────────────────────────────────
// Format: ADX-<year><month><random 6-digit number>
function generateRef(): string {
  const now   = new Date();
  const year  = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const rand  = Math.floor(100000 + Math.random() * 900000);
  return `ADX-${year}${month}${rand}`;
}

// ── POST /api/student/apply ───────────────────────────────────────────────────
// Body:
//   collegeprofile_id  INT     (required)
//   collegemaster_id   INT     (optional — specific course row)
//   college_name       string  (display name, enriched server-side if omitted)
//   course_name        string  (display name)
//   degree_name        string
//   stream_name        string
//   fees               number
//   notes              string  (optional)
export async function POST(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const studentId = payload.id;

  let body: {
    collegeprofile_id?: number;
    collegemaster_id?:  number;
    college_name?:      string;
    course_name?:       string;
    degree_name?:       string;
    stream_name?:       string;
    fees?:              number;
    notes?:             string;
    documents?: { type: string; url: string }[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    collegeprofile_id,
    collegemaster_id,
    college_name,
    course_name,
    degree_name,
    stream_name,
    fees,
    notes,
    documents,
  } = body;

  // ── Validate required documents ──────────────────────────────────────────────
  const REQUIRED_DOC_TYPES = ["10th Marksheet", "12th Marksheet", "ID Proof"];
  if (!documents || !Array.isArray(documents)) {
    return NextResponse.json(
      { error: "documents field is required and must be an array." },
      { status: 400 },
    );
  }
  const providedTypes = documents.map((d) => d.type);
  const missingDocs = REQUIRED_DOC_TYPES.filter((t) => !providedTypes.includes(t));
  if (missingDocs.length > 0) {
    return NextResponse.json(
      { error: `Missing required documents: ${missingDocs.join(", ")}` },
      { status: 400 },
    );
  }

  if (!collegeprofile_id) {
    return NextResponse.json(
      { error: "collegeprofile_id is required." },
      { status: 400 },
    );
  }

  const conn = await pool.getConnection();
  try {
    await ensureTables(conn);

    // ── Guard: one active application per college per student ─────────────────
    const [existingRows] = await conn.query(
      `SELECT id, application_ref
       FROM next_student_applications
       WHERE student_id = ?
         AND collegeprofile_id = ?
         AND status NOT IN ('rejected')
       LIMIT 1`,
      [studentId, collegeprofile_id],
    );
    const existing = existingRows as { id: number; application_ref: string }[];
    if (existing.length) {
      return NextResponse.json(
        {
          error: "You already have an active application for this college.",
          application_ref: existing[0].application_ref,
        },
        { status: 409 },
      );
    }

    // ── Enrich college_name from DB if caller didn't supply it ────────────────
    let resolvedCollegeName = college_name?.trim() || null;
    if (!resolvedCollegeName) {
      const [cpRows] = await conn.query(
        `SELECT COALESCE(NULLIF(TRIM(u.firstname), ''), cp.slug) AS cname
         FROM collegeprofile cp
         LEFT JOIN users u ON u.id = cp.users_id
         WHERE cp.id = ?
         LIMIT 1`,
        [collegeprofile_id],
      );
      const cpList = cpRows as { cname: string }[];
      if (cpList.length) resolvedCollegeName = cpList[0].cname;
    }

    // ── Enrich course/degree/stream/fees from collegemaster if ID provided ────
    let resolvedCourseName  = course_name?.trim()  || null;
    let resolvedDegreeName  = degree_name?.trim()  || null;
    let resolvedStreamName  = stream_name?.trim()  || null;
    let resolvedFees        = typeof fees === "number" ? fees : 0;

    if (collegemaster_id && (!resolvedCourseName || !resolvedDegreeName)) {
      const [cmRows] = await conn.query(
        `SELECT
           co.name  AS course_name,
           d.name   AS degree_name,
           fa.name  AS stream_name,
           cm.fees
         FROM collegemaster cm
         LEFT JOIN course        co ON co.id = cm.course_id
         LEFT JOIN degree        d  ON d.id  = cm.degree_id
         LEFT JOIN functionalarea fa ON fa.id = cm.functionalarea_id
         WHERE cm.id = ?
         LIMIT 1`,
        [collegemaster_id],
      );
      const cmList = cmRows as {
        course_name: string | null;
        degree_name: string | null;
        stream_name: string | null;
        fees:        number | null;
      }[];
      if (cmList.length) {
        resolvedCourseName = resolvedCourseName || cmList[0].course_name || null;
        resolvedDegreeName = resolvedDegreeName || cmList[0].degree_name || null;
        resolvedStreamName = resolvedStreamName || cmList[0].stream_name || null;
        if (!fees && cmList[0].fees) resolvedFees = Number(cmList[0].fees);
      }
    }

    // ── Generate a collision-resistant application ref ────────────────────────
    let applicationRef = generateRef();
    let attempts = 0;
    while (attempts < 5) {
      const [check] = await conn.query(
        `SELECT id FROM next_student_applications WHERE application_ref = ? LIMIT 1`,
        [applicationRef],
      );
      if ((check as unknown[]).length === 0) break;
      applicationRef = generateRef();
      attempts++;
    }

    // ── Insert application ────────────────────────────────────────────────────
    const [result] = await conn.query(
      `INSERT INTO next_student_applications
         (application_ref, student_id, collegeprofile_id, collegemaster_id,
          college_name, course_name, degree_name, stream_name,
          fees, status, payment_status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', 'pending', ?)`,
      [
        applicationRef,
        studentId,
        collegeprofile_id,
        collegemaster_id ?? null,
        resolvedCollegeName,
        resolvedCourseName,
        resolvedDegreeName,
        resolvedStreamName,
        resolvedFees,
        notes?.trim() || null,
      ],
    );

    const insertId = (result as { insertId: number }).insertId;

    // ── Insert documents into 'documents' table ───────────────────────────────
    if (documents && documents.length > 0) {
      const docValues = documents.map((d) => [insertId, d.type, d.url]);
      await conn.query(
        `INSERT INTO documents (applicationId, type, fileUrl) VALUES ?`,
        [docValues],
      );
    }

    return NextResponse.json(
      {
        success:         true,
        message:         "Application submitted successfully.",
        application: {
          id:               insertId,
          application_ref:  applicationRef,
          student_id:       studentId,
          college_name:     resolvedCollegeName,
          course_name:      resolvedCourseName,
          degree_name:      resolvedDegreeName,
          stream_name:      resolvedStreamName,
          fees:             resolvedFees,
          status:           "submitted",
          payment_status:   "pending",
        },
      },
      { status: 201 },
    );
  } finally {
    conn.release();
  }
}
