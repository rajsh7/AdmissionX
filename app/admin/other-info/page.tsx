import { getDb } from "@/lib/db";
import Link from "next/link";

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default async function OtherInformationPage() {
  const db = await getDb();

  const [
    category, cardtype, collegetype, coursetype,
    course, degree, educationlevel, entranceexam,
    facilities, university, careers, paymentstatus,
  ] = await Promise.all([
    db.collection("category").countDocuments({}),
    db.collection("cardtype").countDocuments({}),
    db.collection("collegetype").countDocuments({}),
    db.collection("coursetype").countDocuments({}),
    db.collection("course").countDocuments({}),
    db.collection("degree").countDocuments({}),
    db.collection("educationlevel").countDocuments({}),
    db.collection("entranceexam").countDocuments({}),
    db.collection("facilities").countDocuments({}),
    db.collection("university").countDocuments({}),
    db.collection("careers").countDocuments({}),
    db.collection("paymentstatus").countDocuments({}),
  ]);

  const ITEMS = [
    { label: "Categories",       count: category,       icon: "category",        href: "/admin/other-info/category",        accent: "bg-blue-50 text-blue-600"     },
    { label: "Card Types",       count: cardtype,        icon: "credit_card",     href: "/admin/other-info/card-type",       accent: "bg-slate-50 text-slate-600"   },
    { label: "College Types",    count: collegetype,     icon: "account_balance", href: "/admin/other-info/college-type",    accent: "bg-indigo-50 text-indigo-600" },
    { label: "Course Types",     count: coursetype,      icon: "menu_book",       href: "/admin/other-info/course-type",     accent: "bg-green-50 text-green-600"   },
    { label: "Courses",          count: course,          icon: "school",          href: "/admin/other-info/courses",         accent: "bg-emerald-50 text-emerald-600"},
    { label: "Degrees",          count: degree,          icon: "workspace_premium",href: "/admin/other-info/degrees",        accent: "bg-yellow-50 text-yellow-600" },
    { label: "Education Levels", count: educationlevel,  icon: "stairs",          href: "/admin/other-info/education-levels",accent: "bg-orange-50 text-orange-600" },
    { label: "Entrance Exams",   count: entranceexam,    icon: "quiz",            href: "/admin/other-info/entrance-exam",   accent: "bg-red-50 text-red-600"       },
    { label: "Facilities",       count: facilities,      icon: "apartment",       href: "/admin/other-info/facilities",      accent: "bg-cyan-50 text-cyan-600"     },
    { label: "Universities",     count: university,      icon: "location_city",   href: "/admin/other-info/universities",    accent: "bg-purple-50 text-purple-600" },
    { label: "Careers",          count: careers,         icon: "work",            href: "/admin/other-info/career",          accent: "bg-pink-50 text-pink-600"     },
    { label: "Payment Status",   count: paymentstatus,   icon: "payments",        href: "/admin/other-info/payment-status",  accent: "bg-teal-50 text-teal-600"     },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>info</span>
          Other Website Information
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage miscellaneous content, categories, types and site-wide metadata.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {ITEMS.map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
          >
            <div className={`${item.accent} p-2.5 rounded-xl flex-shrink-0`}>
              <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>{item.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-slate-800 leading-tight">{item.count.toLocaleString()}</p>
              <p className="text-xs font-semibold text-slate-500 truncate">{item.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
