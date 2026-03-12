import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyStudentToken } from "@/lib/auth";
import pool from "@/lib/db";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

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
    CREATE TABLE IF NOT EXISTS next_student_documents (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      student_id  INT          NOT NULL,
      name        VARCHAR(255) NOT NULL,
      file_path   VARCHAR(600) NOT NULL,
      file_type   VARCHAR(100) DEFAULT NULL,
      file_size   INT          DEFAULT NULL,
      category    VARCHAR(50)  NOT NULL DEFAULT 'other',
      created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_nsd_student (student_id),
      INDEX idx_nsd_category (category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

// ── Category meta ─────────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  marksheet_10:  "10th Marksheet",
  marksheet_12:  "12th Marksheet",
  marksheet_grad:"Graduation Marksheet",
  id_proof:      "ID Proof",
  photo:         "Passport Photo",
  caste_cert:    "Caste Certificate",
  income_cert:   "Income Certificate",
  migration:     "Migration Certificate",
  other:         "Other Document",
};

const ALLOWED_CATEGORIES = Object.keys(CATEGORY_LABELS);

// Max file size: 5 MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

// ── GET /api/student/[id]/documents ──────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const payload = await checkAuth(id);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categoryFilter = req.nextUrl.searchParams.get("category");

  const conn = await pool.getConnection();
  try {
    await ensureTable(conn);

    const whereExtra = categoryFilter ? " AND category = ?" : "";
    const queryParams: unknown[] = categoryFilter ? [id, categoryFilter] : [id];

    const [rows] = await conn.query(
      `SELECT
         id,
         name,
         file_path,
         file_type,
         file_size,
         category,
         created_at
       FROM next_student_documents
       WHERE student_id = ?${whereExtra}
       ORDER BY created_at DESC`,
      queryParams,
    );

    const documents = (rows as Record<string, unknown>[]).map((row) => {
      const cat = String(row.category ?? "other");
      return {
        id:             row.id,
        name:           row.name,
        file_path:      row.file_path,
        file_type:      row.file_type,
        file_size:      row.file_size,
        file_size_kb:   row.file_size
          ? `${(Number(row.file_size) / 1024).toFixed(1)} KB`
          : null,
        category:       cat,
        category_label: CATEGORY_LABELS[cat] ?? "Document",
        is_image:       String(row.file_type ?? "").startsWith("image/"),
        created_at:     row.created_at,
        uploaded_on:    row.created_at
          ? new Date(row.created_at as string).toLocaleDateString("en-IN", {
              day:   "2-digit",
              month: "short",
              year:  "numeric",
            })
          : null,
      };
    });

    // Group by category for convenient access
    const grouped: Record<string, typeof documents> = {};
    for (const cat of ALLOWED_CATEGORIES) {
      grouped[cat] = documents.filter((d) => d.category === cat);
    }

    const counts = {
      total:    documents.length,
      grouped: Object.fromEntries(
        ALLOWED_CATEGORIES.map((c) => [c, grouped[c].length]),
      ),
    };

    return NextResponse.json({
      documents,
      grouped,
      counts,
      categories: CATEGORY_LABELS,
    });
  } finally {
    conn.release();
  }
}

// ── POST /api/student/[id]/documents ─────────────────────────────────────────
// Accepts multipart/form-data with fields:
//   file     — the actual file
//   name     — document name / label
//   category — one of ALLOWED_CATEGORIES
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const payload = await checkAuth(id);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data" },
      { status: 400 },
    );
  }

  const file = formData.get("file") as File | null;
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // ── Validate MIME type ────────────────────────────────────────────────────
  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json(
      {
        error: `File type not allowed. Accepted types: PDF, JPEG, PNG, WebP.`,
      },
      { status: 400 },
    );
  }

  // ── Validate file size ────────────────────────────────────────────────────
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File size must not exceed 5 MB." },
      { status: 400 },
    );
  }

  const category = String(formData.get("category") ?? "other").trim();
  if (!ALLOWED_CATEGORIES.includes(category)) {
    return NextResponse.json(
      {
        error: `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(", ")}`,
      },
      { status: 400 },
    );
  }

  const docName =
    String(formData.get("name") ?? "").trim() ||
    CATEGORY_LABELS[category] ||
    file.name;

  // ── Persist file to disk ──────────────────────────────────────────────────
  const uploadDir = path.join(process.cwd(), "public", "uploads", "student", id);
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  // Sanitise original file name and append timestamp to avoid collisions
  const ext       = path.extname(file.name).toLowerCase() || ".bin";
  const safeName  = `${category}_${Date.now()}${ext}`;
  const fullPath  = path.join(uploadDir, safeName);
  const publicUrl = `/uploads/student/${id}/${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, buffer);

  // ── Insert DB record ──────────────────────────────────────────────────────
  const conn = await pool.getConnection();
  try {
    await ensureTable(conn);

    const [result] = await conn.query(
      `INSERT INTO next_student_documents
         (student_id, name, file_path, file_type, file_size, category)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, docName, publicUrl, file.type, file.size, category],
    );

    const insertId = (result as { insertId: number }).insertId;

    return NextResponse.json(
      {
        success:  true,
        message:  "Document uploaded successfully.",
        document: {
          id:             insertId,
          name:           docName,
          file_path:      publicUrl,
          file_type:      file.type,
          file_size:      file.size,
          file_size_kb:   `${(file.size / 1024).toFixed(1)} KB`,
          category,
          category_label: CATEGORY_LABELS[category],
          is_image:       file.type.startsWith("image/"),
        },
      },
      { status: 201 },
    );
  } finally {
    conn.release();
  }
}

// ── DELETE /api/student/[id]/documents?docId=X ───────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const payload = await checkAuth(id);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const docId = req.nextUrl.searchParams.get("docId");
  if (!docId) {
    return NextResponse.json(
      { error: "docId query param is required" },
      { status: 400 },
    );
  }

  const conn = await pool.getConnection();
  try {
    await ensureTable(conn);

    // Fetch record first so we can delete the physical file
    const [rows] = await conn.query(
      `SELECT id, file_path
       FROM next_student_documents
       WHERE id = ? AND student_id = ?
       LIMIT 1`,
      [docId, id],
    );

    const list = rows as { id: number; file_path: string }[];
    if (!list.length) {
      return NextResponse.json(
        { error: "Document not found or does not belong to this student." },
        { status: 404 },
      );
    }

    const { file_path } = list[0];

    // Remove DB record
    await conn.query(
      `DELETE FROM next_student_documents WHERE id = ? AND student_id = ?`,
      [docId, id],
    );

    // Attempt to remove physical file (non-fatal if missing)
    try {
      const physicalPath = path.join(process.cwd(), "public", file_path);
      await unlink(physicalPath);
    } catch {
      // File already gone — silently continue
    }

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully.",
    });
  } finally {
    conn.release();
  }
}
