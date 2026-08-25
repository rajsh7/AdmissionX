import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendNewApplicationNotificationToCollege } from "@/lib/email";
import { sendSMSCollegeNewApplication } from "@/lib/sms";

/**
 * GET /api/cron/college-notification
 *
 * Sends a bi-daily activity digest to colleges that have received new
 * applications in the last 2 days and haven't been notified yet.
 *
 * Each college receives one batched digest email listing the count and the
 * most recent application details, encouraging them to log in and review.
 *
 * Triggered by Vercel Cron: "0 8 * / 2 * *" (every 2 days at 08:00 UTC)
 * Protected by Authorization: Bearer <CRON_SECRET>
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    // Find all active, verified colleges that haven't been notified in 2+ days
    const activeColleges = await db
      .collection("next_college_signups")
      .find({
        is_active: { $in: [1, true] },
        $or: [
          { last_notification_sent: { $exists: false } },
          { last_notification_sent: { $lt: twoDaysAgo } },
        ],
      })
      .toArray();

    let sentCount = 0;

    for (const college of activeColleges) {
      const collegeEmail   = college.email as string | undefined;
      const collegeName    = (college.name ?? college.college_name ?? "Institution") as string;
      const collegeId      = college.id ?? college._id;

      if (!collegeEmail) continue;

      try {
        // Count new applications for this college in the past 2 days
        const newApps = await db
          .collection("applications")
          .find({
            collegeId: collegeId,
            createdAt: { $gte: twoDaysAgo },
          })
          .toArray();

        // Only send notification if there are new applications
        if (newApps.length === 0) continue;

        // Use the most recent application as the representative entry
        const latestApp     = newApps[0];
        const studentName   = (latestApp.student_name ?? "A new student") as string;
        const appRef        = String(latestApp.applicationRef ?? latestApp._id);
        const courseName    = (latestApp.course_name ?? latestApp.courseName ?? "your programme") as string;

        await sendNewApplicationNotificationToCollege(
          collegeEmail,
          collegeName,
          newApps.length > 1
            ? `${studentName} and ${newApps.length - 1} other student(s)`
            : studentName,
          appRef,
          newApps.length > 1
            ? `${courseName} (+${newApps.length - 1} more)`
            : courseName
        );

        try {
          if (college.phone) {
            await sendSMSCollegeNewApplication(
              college.phone,
              appRef,
              newApps.length > 1
                ? `${studentName} and ${newApps.length - 1} other student(s)`
                : studentName
            );
          }
        } catch (smsErr) {
          console.error(`[College Notification Cron] SMS failed for ${collegeEmail}:`, smsErr);
        }

        await db.collection("next_college_signups").updateOne(
          { _id: college._id },
          {
            $set: {
              last_notification_sent: new Date(),
              updated_at: new Date(),
            },
          }
        );

        sentCount++;
      } catch (emailErr) {
        console.error(
          `[College Notification Cron] Failed to send to ${collegeEmail}:`,
          emailErr
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Application digest notifications sent to ${sentCount} college(s).`,
      processed: activeColleges.length,
      sent: sentCount,
    });
  } catch (err) {
    console.error("[College Notification Cron Error]:", err);
    return NextResponse.json(
      { error: "Failed to send college notifications." },
      { status: 500 }
    );
  }
}
