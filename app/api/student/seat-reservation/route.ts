import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendSeatReservationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { student_id, application_id } = await req.json();

    if (!student_id || !application_id) {
      return NextResponse.json(
        { error: "student_id and application_id are required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const app = await db.collection("applications").findOne({
      _id: application_id,
      studentId: String(student_id),
    });

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
      { _id: application_id },
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
          await sendSeatReservationEmail(
            student.email,
            student.name || "Student",
            app.courseName || "Course",
            app.collegeName || "College"
          );
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
