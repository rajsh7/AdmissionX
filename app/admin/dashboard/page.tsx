import { getDb } from "@/lib/db";
import DashboardClient from "../_components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const db = await getDb();

  // 1. KPI counts — correct collections
  const [
    totalStudents,
    totalColleges,
    totalAdmins,
    totalApplications,
    pendingColleges,
    activeBlogs,
  ] = await Promise.all([
    db.collection("next_student_signups").countDocuments(),
    db.collection("collegeprofile").countDocuments(),
    db.collection("next_admin_users").countDocuments({ is_active: true }),
    db.collection("applications").countDocuments(),
    db.collection("next_college_signups").countDocuments({ status: "pending" }),
    db.collection("blogs").countDocuments({ isactive: 1 }),
  ]);

  // 2. Recent students
  const recentStudents = await db.collection("next_student_signups")
    .find({}, { projection: { _id: 1, name: 1, email: 1, phone: 1, is_active: 1, created_at: 1 } })
    .sort({ created_at: -1 })
    .limit(5)
    .toArray();

  // 3. Recent activity — latest colleges + students combined
  const [recentColleges, recentSignups] = await Promise.all([
    db.collection("collegeprofile")
      .find({}, { projection: { _id: 1, slug: 1, created_at: 1 } })
      .sort({ created_at: -1 })
      .limit(3)
      .toArray(),
    db.collection("next_student_signups")
      .find({}, { projection: { _id: 1, name: 1, created_at: 1 } })
      .sort({ created_at: -1 })
      .limit(3)
      .toArray(),
  ]);

  const recentActivity = [
    ...recentSignups.map((s) => ({
      type: "student",
      message: `New student registered: ${s.name || "User"}`,
      time: s.created_at,
    })),
    ...recentColleges.map((c) => ({
      type: "college",
      message: `College profile: ${c.slug}`,
      time: c.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime())
    .slice(0, 5);

  // 4. Real graph data — students registered per month (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyAgg = await db.collection("next_student_signups").aggregate([
    { $match: { created_at: { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: "$created_at" },
          month: { $month: "$created_at" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]).toArray();

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const graphData = monthlyAgg.map((d) => ({
    name: `${monthNames[(d._id.month ?? 1) - 1]} ${d._id.year}`,
    uv: d.count,
  }));

  // Fill missing months with 0
  const filledGraph: { name: string; uv: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(twelveMonthsAgo);
    d.setMonth(d.getMonth() + i);
    const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    const found = graphData.find((g) => g.name === label);
    filledGraph.push({ name: label, uv: found?.uv ?? 0 });
  }

  return (
    <div className="p-8 w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Analytics Dashboard</h1>
        <p className="text-sm text-slate-500">Welcome back! Here's what's happening today.</p>
      </div>

      <DashboardClient
        stats={{
          totalStudents,
          totalColleges,
          totalAdmins,
          activeQueries: totalApplications,
          pendingColleges,
          activeBlogs,
        }}
        graphData={filledGraph}
        recentStudents={recentStudents.map((s) => ({
          id: s._id.toString(),
          name: s.name || s.email || "Unknown",
          course: "—",
          college: "—",
          status: s.is_active ? "Active" : "Pending",
        }))}
        recentActivity={recentActivity.map((a, i) => ({
          id: `act-${i}`,
          type: a.type,
          message: a.message,
          time: a.time ? new Date(a.time).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—",
        }))}
      />
    </div>
  );
}
