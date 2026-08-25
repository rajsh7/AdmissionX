import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyStudentToken, verifyAdminToken, STUDENT_COOKIE, ADMIN_COOKIE } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import { sendSeatReservationEmail } from "@/lib/email";
import { sendSMSSeatReservedDetails } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const { student_id, application_id } = await req.json();

    if (!student_id || !application_id) {
      return NextResponse.json(
        { error: "student_id and application_id are required." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const studentToken = cookieStore.get(STUDENT_COOKIE)?.value;
    const adminToken = cookieStore.get(ADMIN_COOKIE)?.value;

    let isAuthorized = false;
    if (studentToken) {
      const studentPayload = await verifyStudentToken(studentToken);
      if (studentPayload && String(studentPayload.id) === String(student_id)) {
        isAuthorized = true;
      }
    } else if (adminToken && (await verifyAdminToken(adminToken))) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const db = await getDb();
    const appFilter = {
      _id: ObjectId.isValid(application_id) ? new ObjectId(application_id) : application_id,
      studentId: String(student_id),
    };
    const app = await db.collection("applications").findOne(appFilter);

    if (!app) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    if (app.status !== "approved") {
      return NextResponse.json(
        { error: "Seat can only be reserved for approved applications." },
        { status: 400 }
      );
    }

    if (app.seat_reserved) {
      return NextResponse.json(
        { error: "Seat is already reserved for this application." },
        { status: 409 }
      );
    }

    await db.collection("applications").updateOne(
      appFilter,
      {
        $set: {
          seat_reserved: true,
          seat_reservation_date: new Date(),
          updated_at: new Date(),
        },
      }
    );

    setImmediate(async () => {
      try {
        const student = await db.collection("next_student_signups").findOne({
          email: app.personal_info?.email || "",
        });

        if (student) {
          const appRef = app.applicationRef || app.application_ref || "APP-2026-88094";
          await sendSeatReservationEmail(
            student.email,
            student.name || "Student",
            app.courseName || "Course",
            app.collegeName || "College",
            appRef
          );

          try {
            if (student.phone) {
              await sendSMSSeatReservedDetails(
                student.phone,
                app.courseName || "Course",
                app.collegeName || "College"
              );
            }
          } catch (smsErr) {
            console.error("[Seat Reservation] SMS failed:", smsErr);
          }
        }
      } catch (emailErr) {
        console.error("[Seat Reservation] Email failed:", emailErr);
      }
    });

    return NextResponse.json({
      success: true,
      message: "Seat reserved successfully.",
    });
  } catch (err) {
    console.error("[Seat Reservation Error]:", err);
    return NextResponse.json({ error: "Failed to reserve seat." }, { status: 500 });
  }
}
