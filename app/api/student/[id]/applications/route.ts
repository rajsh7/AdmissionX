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
async function ensureTable(
  conn: Awaited<ReturnType<typeof pool.getConnection>>,
) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS next_student_applications (
      id                INT AUTO_INCREMENT PRIMARY KEY,
      application_ref   VARCHAR(20)  NOT NULL UNIQUE,
      student_id        INT          NOT NULL,
      collegeprofile_id INT          DEFAULT NULL,
      collegemaster_id  INT          DEFAULT NULL,
      college_name      VARCHAR(255) DEFAULT NULL,
      course_name       VARCHAR(255) DEFAULT NULL,
      degree_name       VARCHAR(255) DEFAULT NULL,
      stream_name       VARCHAR(255) DEFAULT NULL,
      fees              DECIMAL(10,2) DEFAULT 0.00,
      status            VARCHAR(30)  NOT NULL DEFAULT 'submitted',
      payment_status    VARCHAR(30)  NOT NULL DEFAULT 'pending',
      transaction_id    VARCHAR(255) DEFAULT NULL,
      amount_paid       DECIMAL(10,2) DEFAULT 0.00,
      notes             TEXT         DEFAULT NULL,
      created_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      updated_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_nsa_student (student_id),
      INDEX idx_nsa_status  (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

// ── GET /api/student/[id]/applications ────────────────────────────────────────
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
         id,
         application_ref,
         college_name,
         course_name,
         degree_name,
         stream_name,
         fees,
         status,
         payment_status,
         transaction_id,
         amount_paid,
         notes,
         created_at,
         updated_at
       FROM next_student_applications
       WHERE student_id = ?
       ORDER BY created_at DESC`,
      [id],
    );

    const applications = (rows as Record<string, unknown>[]).map((row) => {
      const status = String(row.status ?? "submitted");
      const payStatus = String(row.payment_status ?? "pending");

      // ── Derive UI helpers from status string ──────────────────────────────
      const statusMeta: Record<
        string,
        {
          label: string;
          cls: string;
          icon: string;
          progress: number;
          progressColor: string;
        }
      > = {
        draft: {
          label: "Draft",
          cls: "bg-slate-100 text-slate-600",
          icon: "edit",
          progress: 20,
          progressColor: "slate",
        },
        submitted: {
          label: "Submitted",
          cls: "bg-blue-100 text-blue-700",
          icon: "send",
          progress: 50,
          progressColor: "blue",
        },
        under_review: {
          label: "Under Review",
          cls: "bg-amber-100 text-amber-700",
          icon: "schedule",
          progress: 65,
          progressColor: "amber",
        },
        verified: {
          label: "Verified",
          cls: "bg-emerald-100 text-emerald-700",
          icon: "check_circle",
          progress: 85,
          progressColor: "emerald",
        },
        rejected: {
          label: "Rejected",
          cls: "bg-red-100 text-red-700",
          icon: "cancel",
          progress: 100,
          progressColor: "red",
        },
        enrolled: {
          label: "Enrolled",
          cls: "bg-purple-100 text-purple-700",
          icon: "school",
          progress: 100,
          progressColor: "purple",
        },
      };

      const payMeta: Record<
        string,
        { label: string; cls: string; icon: string }
      > = {
        pending: {
          label: "Payment Pending",
          cls: "bg-amber-100 text-amber-700",
          icon: "pending",
        },
        paid: {
          label: "Paid",
          cls: "bg-emerald-100 text-emerald-700",
          icon: "payments",
        },
        failed: {
          label: "Payment Failed",
          cls: "bg-red-100 text-red-700",
          icon: "money_off",
        },
        refunded: {
          label: "Refunded",
          cls: "bg-slate-100 text-slate-600",
          icon: "undo",
        },
      };

      const sm = statusMeta[status] ?? statusMeta["submitted"];
      const pm = payMeta[payStatus] ?? payMeta["pending"];

      const actionLabel =
        status === "draft"
          ? "Complete Application"
          : payStatus === "pending" && status === "verified"
            ? "Pay Fees"
            : "View Details";

      return {
        ...row,
        // Explicitly type the string fields so stats filters work
        status: status,
        payment_status: payStatus,
        statusLabel: sm.label,
        statusClass: sm.cls,
        statusIcon: sm.icon,
        progress: sm.progress,
        progressColor: sm.progressColor,
        paymentLabel: pm.label,
        paymentClass: pm.cls,
        paymentIcon: pm.icon,
        actionLabel,
        fees: Number(row.fees ?? 0),
        amount_paid: Number(row.amount_paid ?? 0),
        submittedOn: row.created_at
          ? new Date(row.created_at as string).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : null,
      };
    });

    // ── Summary stats ─────────────────────────────────────────────────────────
    const stats = {
      total: applications.length,
      submitted: applications.filter((a) => a.status === "submitted").length,
      under_review: applications.filter((a) => a.status === "under_review")
        .length,
      verified: applications.filter((a) => a.status === "verified").length,
      enrolled: applications.filter((a) => a.status === "enrolled").length,
      rejected: applications.filter((a) => a.status === "rejected").length,
      pending_pay: applications.filter(
        (a) => a.payment_status === "pending" && a.status === "verified",
      ).length,
    };

    return NextResponse.json({ applications, stats });
  } finally {
    conn.release();
  }
}

// ── DELETE /api/student/[id]/applications?appId=X ────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const payload = await checkAuth(id);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appId = req.nextUrl.searchParams.get("appId");
  if (!appId) {
    return NextResponse.json({ error: "appId is required" }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    await ensureTable(conn);

    // Only allow deleting draft applications
    const [result] = await conn.query(
      `DELETE FROM next_student_applications
       WHERE id = ? AND student_id = ? AND status = 'draft'`,
      [appId, id],
    );

    const affectedRows = (result as { affectedRows: number }).affectedRows;
    if (!affectedRows) {
      return NextResponse.json(
        {
          error:
            "Application not found or cannot be deleted (only drafts can be removed).",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } finally {
    conn.release();
  }
}
