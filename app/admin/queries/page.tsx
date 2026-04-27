import { getDb } from "@/lib/db";
import pool from "@/lib/db";

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function QueriesDashboardPage() {
  const db = await getDb();

  // Contact form queries
  const [contactTotal, contactNew] = await Promise.all([
    db.collection("contact_queries").countDocuments({}),
    db.collection("contact_queries").countDocuments({ status: "new" }),
  ]);

  // AdmissionX chatbot queries
  const [chatbotTotal, chatbotOpen] = await Promise.all([
    db.collection("chatbot_sessions").countDocuments({}),
    db.collection("chatbot_sessions").countDocuments({ status: "open" }),
  ]);

  // College-Student queries (MySQL via pool shim)
  let collegeStudentTotal = 0;
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) as total FROM query WHERE queryflowtype = 'student-to-college'`
    ) as any;
    collegeStudentTotal = Number(rows[0]?.total ?? 0);
  } catch {}

  const grandTotal = contactTotal + chatbotTotal + collegeStudentTotal;

  const sections = [
    {
      title: "Contact Us Queries",
      description: "Messages submitted via the Contact Us form on the homepage.",
      icon: "contact_mail",
      color: "text-primary",
      bg: "bg-red-50",
      border: "border-red-100",
      total: contactTotal,
      badge: contactNew,
      badgeLabel: "New",
      badgeColor: "bg-blue-100 text-blue-700",
      href: "/admin/queries/contact",
    },
    {
      title: "AdmissionX Chatbot Queries",
      description: "Student queries submitted via the AdmissionX chatbot.",
      icon: "chat",
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-100",
      total: chatbotTotal,
      badge: chatbotOpen,
      badgeLabel: "Open",
      badgeColor: "bg-amber-100 text-amber-700",
      href: "/admin/queries/admissionx",
    },
    {
      title: "College ↔ Student Queries",
      description: "Interactions and inquiries between students and institutions.",
      icon: "forum",
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      total: collegeStudentTotal,
      badge: null,
      badgeLabel: "",
      badgeColor: "",
      href: "/admin/queries/college-student",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1300px] mx-auto w-full">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-rounded text-primary text-[22px]" style={ICO_FILL}>inbox</span>
          All Queries
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Overview of all queries across the platform.</p>
      </div>

      {/* Grand Total */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-rounded text-primary text-[28px]" style={ICO_FILL}>mark_email_unread</span>
        </div>
        <div>
          <p className="text-3xl font-black text-slate-800">{grandTotal.toLocaleString()}</p>
          <p className="text-sm text-slate-500 font-medium">Total Queries (All Sources)</p>
        </div>
      </div>

      {/* Section Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {sections.map((s) => (
          <a key={s.href} href={s.href}
            className={`bg-white rounded-2xl border ${s.border} shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-all group`}>
            <div className="flex items-start justify-between">
              <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`}>
                <span className={`material-symbols-rounded text-[22px] ${s.color}`} style={ICO_FILL}>{s.icon}</span>
              </div>
              {s.badge !== null && s.badge > 0 && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${s.badgeColor}`}>
                  {s.badge} {s.badgeLabel}
                </span>
              )}
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{s.total.toLocaleString()}</p>
              <p className="text-sm font-bold text-slate-700 mt-0.5">{s.title}</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{s.description}</p>
            </div>
            <div className={`text-xs font-bold ${s.color} flex items-center gap-1 group-hover:gap-2 transition-all`}>
              View All
              <span className="material-symbols-rounded text-[14px]" style={ICO}>arrow_forward</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
