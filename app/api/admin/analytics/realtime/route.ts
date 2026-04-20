import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db  = await getDb();
    const now = new Date();
    const today = new Date(now); today.setHours(0, 0, 0, 0);
    const week  = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);
    const month = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const days14 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [
      totalStudents, studentsToday, studentsWeek, studentsMonth, activeStudents,
      totalColleges, collegesToday,
      totalApplications, newApplications,
      // Page views
      viewsToday, viewsWeek, viewsMonth,
      uniqueVisitorsToday, uniqueVisitorsWeek,
      // Top pages
      topPages,
      // Device breakdown
      deviceBreakdown,
      // Browser breakdown
      browserBreakdown,
      // Daily chart data
      studentSignupsByDay, collegeSignupsByDay, viewsByDay,
    ] = await Promise.all([
      db.collection("next_student_signups").countDocuments(),
      db.collection("next_student_signups").countDocuments({ created_at: { $gte: today } }),
      db.collection("next_student_signups").countDocuments({ created_at: { $gte: week } }),
      db.collection("next_student_signups").countDocuments({ created_at: { $gte: month } }),
      db.collection("next_student_signups").countDocuments({ is_active: { $in: [1, true] } }),

      db.collection("next_college_signups").countDocuments(),
      db.collection("next_college_signups").countDocuments({ created_at: { $gte: today } }),

      db.collection("application").countDocuments(),
      db.collection("applications").countDocuments(),

      // Page views
      db.collection("page_views").countDocuments({ createdAt: { $gte: today } }),
      db.collection("page_views").countDocuments({ createdAt: { $gte: week } }),
      db.collection("page_views").countDocuments({ createdAt: { $gte: month } }),

      // Unique visitors (by sessionId)
      db.collection("page_views").distinct("sessionId", { createdAt: { $gte: today }, sessionId: { $ne: null } }).then(r => r.length),
      db.collection("page_views").distinct("sessionId", { createdAt: { $gte: week }, sessionId: { $ne: null } }).then(r => r.length),

      // Top 10 pages
      db.collection("page_views").aggregate([
        { $match: { createdAt: { $gte: week } } },
        { $group: { _id: "$path", views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 10 },
      ]).toArray(),

      // Device breakdown
      db.collection("page_views").aggregate([
        { $match: { createdAt: { $gte: month } } },
        { $group: { _id: "$device", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray(),

      // Browser breakdown
      db.collection("page_views").aggregate([
        { $match: { createdAt: { $gte: month } } },
        { $group: { _id: "$browser", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray(),

      // Student signups by day
      db.collection("next_student_signups").aggregate([
        { $match: { created_at: { $gte: days14 } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]).toArray(),

      // College signups by day
      db.collection("next_college_signups").aggregate([
        { $match: { created_at: { $gte: days14 } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]).toArray(),

      // Page views by day
      db.collection("page_views").aggregate([
        { $match: { createdAt: { $gte: days14 } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]).toArray(),
    ]);

    // Build 14-day labels
    const days: string[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      days.push(d.toISOString().slice(0, 10));
    }

    const studentMap = new Map(studentSignupsByDay.map((r: any) => [r._id, r.count]));
    const collegeMap = new Map(collegeSignupsByDay.map((r: any) => [r._id, r.count]));
    const viewMap    = new Map(viewsByDay.map((r: any) => [r._id, r.count]));

    const chartData = days.map(day => ({
      date:     day,
      label:    new Date(day + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      students: studentMap.get(day) ?? 0,
      colleges: collegeMap.get(day) ?? 0,
      views:    viewMap.get(day)    ?? 0,
    }));

    const totalViews = viewsMonth;
    const deviceTotal = deviceBreakdown.reduce((s: number, d: any) => s + d.count, 0) || 1;
    const browserTotal = browserBreakdown.reduce((s: number, d: any) => s + d.count, 0) || 1;

    return NextResponse.json({
      timestamp: now.toISOString(),
      students: { total: totalStudents, active: activeStudents, today: studentsToday, week: studentsWeek, month: studentsMonth },
      colleges: { total: totalColleges, today: collegesToday },
      applications: { total: totalApplications + newApplications },
      pageViews: {
        today: viewsToday,
        week:  viewsWeek,
        month: viewsMonth,
        total: totalViews,
        uniqueToday: uniqueVisitorsToday,
        uniqueWeek:  uniqueVisitorsWeek,
      },
      topPages: topPages.map((p: any) => ({ path: p._id, views: p.views })),
      devices:  deviceBreakdown.map((d: any) => ({ device: d._id || "unknown", count: d.count, pct: Math.round((d.count / deviceTotal) * 100) })),
      browsers: browserBreakdown.map((d: any) => ({ browser: d._id || "Other", count: d.count, pct: Math.round((d.count / browserTotal) * 100) })),
      chartData,
    });
  } catch (e) {
    console.error("[analytics/realtime]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
