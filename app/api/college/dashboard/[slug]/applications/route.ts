import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCollegeToken } from "@/lib/auth";
import pool from "@/lib/db";

// ── Auth + ownership helper ───────────────────────────────────────────────────
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

// ── Status meta helpers ───────────────────────────────────────────────────────
const STATUS_META: Record<
  string,
  { label: string; cls: string; icon: string; progress: number }
> = {
  draft:        { label: "Draft",        cls: "bg-slate-100 text-slate-600",   icon: "edit",         progress: 20  },
  submitted:    { label: "Submitted",    cls: "bg-blue-100 text-blue-700",     icon: "send",         progress: 50  },
  under_review: { label: "Under Review", cls: "bg-amber-100 text-amber-700",   icon: "schedule",     progress: 65  },
  verified:     { label: "Verified",     cls: "bg-emerald-100 text-emerald-700",icon: "check_circle", progress: 85  },
  rejected:     { label: "Rejected",     cls: "bg-red-100 text-red-700",       icon: "cancel",       progress: 100 },
  enrolled:     { label: "Enrolled",     cls: "bg-purple-100 text-purple-700", icon: "school",       progress: 100 },
};

const PAY_META: Record<string, { label: string; cls: string; icon: string }> = {
  pending:  { label: "Payment Pending", cls: "bg-amber-100 text-amber-700",    icon: "pending"   },
  paid:     { label: "Paid",            cls: "bg-emerald-100 text-emerald-700", icon: "payments"  },
  failed:   { label: "Payment Failed",  cls: "bg-red-100 text-red-700",        icon: "money_off" },
  refunded: { label: "Refunded",        cls: "bg-slate-100 text-slate-600",    icon: "undo"      },
};

// ── GET /api/college/dashboard/[slug]/applications ────────────────────────────
// Query params: status, search, page, limit
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp     = req.nextUrl.searchParams;
  const status = sp.get("status")?.trim() ?? "";
  const search = sp.get("search")?.trim() ?? "";
  const page   = Math.max(1, parseInt(sp.get("page")  ?? "1",  10));
  const limit  = Math.min(50, Math.max(1, parseInt(sp.get("limit") ?? "20", 10)));
  const offset = (page - 1) * limit;

  const conn = await pool.getConnection();
  try {
    // Ensure applications table exists (created by student flow but guard anyway)
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
        INDEX idx_nsa_status  (status),
        INDEX idx_nsa_college (collegeprofile_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Build WHERE clause
    const whereParts = ["a.collegeprofile_id = ?"];
    const whereValues: unknown[] = [auth.collegeprofile_id];

    if (status) {
      whereParts.push("a.status = ?");
      whereValues.push(status);
    }
    if (search) {
      whereParts.push(
        `(a.application_ref LIKE ?
          OR a.course_name   LIKE ?
          OR a.degree_name   LIKE ?
          OR a.stream_name   LIKE ?
          OR s.name          LIKE ?
          OR s.email         LIKE ?)`,
      );
      const like = `%${search}%`;
      whereValues.push(like, like, like, like, like, like);
    }

    const whereSQL = `WHERE ${whereParts.join(" AND ")}`;

    // Count total
    const [countRows] = await conn.query(
      `SELECT COUNT(*) AS total
       FROM next_student_applications a
       LEFT JOIN next_student_signups s ON s.id = a.student_id
       ${whereSQL}`,
      whereValues,
    );
    const total = (countRows as { total: number }[])[0]?.total ?? 0;

    // Fetch paginated rows
    const [rows] = await conn.query(
      `SELECT
         a.id,
         a.application_ref,
         a.student_id,
         a.course_name,
         a.degree_name,
         a.stream_name,
         a.fees,
         a.status,
         a.payment_status,
         a.transaction_id,
         a.amount_paid,
         a.notes,
         a.created_at,
         a.updated_at,
         s.name  AS student_name,
         s.email AS student_email,
         s.phone AS student_phone
       FROM next_student_applications a
       LEFT JOIN next_student_signups s ON s.id = a.student_id
       ${whereSQL}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [...whereValues, limit, offset],
    );

    const applications = (rows as Record<string, unknown>[]).map((row) => {
      const st  = String(row.status         ?? "submitted");
      const pay = String(row.payment_status ?? "pending");
      const sm  = STATUS_META[st]  ?? STATUS_META["submitted"];
      const pm  = PAY_META[pay]    ?? PAY_META["pending"];
      return {
        ...row,
        status:         st,
        payment_status: pay,
        statusLabel:    sm.label,
        statusClass:    sm.cls,
        statusIcon:     sm.icon,
        progress:       sm.progress,
        paymentLabel:   pm.label,
        paymentClass:   pm.cls,
        paymentIcon:    pm.icon,
        fees:           Number(row.fees       ?? 0),
        amount_paid:    Number(row.amount_paid ?? 0),
        submittedOn:    row.created_at
          ? new Date(row.created_at as string).toLocaleDateString("en-IN", {
              day: "2-digit", month: "short", year: "numeric",
            })
          : null,
      };
    });

    // Summary stats
    const allRows = applications; // already filtered
    const stats = {
      total,
      submitted:    allRows.filter((a) => a.status === "submitted").length,
      under_review: allRows.filter((a) => a.status === "under_review").length,
      verified:     allRows.filter((a) => a.status === "verified").length,
      enrolled:     allRows.filter((a) => a.status === "enrolled").length,
      rejected:     allRows.filter((a) => a.status === "rejected").length,
      paid:         allRows.filter((a) => a.payment_status === "paid").length,
    };

    return NextResponse.json({
      applications,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } finally {
    conn.release();
  }
}

// ── PUT /api/college/dashboard/[slug]/applications ────────────────────────────
// Body: { application_id: number, status: string, notes?: string }
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { application_id?: number; status?: string; notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { application_id, status, notes } = body;

  if (!application_id) {
    return NextResponse.json({ error: "application_id is required." }, { status: 400 });
  }

  const allowed_statuses = ["submitted", "under_review", "verified", "rejected", "enrolled"];
  if (!status || !allowed_statuses.includes(status)) {
    return NextResponse.json(
      { error: `status must be one of: ${allowed_statuses.join(", ")}` },
      { status: 400 },
    );
  }

  const conn = await pool.getConnection();
  try {
    // Verify the application belongs to this college
    const [checkRows] = await conn.query(
      `SELECT id, status FROM next_student_applications
       WHERE id = ? AND collegeprofile_id = ?
       LIMIT 1`,
      [application_id, auth.collegeprofile_id],
    );
    const checkList = checkRows as { id: number; status: string }[];
    if (!checkList.length) {
      return NextResponse.json(
        { error: "Application not found or does not belong to this college." },
        { status: 404 },
      );
    }

    const updateParts = ["status = ?", "updated_at = CURRENT_TIMESTAMP"];
    const updateValues: unknown[] = [status];

    if (notes !== undefined) {
      updateParts.push("notes = ?");
      updateValues.push(notes?.trim() || null);
    }

    await conn.query(
      `UPDATE next_student_applications
       SET ${updateParts.join(", ")}
       WHERE id = ?`,
      [...updateValues, application_id],
    );

    const sm = STATUS_META[status] ?? STATUS_META["submitted"];

    return NextResponse.json({
      success:     true,
      message:     `Application status updated to "${sm.label}".`,
      status,
      statusLabel: sm.label,
      statusClass: sm.cls,
      statusIcon:  sm.icon,
    });
  } finally {
    conn.release();
  }
}
