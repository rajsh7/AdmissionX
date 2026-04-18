import { getDb } from "@/lib/db";
import Link from "next/link";

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default async function AskQaIndexPage() {
  const db = await getDb();

  const [questions, answers, tags] = await Promise.all([
    db.collection("ask_questions").countDocuments({}),
    db.collection("ask_question_answers").countDocuments({}),
    db.collection("ask_question_tags").countDocuments({}),
  ]);

  const activeQ = await db.collection("ask_questions").countDocuments({ status: { $in: [1, "1", " 1"] } });

  const CARDS = [
    { label: "Total Questions", count: questions, icon: "help",         accent: "bg-orange-50 text-orange-500", href: "/admin/academic/ask-qa/questions" },
    { label: "Active Questions", count: activeQ,  icon: "check_circle", accent: "bg-green-50 text-green-600",   href: "/admin/academic/ask-qa/questions" },
    { label: "Answers",          count: answers,  icon: "forum",        accent: "bg-blue-50 text-blue-600",     href: "/admin/academic/ask-qa/answers"   },
    { label: "Tags",             count: tags,     icon: "label",        accent: "bg-purple-50 text-purple-600", href: "/admin/academic/ask-qa/tags"      },
  ];

  const LINKS = [
    { label: "Questions",  desc: "Manage all Q&A questions",     icon: "help",    href: "/admin/academic/ask-qa/questions", color: "text-orange-500" },
    { label: "Answers",    desc: "Manage answers to questions",  icon: "forum",   href: "/admin/academic/ask-qa/answers",   color: "text-blue-600"  },
    { label: "Tags",       desc: "Manage question tags",         icon: "label",   href: "/admin/academic/ask-qa/tags",      color: "text-purple-600"},
    { label: "Comments",   desc: "Manage question comments",     icon: "comment", href: "/admin/academic/ask-qa/comments",  color: "text-slate-600" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-rounded text-orange-500 text-[22px]" style={ICO_FILL}>help</span>
          Ask Q&amp;A
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage questions, answers, tags and comments.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CARDS.map((c, i) => (
          <Link key={i} href={c.href} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`${c.accent} p-2.5 rounded-xl flex-shrink-0`}>
              <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>{c.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 leading-tight">{c.count}</p>
              <p className="text-xs font-semibold text-slate-500">{c.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {LINKS.map((l, i) => (
          <Link key={i} href={l.href} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow group">
            <div className="bg-slate-50 p-3 rounded-xl flex-shrink-0 group-hover:bg-slate-100 transition-colors">
              <span className={`material-symbols-rounded text-[22px] ${l.color}`} style={ICO_FILL}>{l.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800">{l.label}</p>
              <p className="text-xs text-slate-400">{l.desc}</p>
            </div>
            <span className="material-symbols-rounded text-slate-300 text-[20px] group-hover:text-slate-500 transition-colors">chevron_right</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
