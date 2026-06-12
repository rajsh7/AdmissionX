import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendCounsellingScheduledEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { student_id, application_id, date, time, venue } = await req.json();

    if (!student_id || !application_id || !date || !time || !venue) {
      return NextResponse.json(
        { error: "student_id, application_id, date, time, and venue are required." },
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

    const counsellingData = {
      application_id,
      student_id: String(student_id),
      date,
      time,
      venue,
      status: "scheduled",
      created_at: new Date(),
    };

    await db.collection("counselling_sessions").insertOne(counsellingData);

    await db.collection("applications").updateOne(
      { _id: application_id },
      {
        $set: {
          counselling_scheduled: true,
          counselling_date: date,
          counselling_time: time,
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
          await sendCounsellingScheduledEmail(
            student.email,
            student.name || "Student",
            date,
            time,
            venue
          );
        }
      } catch (emailErr) {
        console.error("[Counselling] Email failed:", emailErr);
      }
    });

    return NextResponse.json({
      success: true,
      message: "Counselling session scheduled successfully.",
      counselling: counsellingData,
    });
  } catch (err) {
    console.error("[Counselling Scheduling Error]:", err);
    return NextResponse.json({ error: "Failed to schedule counselling." }, { status: 500 });
  }
}
