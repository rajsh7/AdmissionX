import { getDb } from "@/lib/db";
import DashboardClient from "../_components/DashboardClient";

// Cache dashboard data briefly to avoid expensive DB work on every request
export const revalidate = 60;

export default async function AdminDashboardPage() {
  const db = await getDb();

  const monthsBack = 24;
  const now = new Date();
  const startMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (monthsBack - 1), 1));

  const [
    [totalStudents, totalColleges, totalAdmins, activeQueries],
    recentStudentsRaw,
    recentColleges,
    [paymentStatuses, studentTransactionAgg, collegeTransactionAgg],
    studentMonthlyAgg,
    collegeMonthlyAgg,
  ] = await Promise.all([
    Promise.all([
      db.collection("users").estimatedDocumentCount(),
      db.collection("collegeprofile").estimatedDocumentCount(),
      db.collection("next_admin_users").estimatedDocumentCount(),
      db.collection("chatbot_sessions").countDocuments({ status: "open" }),
    ]),
    db.collection("users")
      .find({}, {
        projection: {
          _id: 1,
          firstname: 1,
          lastname: 1,
          email: 1,
          course: 1,
          college: 1,
          status: 1,
          created_at: 1,
        },
      })
      .sort({ created_at: -1 })
      .limit(5)
      .toArray(),
    db.collection("collegeprofile")
      .find({}, { projection: { id: 1, slug: 1, created_at: 1 } })
      .sort({ created_at: -1 })
      .limit(3)
      .toArray(),
    Promise.all([
      db.collection("paymentstatus").find({}, { projection: { id: 1, name: 1 } }).toArray(),
      // Student transactions — from transaction collection grouped by payment status
      db.collection("transaction").aggregate([
        {
          $lookup: {
            from: "application",
            localField: "application_id",
            foreignField: "id",
            as: "app",
          },
        },
        { $unwind: { path: "$app", preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            amount: {
              $convert: {
                input: { $trim: { input: { $ifNull: ["$app.byafees", { $ifNull: ["$app.totalfees", "0"] }] } } },
                to: "double", onError: 0, onNull: 0,
              },
            },
            status_key: {
              $cond: [
                { $or: [{ $eq: ["$paymentstatus_id", null] }, { $not: ["$paymentstatus_id"] }] },
                "not_paid",
                { $toString: "$paymentstatus_id" },
              ],
            },
          },
        },
        {
          $group: {
            _id: "$status_key",
            count: { $sum: 1 },
            amount: { $sum: "$amount" },
          },
        },
      ]).toArray(),
      // College transactions — from application grouped by paymentstatus
      db.collection("application").aggregate([
        {
          $match: { collegeprofile_id: { $exists: true, $ne: null } },
        },
        {
          $addFields: {
            amount: {
              $convert: {
                input: { $trim: { input: { $ifNull: ["$byafees", { $ifNull: ["$totalfees", "0"] }] } } },
                to: "double", onError: 0, onNull: 0,
              },
            },
            status_key: {
              $cond: [
                { $or: [{ $eq: ["$paymentstatus_id", null] }, { $not: ["$paymentstatus_id"] }] },
                "not_paid",
                { $toString: "$paymentstatus_id" },
              ],
            },
          },
        },
        {
          $group: {
            _id: "$status_key",
            count: { $sum: 1 },
            amount: { $sum: "$amount" },
          },
        },
      ]).toArray(),
    ]),
    db.collection("users").aggregate([
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
    ]).toArray(),
    db.collection("collegeprofile").aggregate([
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
    ]).toArray(),
  ]);

  const statusNameMap = new Map(
    paymentStatuses.map((s: any) => [String(s.id), s.name || String(s.id)])
  );

  const processTransactionData = (data: any[]) => {
    const raw = data
      .map((t: any) => {
        const id = t._id ? String(t._id) : "not_paid";
        const name = id === "not_paid"
          ? "Not Paid"
          : (statusNameMap.get(id) ?? "Unknown");
        return {
          name,
          amount: Number(t.amount ?? 0),
          count: Number(t.count ?? 0),
        };
      })
      .filter((p: any) => p.count > 0);

    const totalAmount = raw.reduce((sum: number, p: any) => sum + p.amount, 0);
    return raw.map((p: any) => ({
      name: p.name,
      amount: p.amount,
      count: p.count,
      value: totalAmount > 0 ? p.amount : p.count,
    }));
  };

  const studentTransactionPie = processTransactionData(studentTransactionAgg);
  const collegeTransactionPie = processTransactionData(collegeTransactionAgg);

  const recentActivity = [
    ...recentStudentsRaw.map((s) => ({
      id: s._id.toString(),
      type: "student",
      message: `New student registered: ${s.firstname || "User"}`,
      time: s.created_at,
    })),
    ...recentColleges.map((c) => ({
      id: c.id?.toString() || c._id?.toString() || Math.random().toString(),
      type: "college",
      message: `New college profile created: ${c.slug}`,
      time: c.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime())
    .slice(0, 10);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const studentGraphData = buildMonthlySeries(studentMonthlyAgg, startMonth, monthsBack);
  const collegeGraphData = buildMonthlySeries(collegeMonthlyAgg, startMonth, monthsBack);

  function buildMonthlySeries(source: any[], start: Date, months: number) {
    const monthlyMap = new Map<string, number>();
    for (const agg of source) {
      const year = agg._id?.year ?? 0;
      const month = agg._id?.month ?? 1;
      if (!year) continue;
      monthlyMap.set(`${year}-${String(month).padStart(2, "0")}`, agg.count ?? 0);
    }
    const series = [];
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

  return (
    <div className="p-8 w-full">
      <DashboardClient 
        stats={{
          totalStudents,
          totalColleges,
          totalAdmins,
          activeQueries
        }}
        graphData={studentGraphData}
        collegeGraphData={collegeGraphData}
        studentTransactionPie={studentTransactionPie}
        collegeTransactionPie={collegeTransactionPie}
        recentStudents={recentStudentsRaw.map(s => ({
          id: s._id.toString(),
          name: [s.firstname, s.lastname].filter(Boolean).join(" ") || s.email || "Unknown",
          course: s.course || "B.Tech",
          college: s.college || "Pending Allocation",
          status: s.status === 1 ? "Active" : "Pending"
        }))}
        recentActivity={recentActivity.map(a => ({
          ...a,
          time: new Date(a.time || Date.now()).toLocaleDateString()
        }))}
      />
    </div>
  );
}
