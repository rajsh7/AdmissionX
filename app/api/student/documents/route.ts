import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendDocumentsVerifiedEmail, sendDocumentsRejectedEmail } from "@/lib/email";
import { sendSMSDocumentsVerified, sendSMSDocumentsRejected } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const { application_id, status, reason } = await req.json();

    if (!application_id || !status) {
      return NextResponse.json({ error: "application_id and status are required." }, { status: 400 });
    }

    if (!["verified", "rejected"].includes(status)) {
      return NextResponse.json({ error: "status must be 'verified' or 'rejected'." }, { status: 400 });
    }

    const db = await getDb();
    const app = await db.collection("applications").findOne({ _id: application_id });

    if (!app) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    await db.collection("applications").updateOne(
      { _id: application_id },
      {
        $set: {
          document_status: status,
          document_verification_date: new Date(),
          document_rejection_reason: status === "rejected" ? reason : null,
          updated_at: new Date(),
        },
      }
    );

    setImmediate(async () => {
      try {
        const student = await db.collection("next_student_signups").findOne({
          _id: app.studentId,
        });

        if (student) {
          if (status === "verified") {
            await sendDocumentsVerifiedEmail(
              student.email,
              student.name || "Student",
              app.applicationRef || "APP-2026-88094",
              app.courseName || "B.Tech - Computer Science",
              app.collegeName || "Amity University"
            );

            try {
              if (student.phone) {
                await sendSMSDocumentsVerified(student.phone);
              }
            } catch (smsErr) {
              console.error("[Documents] Verification success SMS failed:", smsErr);
            }
          } else {
            await sendDocumentsRejectedEmail(
              student.email,
              student.name || "Student",
              reason || "Documents do not meet requirements",
              app.applicationRef || "APP-2026-88094"
            );

            try {
              if (student.phone) {
                await sendSMSDocumentsRejected(student.phone);
              }
            } catch (smsErr) {
              console.error("[Documents] Verification rejection SMS failed:", smsErr);
            }
          }
        }
      } catch (emailErr) {
        console.error("[Document Verification] Email failed:", emailErr);
      }
    });

    return NextResponse.json({
      success: true,
      message: `Documents ${status} successfully.`,
    });
  } catch (err) {
    console.error("[Document Verification Error]:", err);
    return NextResponse.json({ error: "Failed to verify documents." }, { status: 500 });
  }
}
