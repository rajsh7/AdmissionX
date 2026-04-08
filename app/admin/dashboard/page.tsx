import { getDb } from "@/lib/db";
import DashboardClient from "../_components/DashboardClient";

// Cache dashboard data briefly to avoid expensive DB work on every request
export const revalidate = 60;

export default async function AdminDashboardPage() {
  const db = await getDb();

  // 1. Fetch KPI counts
  const [
    totalStudents,
    totalColleges,
    totalAdmins,
    activeQueries
  ] = await Promise.all([
    db.collection("users").estimatedDocumentCount(),
    db.collection("collegeprofile").estimatedDocumentCount(),
    db.collection("next_admin_users").estimatedDocumentCount(),
    db.collection("chatbot_sessions").countDocuments({ status: "open" }),
  ]);

  // 2. Fetch Recent Students for the Table
  const recentStudents = await db.collection("users")
    .find({}, { projection: { id: 1, firstname: 1, lastname: 1, email: 1, course: 1, college: 1, status: 1, created_at: 1 } })
    .sort({ created_at: -1 })
    .limit(5)
    .toArray();

  // 3. Fetch Recent Activity logs (mocked or retrieved if a system_logs collection exists, falling back to recent colleges/users as activity)
  const recentColleges = await db.collection("collegeprofile")
    .find({}, { projection: { id: 1, slug: 1, created_at: 1 } })
    .sort({ created_at: -1 })
    .limit(3)
    .toArray();

  const [paymentStatuses, transactionAgg] = await Promise.all([
    db.collection("paymentstatus").find({}, { projection: { id: 1, name: 1 } }).toArray(),
    db.collection("transaction").aggregate([
      {
        $lookup: {
          from: "application",
          localField: "application_id",
          foreignField: "id",
          as: "app",
        },
      },
      {
        $addFields: {
          amount: {
            $convert: {
              input: {
                $ifNull: [
                  { $arrayElemAt: ["$app.amount_paid", 0] },
                  {
                    $ifNull: [
                      { $arrayElemAt: ["$app.byafees", 0] },
                      { $ifNull: ["$amount", 0] },
                    ],
                  },
                ],
              },
              to: "double",
              onError: 0,
              onNull: 0,
            },
          },
        },
      },
      { $group: { _id: "$paymentstatus_id", count: { $sum: 1 }, amount: { $sum: "$amount" } } },
    ]).toArray(),
  ]);

  const statusNameMap = new Map(
    paymentStatuses.map((s) => [String(s.id), s.name || String(s.id)])
  );

  const transactionPieRaw = transactionAgg.map((t: any) => ({
    name: statusNameMap.get(String(t._id)) ?? "Unknown",
    amount: Number(t.amount ?? 0),
    count: Number(t.count ?? 0),
  })).filter(p => p.count > 0);

  const totalAmount = transactionPieRaw.reduce((sum, p) => sum + p.amount, 0);
  const transactionPie = transactionPieRaw.map((p) => ({
    ...p,
    value: totalAmount > 0 ? p.amount : p.count,
  }));

  // Map to a common activity format
  const recentActivity = [
    ...recentStudents.map(s => ({
      type: 'student',
      message: `New student registered: ${s.firstname || 'User'}`,
      time: s.created_at
    })),
    ...recentColleges.map(c => ({
      type: 'college',
      message: `New college profile created: ${c.slug}`,
      time: c.created_at
    }))
  ].sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime()).slice(0, 5);

  // 4. Graph Data - real student registrations by month
  const monthsBack = 24;
  const now = new Date();
  const startMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (monthsBack - 1), 1));

  const studentMonthlyAgg = await db.collection("users").aggregate([
    {
      $addFields: {
        createdAt: {
          $convert: {
            input: "$created_at",
            to: "date",
            onError: null,
            onNull: null,
          },
        },
      },
    },
    { $match: { createdAt: { $ne: null, $gte: startMonth } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]).toArray();

  const collegeMonthlyAgg = await db.collection("collegeprofile").aggregate([
    {
      $addFields: {
        createdAt: {
          $convert: {
            input: "$created_at",
            to: "date",
            onError: null,
            onNull: null,
          },
        },
      },
    },
    { $match: { createdAt: { $ne: null, $gte: startMonth } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]).toArray();

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function buildMonthlySeries(source: any[], start: Date, months: number) {
    const monthlyMap = new Map<string, number>();
    for (const agg of source) {
      const year = agg._id?.year ?? 0;
      const month = agg._id?.month ?? 1;
      if (!year) continue;
      monthlyMap.set(`${year}-${String(month).padStart(2, "0")}`, agg.count ?? 0);
    }
    const series: { key: string; label: string; year: number; month: number; uv: number }[] = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
      const y = d.getUTCFullYear();
      const m = d.getUTCMonth() + 1;
      const mm = String(m).padStart(2, "0");
      const key = `${y}-${mm}`;
      series.push({
        key,
        label: `${monthNames[m - 1]} ${y}`.trim(),
        year: y,
        month: m,
        uv: monthlyMap.get(key) ?? 0,
      });
    }
    return series;
  }

  const studentGraphData = buildMonthlySeries(studentMonthlyAgg, startMonth, monthsBack);
  const collegeGraphData = buildMonthlySeries(collegeMonthlyAgg, startMonth, monthsBack);

  return (
    <div className="p-8 w-full space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-[25px] font-semibold text-[#3E3E3E]">Analytics Dashboard</h1>
        <p className="text-[18px] font-normal text-slate-500">Welcome back!</p>
      </div>

      <DashboardClient 
        stats={{
          totalStudents,
          totalColleges,
          totalAdmins,
          activeQueries
        }}
        graphData={studentGraphData}
        collegeGraphData={collegeGraphData}
        transactionPie={transactionPie}
        recentStudents={recentStudents.map(s => ({
          id: s._id.toString(),
          name: [s.firstname, s.lastname].filter(Boolean).join(" ") || s.email || "Unknown",
          course: s.course || "B.Tech", // Fallback if missing
          college: s.college || "Pending Allocation",
          status: s.status === 1 ? "Active" : "Pending"
        }))}
        recentActivity={recentActivity.map((a, i) => ({
          id: `act-${i}`,
          type: a.type,
          message: a.message,
          time: new Date(a.time || Date.now()).toLocaleDateString()
        }))}
      />
    </div>
  );
}




