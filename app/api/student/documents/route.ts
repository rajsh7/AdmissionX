import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, verifyCollegeToken, ADMIN_COOKIE, COLLEGE_COOKIE } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import { sendDocumentsVerifiedEmail, sendDocumentsRejectedEmail } from "@/lib/email";
import { sendSMSDocumentsVerified, sendSMSDocumentsRejected } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get(ADMIN_COOKIE)?.value;
    const collegeToken = cookieStore.get(COLLEGE_COOKIE)?.value;

    let isAuthorized = false;
    if (adminToken && (await verifyAdminToken(adminToken))) {
      isAuthorized = true;
    } else if (collegeToken && (await verifyCollegeToken(collegeToken))) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized. Admin or College login required." }, { status: 401 });
    }

    const { application_id, status, reason } = await req.json();

    if (!application_id || !status) {
      return NextResponse.json({ error: "application_id and status are required." }, { status: 400 });
    }

    if (!["verified", "rejected"].includes(status)) {
      return NextResponse.json({ error: "status must be 'verified' or 'rejected'." }, { status: 400 });
    }

    const db = await getDb();
    const appFilter = {
      _id: ObjectId.isValid(application_id) ? new ObjectId(application_id) : application_id,
    };
    const app = await db.collection("applications").findOne(appFilter);

    if (!app) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    await db.collection("applications").updateOne(
      appFilter,
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
