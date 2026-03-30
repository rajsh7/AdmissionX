"use client";

import { useState } from "react";

interface Props {
  user: { id: string | number; name: string; email: string } | null;
}

// ── Counselling Form Types ────────────────────────────────────────────────────
interface CounsellingForm {
  id: number;
  form_name: string;
  college: string;
  course: string;
  round: string;
  status: "submitted" | "pending" | "shortlisted" | "rejected";
  submitted_on: string;
  merit_rank: string;
  allotted_college: string | null;
}

const STATUS_META = {
  submitted:   { label: "Submitted",   color: "bg-blue-100 text-blue-700",    dot: "bg-blue-500",   icon: "send"         },
  pending:     { label: "Pending",     color: "bg-amber-100 text-amber-700",  dot: "bg-amber-400",  icon: "pending"      },
  shortlisted: { label: "Shortlisted", color: "bg-green-100 text-green-700",  dot: "bg-green-500",  icon: "check_circle" },
  rejected:    { label: "Rejected",    color: "bg-red-100 text-red-700",      dot: "bg-red-400",    icon: "cancel"       },
};

const COUNSELLING_TYPES = [
  { id: "jee-mains",    label: "JEE Mains Counselling",        body: "JOSAA / JAC / State JEE Counselling" },
  { id: "neet",         label: "NEET UG Counselling",          body: "MCC / State NEET Counselling"        },
  { id: "cat-mba",      label: "CAT / MBA Counselling",        body: "IIM / Top MBA Institutes"            },
  { id: "clat",         label: "CLAT / Law Counselling",       body: "NLSIU and Top Law Colleges"          },
  { id: "state",        label: "State Counselling",            body: "State-specific merit-based counselling"},
  { id: "management",   label: "Management Quota",             body: "Direct admission through management" },
];

export default function CounsellingFormsTab({ user }: Props) {
  const [forms]      = useState<CounsellingForm[]>([]);
  const [showInfo, setShowInfo] = useState<string | null>(null);
  const [activeType, setActiveType] = useState("jee-mains");

  return (
    <div className="space-y-6 max-w-5xl">

      {/* ── Page header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-green-600 text-[22px]">assignment</span>
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800">Counselling Forms</h1>
          <p className="text-xs text-slate-400 font-medium">
            Track your counselling registrations across all entrance exams
          </p>
        </div>
      </div>

      {/* ── Banner ── */}
      <div className="relative bg-gradient-to-r from-green-700 via-green-600 to-emerald-500 rounded-2xl p-6 overflow-hidden shadow-lg shadow-green-200 text-white">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-20 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-white/20 text-white px-2.5 py-0.5 rounded-full tracking-widest uppercase">
                Coming Soon
              </span>
            </div>
            <h2 className="text-xl font-black leading-tight">
              Centralised Counselling Tracker
            </h2>
            <p className="text-white/75 text-sm max-w-md leading-relaxed">
              Track JEE, NEET, CAT, CLAT and state counselling rounds in one place.
              Get notified on seat allotments and important deadlines.
            </p>
          </div>
          <button className="flex-shrink-0 px-5 py-2.5 bg-white text-green-700 font-black rounded-xl text-sm shadow-md hover:bg-green-50 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">notifications</span>
            Get Notified
          </button>
        </div>
      </div>

      {/* ── Counselling type tabs ── */}
      <div className="bg-white rounded-2xl border border-green-50 shadow-sm overflow-hidden">
        <div className="border-b border-slate-50 px-4 pt-4">
          <div className="flex gap-1 overflow-x-auto pb-3 hide-scrollbar">
            {COUNSELLING_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveType(type.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                  activeType === type.id
                    ? "bg-green-600 text-white shadow-sm shadow-green-200"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 bg-slate-50/50"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Active type info ── */}
        {(() => {
          const t = COUNSELLING_TYPES.find((x) => x.id === activeType);
          return t ? (
            <div className="px-6 py-5 flex items-center gap-4 border-b border-slate-50 bg-green-50/30">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-green-600 text-[22px]">school</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-800 text-sm">{t.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t.body}</p>
              </div>
              <button
                onClick={() => setShowInfo(showInfo === t.id ? null : t.id)}
                className="text-xs font-bold text-green-600 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">info</span>
                How it works
              </button>
            </div>
          ) : null;
        })()}

        {/* How it works info panel */}
        {showInfo && showInfo === activeType && (
          <div className="px-6 py-4 bg-blue-50/50 border-b border-blue-100">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-500 text-[20px] flex-shrink-0 mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}>
                info
              </span>
              <div className="space-y-2">
                <p className="text-sm font-black text-blue-800">How Counselling Works</p>
                <ol className="space-y-1.5">
                  {[
                    "Register on the official counselling portal after results",
                    "Fill in your choices of colleges and courses in order of preference",
                    "Pay the counselling registration fee",
                    "Seat allotment is done based on your rank and preferences",
                    "Report to the allotted college within the stipulated time",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-blue-700">
                      <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-800 font-black text-[9px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {forms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 gap-4">
            <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-green-300">assignment</span>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-700">No Counselling Forms Yet</h3>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                Your counselling form registrations will appear here once the feature
                is fully live. Stay tuned for updates!
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <a
                href="/examination"
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-md shadow-green-200"
              >
                <span className="material-symbols-outlined text-[18px]">assignment</span>
                View Entrance Exams
              </a>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors">
                <span className="material-symbols-outlined text-[18px]">notifications</span>
                Set Reminder
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {forms.map((f) => {
              const sm = STATUS_META[f.status];
              return (
                <div key={f.id} className="px-6 py-4 flex items-center gap-4 hover:bg-green-50/30 transition-colors group">
                  <div className="w-9 h-9 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-green-600 text-[18px]">assignment</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate group-hover:text-green-700 transition-colors">
                      {f.form_name}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {f.college} • {f.course} • Round {f.round}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${sm.color}`}>
                      <span className="material-symbols-outlined text-[11px]">{sm.icon}</span>
                      {sm.label}
                    </span>
                    <p className="text-[10px] text-slate-400">{f.submitted_on}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Upcoming counselling schedule ── */}
      <div className="bg-white rounded-2xl border border-green-50 shadow-sm p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-green-600 text-[16px]">calendar_month</span>
          </div>
          <h2 className="font-black text-slate-800 text-[15px]">Important Counselling Dates</h2>
          <span className="ml-auto text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">2025</span>
        </div>

        <div className="space-y-3">
          {[
            { exam: "JEE Advanced",  event: "JOSAA Round 1 Registration",  date: "Jun 2025",  color: "border-l-blue-400"   },
            { exam: "NEET UG",       event: "MCC AIQ Counselling Round 1", date: "Jul 2025",  color: "border-l-green-400"  },
            { exam: "CUET UG",       event: "Central University Counselling",date: "Jul 2025", color: "border-l-purple-400" },
            { exam: "CAT 2024",      event: "IIM Admission Calls",         date: "Dec 2024",  color: "border-l-amber-400"  },
            { exam: "CLAT 2025",     event: "NLU Seat Allotment Round 1",  date: "May 2025",  color: "border-l-red-400"    },
          ].map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 px-4 py-3 bg-slate-50/50 rounded-xl border-l-4 ${item.color}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-700">{item.exam}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.event}</p>
              </div>
              <span className="text-xs font-bold text-slate-500 flex-shrink-0 bg-white px-2.5 py-1 rounded-lg border border-slate-100 shadow-sm">
                {item.date}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-4 text-center font-medium">
          * Dates are approximate. Please verify on official portals.
        </p>
      </div>

    </div>
  );
}
