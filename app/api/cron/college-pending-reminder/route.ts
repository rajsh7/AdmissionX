import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendCollegeVerificationPendingEmail } from "@/lib/email";

/**
 * GET /api/cron/college-pending-reminder
 *
 * Sends a reminder email to colleges that have not yet completed verification
 * (is_active = 0 or is_verified = false) and were registered 5+ days ago.
 *
 * Triggered by Vercel Cron: "0 10 * / 5 * *" (every 5 days at 10:00 UTC)
 * Protected by Authorization: Bearer <CRON_SECRET>
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "your-secret-key";

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    // Find unverified colleges registered 5+ days ago that haven't been reminded yet
    const pendingColleges = await db
      .collection("next_college_signups")
      .find({
        $or: [{ is_active: 0 }, { is_active: false }, { is_verified: false }],
        created_at: { $lt: fiveDaysAgo },
        $and: [
          {
            $or: [
              { college_reminder_sent: { $ne: true } },
              { reminder_sent_at: { $lt: fiveDaysAgo } },
            ],
          },
        ],
      })
      .toArray();

    let sentCount = 0;

    for (const college of pendingColleges) {
      const collegeEmail  = college.email as string | undefined;
      const collegeName   = (college.name ?? college.college_name ?? "Institution") as string;
      const registrationId = String(college._id);

      if (!collegeEmail) continue;

      try {
        await sendCollegeVerificationPendingEmail(
          collegeEmail,
          collegeName,
          "NAAC/NBA Accreditation Certificate, Trust Deed / Society Registration Certificate, PAN Card of Institution",
          registrationId
        );

        await db.collection("next_college_signups").updateOne(
          { _id: college._id },
          {
            $set: {
              college_reminder_sent: true,
              reminder_sent_at: new Date(),
              updated_at: new Date(),
            },
          }
        );

        sentCount++;
      } catch (emailErr) {
        console.error(
          `[College Pending Reminder Cron] Failed to send to ${collegeEmail}:`,
          emailErr
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `College verification reminders sent to ${sentCount} institution(s).`,
      processed: pendingColleges.length,
      sent: sentCount,
    });
  } catch (err) {
    console.error("[College Pending Reminder Cron Error]:", err);
    return NextResponse.json(
      { error: "Failed to send college verification reminders." },
      { status: 500 }
    );
  }
}
