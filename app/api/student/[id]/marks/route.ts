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
    CREATE TABLE IF NOT EXISTS next_student_marks (
      id                INT AUTO_INCREMENT PRIMARY KEY,
      student_id        INT          NOT NULL UNIQUE,

      -- 10th / Secondary
      class10_board     VARCHAR(100) DEFAULT NULL,
      class10_school    VARCHAR(255) DEFAULT NULL,
      class10_year      SMALLINT     DEFAULT NULL,
      class10_percent   DECIMAL(5,2) DEFAULT NULL,
      class10_total     INT          DEFAULT NULL,
      class10_obtained  INT          DEFAULT NULL,

      -- 11th / Higher Secondary (optional intermediate year)
      class11_board     VARCHAR(100) DEFAULT NULL,
      class11_school    VARCHAR(255) DEFAULT NULL,
      class11_year      SMALLINT     DEFAULT NULL,
      class11_percent   DECIMAL(5,2) DEFAULT NULL,

      -- 12th / Senior Secondary
      class12_board     VARCHAR(100) DEFAULT NULL,
      class12_school    VARCHAR(255) DEFAULT NULL,
      class12_year      SMALLINT     DEFAULT NULL,
      class12_percent   DECIMAL(5,2) DEFAULT NULL,
      class12_total     INT          DEFAULT NULL,
      class12_obtained  INT          DEFAULT NULL,
      class12_stream    VARCHAR(100) DEFAULT NULL,

      -- Graduation (optional)
      grad_university   VARCHAR(255) DEFAULT NULL,
      grad_college      VARCHAR(255) DEFAULT NULL,
      grad_program      VARCHAR(255) DEFAULT NULL,
      grad_year         SMALLINT     DEFAULT NULL,
      grad_percent      DECIMAL(5,2) DEFAULT NULL,
      grad_cgpa         DECIMAL(4,2) DEFAULT NULL,

      created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

      INDEX idx_nsm_student (student_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

// ── GET /api/student/[id]/marks ───────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const payload = await checkAuth(id);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conn = await pool.getConnection();
  try {
    await ensureTable(conn);

    const [rows] = await conn.query(
      `SELECT
         class10_board,   class10_school,  class10_year,
         class10_percent, class10_total,   class10_obtained,

         class11_board,   class11_school,  class11_year,
         class11_percent,

         class12_board,   class12_school,  class12_year,
         class12_percent, class12_total,   class12_obtained,
         class12_stream,

         grad_university, grad_college,    grad_program,
         grad_year,       grad_percent,    grad_cgpa
       FROM next_student_marks
       WHERE student_id = ?
       LIMIT 1`,
      [id],
    );

    const list = rows as Record<string, unknown>[];

    // Return empty defaults if no row exists yet
    const empty = {
      class10_board: "",    class10_school: "",   class10_year: "",
      class10_percent: "",  class10_total: "",    class10_obtained: "",

      class11_board: "",    class11_school: "",   class11_year: "",
      class11_percent: "",

      class12_board: "",    class12_school: "",   class12_year: "",
      class12_percent: "",  class12_total: "",    class12_obtained: "",
      class12_stream: "",

      grad_university: "",  grad_college: "",     grad_program: "",
      grad_year: "",        grad_percent: "",     grad_cgpa: "",
    };

    const row = list[0] ?? {};

    // Normalise nulls → empty strings for the client
    const marks: Record<string, string> = {};
    for (const key of Object.keys(empty)) {
      const val = row[key];
      marks[key] = val === null || val === undefined ? "" : String(val);
    }

    // Completion check — how many of the core 12 fields are filled?
    const coreFields = [
      "class10_board",  "class10_school",  "class10_year",  "class10_percent",
      "class12_board",  "class12_school",  "class12_year",  "class12_percent",
    ];
    const filledCore = coreFields.filter((k) => marks[k] !== "").length;
    const marksComplete = Math.round((filledCore / coreFields.length) * 100);

    return NextResponse.json({ marks, marksComplete });
  } finally {
    conn.release();
  }
}

// ── PUT /api/student/[id]/marks ───────────────────────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const payload = await checkAuth(id);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, string | number | null>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Whitelist of allowed columns
  const allowed = [
    "class10_board",  "class10_school",  "class10_year",
    "class10_percent","class10_total",   "class10_obtained",

    "class11_board",  "class11_school",  "class11_year",
    "class11_percent",

    "class12_board",  "class12_school",  "class12_year",
    "class12_percent","class12_total",   "class12_obtained",
    "class12_stream",

    "grad_university","grad_college",    "grad_program",
    "grad_year",      "grad_percent",    "grad_cgpa",
  ];

  // Build SET clause from whitelisted keys that are present in the body
  const setClauses: string[] = [];
  const values: (string | number | null)[] = [];

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      const raw = body[key];
      // Coerce empty string → null; keep numbers as-is
      const val =
        raw === "" || raw === null || raw === undefined
          ? null
          : typeof raw === "number"
            ? raw
            : String(raw).trim() || null;
      setClauses.push(`${key} = ?`);
      values.push(val);
    }
  }

  if (setClauses.length === 0) {
    return NextResponse.json(
      { error: "No valid fields provided" },
      { status: 400 },
    );
  }

  const conn = await pool.getConnection();
  try {
    await ensureTable(conn);

    // Build the INSERT ... ON DUPLICATE KEY UPDATE statement so we always upsert
    const insertColumns = ["student_id", ...setClauses.map((c) => c.split(" = ")[0])];
    const insertPlaceholders = insertColumns.map(() => "?").join(", ");
    const updatePart = setClauses.join(", ");

    await conn.query(
      `INSERT INTO next_student_marks (${insertColumns.join(", ")})
       VALUES (${insertPlaceholders})
       ON DUPLICATE KEY UPDATE ${updatePart}`,
      [id, ...values, ...values],
    );

    return NextResponse.json({
      success: true,
      message: "Academic marks saved successfully.",
    });
  } finally {
    conn.release();
  }
}
