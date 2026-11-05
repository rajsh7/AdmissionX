import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendProfileCompletionReminder } from "@/lib/email";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "your-secret-key";

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const incompleteProfiles = await db
      .collection("next_student_signups")
      .find({
        is_active: 1,
        created_at: { $lt: threeDaysAgo },
        profile_reminder_sent: { $ne: true },
      })
      .toArray();

    let sentCount = 0;

    for (const student of incompleteProfiles) {
      const profile = await db.collection("next_student_profiles").findOne({
        student_id: String(student._id),
      });

      const isIncomplete =
        !profile ||
        !profile.dob ||
        !profile.gender ||
        !profile.city ||
        !profile.state;

      if (isIncomplete) {
        await sendProfileCompletionReminder(student.email, student.name || "Student");
        await db.collection("next_student_signups").updateOne(
          { _id: student._id },
          { $set: { profile_reminder_sent: true, updated_at: new Date() } }
        );
        sentCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Profile completion reminders sent to ${sentCount} students.`,
    });
  } catch (err) {
    console.error("[Profile Reminder Cron Error]:", err);
    return NextResponse.json({ error: "Failed to send reminders." }, { status: 500 });
  }
}
