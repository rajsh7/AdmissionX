import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyStudentToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import crypto from "crypto";
import { sendPaymentSuccessEmail, sendPaymentFailedEmail } from "@/lib/email";

async function checkAuth(studentId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_student")?.value;
  if (!token) return null;
  const payload = await verifyStudentToken(token);
  if (!payload || String(payload.id) !== studentId) return null;
  return payload;
}

export async function POST(req: NextRequest) {
  let body: {
    student_id?: number | string;
    application_id?: unknown;
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

  if (!student_id) return NextResponse.json({ error: "student_id is required." }, { status: 400 });
  if (!application_id) return NextResponse.json({ error: "application_id is required." }, { status: 400 });
  if (!card_name || !String(card_name).trim()) return NextResponse.json({ error: "card_name is required." }, { status: 400 });
  if (!card_last4 || !/^\d{4}$/.test(String(card_last4))) return NextResponse.json({ error: "card_last4 must be exactly 4 digits." }, { status: 400 });

  const amountNum = parseFloat(String(amount ?? "0"));
  if (isNaN(amountNum) || amountNum <= 0) return NextResponse.json({ error: "amount must be a positive number." }, { status: 400 });

  const payload = await checkAuth(String(student_id));
  if (!payload) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const db = await getDb();
  const app = await db.collection("applications").findOne({
    _id: application_id,
    studentId: String(student_id),
  });

  if (!app) return NextResponse.json({ error: "Application not found or does not belong to this student." }, { status: 404 });
  if (app.payment_status === "paid") return NextResponse.json({ error: "This application has already been paid for.", transaction_id: null }, { status: 409 });
  if (app.status === "rejected") return NextResponse.json({ error: "Cannot process payment for a rejected application." }, { status: 409 });

  const transactionId = `ADX-TXN-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

  // Simulate payment processing (replace with actual payment gateway)
  const paymentSuccess = Math.random() > 0.1; // 90% success rate for demo

  if (!paymentSuccess) {
    // Payment failed
    setImmediate(async () => {
      try {
        const studentDoc = await db.collection("next_student_signups").findOne(
          { id: String(student_id) },
          { projection: { name: 1, email: 1 } }
        );
        
        if (studentDoc) {
          await sendPaymentFailedEmail(studentDoc.email, studentDoc.name || "Student");
        }
      } catch (emailErr) {
        console.error("[Payment Failed] Email notification failed:", emailErr);
      }
    });

    return NextResponse.json(
      { error: "Payment processing failed. Please try again.", transaction_id: null },
      { status: 402 }
    );
  }

  await db.collection("applications").updateOne(
    { _id: application_id },
    { $set: { payment_status: "paid", transaction_id: transactionId, amount_paid: amountNum, updated_at: new Date() } }
  );

  const receipt = {
    transaction_id: transactionId,
    application_ref: app.applicationRef || app.application_ref,
    college_name: app.collegeName || app.college_name || "N/A",
    course_name: app.courseName || app.course_name || "N/A",
    degree_name: app.degreeName || app.degree_name || "",
    amount_paid: amountNum,
    card_last4,
    card_name: String(card_name).trim(),
    paid_at: new Date().toISOString(),
    status: "paid",
  };

  // Send payment success email
  setImmediate(async () => {
    try {
      const studentDoc = await db.collection("next_student_signups").findOne(
        { id: String(student_id) },
        { projection: { name: 1, email: 1 } }
      );
      
      if (studentDoc) {
        await sendPaymentSuccessEmail(
          studentDoc.email,
          studentDoc.name || "Student",
          String(amountNum),
          transactionId,
          new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        );
      }
    } catch (emailErr) {
      console.error("[Payment] Email notification failed:", emailErr);
    }
  });

  return NextResponse.json({
    success: true,
    message: "Payment processed successfully. Your application has been confirmed.",
    receipt,
  });
}
