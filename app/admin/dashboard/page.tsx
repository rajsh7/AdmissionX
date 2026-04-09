import { getDb } from "@/lib/db";
import DashboardClient from "../_components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const db = await getDb();

  // KPI counts
  const [totalStudents, totalColleges, totalAdmins, totalApplications, pendingColleges, activeBlogs] =
    await Promise.all([
      db.collection("next_student_signups").countDocuments(),
      db.collection("collegeprofile").countDocuments(),
      db.collection("next_admin_users").countDocuments({ is_active: true }),
      db.collection("applications").countDocuments(),
      db.collection("next_college_signups").countDocuments({ status: "pending" }),
      db.collection("blogs").countDocuments({ isactive: 1 }),
    ]);

  // Recent students
  const recentStudents = await db.collection("next_student_signups")
    .find({}, { projection: { _id: 1, name: 1, email: 1, phone: 1, is_active: 1, created_at: 1 } })
    .sort({ created_at: -1 })
    .limit(6)
    .toArray();

  // Recent colleges
  const recentColleges = await db.collection("next_college_signups")
    .find({}, { projection: { _id: 1, college_name: 1, email: 1, status: 1, created_at: 1 } })
    .sort({ created_at: -1 })
    .limit(5)
    .toArray();

  // Monthly student registrations (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const [studentMonthly, collegeMonthly] = await Promise.all([
    db.collection("next_student_signups").aggregate([
      { $match: { created_at: { $gte: twelveMonthsAgo } } },
      { $group: { _id: { year: { $year: "$created_at" }, month: { $month: "$created_at" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]).toArray(),
    db.collection("next_college_signups").aggregate([
      { $match: { created_at: { $gte: twelveMonthsAgo } } },
      { $group: { _id: { year: { $year: "$created_at" }, month: { $month: "$created_at" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]).toArray(),
  ]);

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // Fill 12 months
  const fillMonths = (agg: any[]) => {
    const map = new Map(agg.map((d) => [`${d._id.year}-${d._id.month}`, d.count]));
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(twelveMonthsAgo);
      d.setMonth(d.getMonth() + i);
      const y = d.getFullYear(), m = d.getMonth() + 1;
      return { label: `${monthNames[m - 1]} ${y}`, uv: map.get(`${y}-${m}`) ?? 0 };
    });
  };

  const graphData = fillMonths(studentMonthly);
  const collegeGraphData = fillMonths(collegeMonthly);

  return (
    <DashboardClient
      stats={{ totalStudents, totalColleges, totalAdmins, totalApplications, pendingColleges, activeBlogs }}
      graphData={graphData}
      collegeGraphData={collegeGraphData}
      recentStudents={recentStudents.map((s) => ({
        id: s._id.toString(),
        name: s.name || "—",
        email: s.email || "—",
        phone: s.phone || "—",
        status: s.is_active ? "Active" : "Pending",
        created_at: s.created_at ? new Date(s.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—",
      }))}
      recentColleges={recentColleges.map((c) => ({
        id: c._id.toString(),
        name: c.college_name || "—",
        email: c.email || "—",
        status: c.status || "pending",
        created_at: c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—",
      }))}
    />
  );
}
