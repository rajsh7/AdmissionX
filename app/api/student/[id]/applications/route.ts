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
  // Schema managed externally
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
         a.id,
         a.applicationRef AS application_ref,
         COALESCE(NULLIF(TRIM(u.firstname), ''), cp.slug) AS college_name,
         co.name AS course_name,
         d.name AS degree_name,
         fa.name AS stream_name,
         cm.fees,
         a.status,
         'pending' AS payment_status,
         NULL AS transaction_id,
         0 AS amount_paid,
         NULL AS notes,
         a.createdAt AS created_at,
         a.createdAt AS updated_at
       FROM applications a
       LEFT JOIN collegeprofile cp ON cp.id = a.collegeId
       LEFT JOIN users u ON u.id = cp.users_id
       LEFT JOIN collegemaster cm ON cm.id = a.courseId
       LEFT JOIN course co ON co.id = cm.course_id
       LEFT JOIN degree d ON d.id = cm.degree_id
       LEFT JOIN functionalarea fa ON fa.id = cm.functionalarea_id
       WHERE a.studentId = ?
       ORDER BY a.createdAt DESC`,
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
      `DELETE FROM applications
       WHERE id = ? AND studentId = ? AND status = 'draft'`,
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
