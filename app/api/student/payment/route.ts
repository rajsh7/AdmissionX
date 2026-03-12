import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyStudentToken } from "@/lib/auth";
import pool from "@/lib/db";
import crypto from "crypto";

// ── Auth helper ───────────────────────────────────────────────────────────────
async function checkAuth(studentId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_student")?.value;
  if (!token) return null;
  const payload = await verifyStudentToken(token);
  if (!payload || String(payload.id) !== studentId) return null;
  return payload;
}

// ── Ensure applications table exists ─────────────────────────────────────────
async function ensureTable(conn: Awaited<ReturnType<typeof pool.getConnection>>) {
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

// ── POST /api/student/payment ─────────────────────────────────────────────────
// Body:
//   student_id     — the student making payment
//   application_id — the next_student_applications.id to pay for
//   card_name      — name on card
//   card_last4     — last 4 digits of card (never store full PAN)
//   amount         — amount being paid (must match fees)
//   save_card      — boolean preference (no-op in simulation)
export async function POST(req: NextRequest) {
  let body: {
    student_id?: number | string;
    application_id?: number | string;
    card_name?: string;
    card_last4?: string;
    amount?: number | string;
    save_card?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { student_id, application_id, card_name, card_last4, amount } = body;

  // ── Input validation ──────────────────────────────────────────────────────
  if (!student_id) {
    return NextResponse.json({ error: "student_id is required." }, { status: 400 });
  }
  if (!application_id) {
    return NextResponse.json({ error: "application_id is required." }, { status: 400 });
  }
  if (!card_name || !String(card_name).trim()) {
    return NextResponse.json({ error: "card_name is required." }, { status: 400 });
  }
  if (!card_last4 || !/^\d{4}$/.test(String(card_last4))) {
    return NextResponse.json(
      { error: "card_last4 must be exactly 4 digits." },
      { status: 400 },
    );
  }

  const amountNum = parseFloat(String(amount ?? "0"));
  if (isNaN(amountNum) || amountNum <= 0) {
    return NextResponse.json(
      { error: "amount must be a positive number." },
      { status: 400 },
    );
  }

  // ── Auth check ────────────────────────────────────────────────────────────
  const payload = await checkAuth(String(student_id));
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const conn = await pool.getConnection();
  try {
    await ensureTable(conn);

    // ── Fetch the application ───────────────────────────────────────────────
    const [appRows] = await conn.query(
      `SELECT
         id,
         application_ref,
         student_id,
         college_name,
         course_name,
         degree_name,
         fees,
         status,
         payment_status,
         amount_paid
       FROM next_student_applications
       WHERE id = ? AND student_id = ?
       LIMIT 1`,
      [application_id, student_id],
    );

    const appList = appRows as {
      id: number;
      application_ref: string;
      student_id: number;
      college_name: string | null;
      course_name: string | null;
      degree_name: string | null;
      fees: number;
      status: string;
      payment_status: string;
      amount_paid: number;
    }[];

    if (!appList.length) {
      return NextResponse.json(
        { error: "Application not found or does not belong to this student." },
        { status: 404 },
      );
    }

    const app = appList[0];

    // ── Guard: already paid ─────────────────────────────────────────────────
    if (app.payment_status === "paid") {
      return NextResponse.json(
        {
          error: "This application has already been paid for.",
          transaction_id: null,
        },
        { status: 409 },
      );
    }

    // ── Guard: rejected applications cannot be paid ─────────────────────────
    if (app.status === "rejected") {
      return NextResponse.json(
        { error: "Cannot process payment for a rejected application." },
        { status: 409 },
      );
    }

    // ── Simulate payment processing ─────────────────────────────────────────
    // In production, replace this block with a real payment gateway call
    // (e.g. Razorpay, PayU, Stripe) and only update the DB on success callback.

    // Generate a unique transaction reference
    const transactionId = `ADX-TXN-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;

    // Simulate a ~95% success rate (deterministic in dev — always succeeds)
    const paymentSucceeded = true; // Replace with gateway response in production

    if (!paymentSucceeded) {
      // Update status to failed
      await conn.query(
        `UPDATE next_student_applications
         SET payment_status = 'failed',
             transaction_id  = ?,
             updated_at      = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [transactionId, application_id],
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment was declined by the bank. Please check your card details and try again.",
          transaction_id: transactionId,
        },
        { status: 402 },
      );
    }

    // ── Mark as paid ──────────────────────────────────────────────────────
    await conn.query(
      `UPDATE next_student_applications
       SET payment_status = 'paid',
           transaction_id  = ?,
           amount_paid     = ?,
           updated_at      = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [transactionId, amountNum, application_id],
    );

    // ── Build receipt ─────────────────────────────────────────────────────
    const receipt = {
      transaction_id:  transactionId,
      application_ref: app.application_ref,
      college_name:    app.college_name ?? "N/A",
      course_name:     app.course_name ?? "N/A",
      degree_name:     app.degree_name ?? "",
      amount_paid:     amountNum,
      card_last4,
      card_name:       String(card_name).trim(),
      paid_at:         new Date().toISOString(),
      status:          "paid",
    };

    return NextResponse.json({
      success: true,
      message:
        "Payment processed successfully. Your application has been confirmed.",
      receipt,
    });
  } finally {
    conn.release();
  }
}
