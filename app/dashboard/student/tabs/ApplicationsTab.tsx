"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  user: { id: string | number; name: string; email: string } | null;
  initialFilter?: string;
}

interface DocItem {
  type: string;
  url: string;
}

interface Application {
  id: string;
  application_ref: string;
  college_name: string | null;
  course_name: string | null;
  degree_name: string | null;
  stream_name: string | null;
  fees: number;
  status: string;
  statusLabel: string;
  statusClass: string;
  statusIcon: string;
  progress: number;
  progressColor: string;
  payment_status: string;
  paymentLabel: string;
  paymentClass: string;
  paymentIcon: string;
  transaction_id: string | null;
  amount_paid: number;
  actionLabel: string;
  notes: string | null;
  submittedOn: string | null;
  created_at: string;
  documents?: DocItem[];
  personal_info?: {
    name?: string; email?: string; phone?: string; dob?: string;
    city?: string; address?: string; preferredStartDate?: string; countryCode?: string;
  } | null;
  academic_info?: {
    qualification?: string; board?: string; stream?: string; percentage?: string;
    yearOfPassing?: string; entranceExam?: string; entrancePercentage?: string; yearOfExam?: string;
  } | null;
  payment_info?: { method?: string; cardName?: string; expiry?: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700",
  under_review: "bg-amber-100 text-amber-700",
  verified: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  enrolled: "bg-purple-100 text-purple-700",
  draft: "bg-slate-100 text-slate-600",
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
      <span className="text-[13px] font-medium text-[#333]">{value}</span>
    </div>
  );
}

function DocBadge({ doc }: { doc: DocItem }) {
  const ext = doc.url.split(".").pop()?.toUpperCase().slice(0, 3) || "FILE";
  const isPdf = ext === "PDF";
  return (
    <a
      href={doc.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-3 py-2.5 bg-white border border-gray-200 rounded-[8px] hover:border-[#e31e24]/40 hover:shadow-sm transition-all group"
    >
      <div className={`w-9 h-9 rounded-[6px] flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 ${isPdf ? "bg-[#ef4444]" : "bg-[#3b82f6]"}`}>
        {ext}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-[#333] truncate">{doc.type}</p>
        <p className="text-[10px] text-gray-400 truncate">{doc.url.split("/").pop()}</p>
      </div>
      <span className="material-symbols-outlined text-[18px] text-gray-300 group-hover:text-[#e31e24] transition-colors flex-shrink-0">
        open_in_new
      </span>
    </a>
  );
}

function AppCard({ app }: { app: Application }) {
  const [expanded, setExpanded] = useState(false);
  const hasDocs = app.documents && app.documents.length > 0;

  return (
    <div className="bg-white rounded-[12px] border-2 border-gray-100 hover:border-[#e31e24]/20 transition-all group overflow-hidden">
      {/* Header */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-[#e31e24] transition-colors">
            <span className="material-symbols-outlined text-[28px]">account_balance</span>
          </div>
          <div className="text-right">
            <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Ref ID</span>
            <span className="px-3 py-1 bg-gray-50 rounded text-[12px] font-semibold text-[#555] font-mono">{app.application_ref}</span>
          </div>
        </div>

        <h3 className="text-[18px] font-bold text-[#333] leading-tight truncate mb-1">{app.college_name || "—"}</h3>
        {(app.degree_name || app.course_name) && (
          <p className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-4">
            {[app.degree_name, app.course_name].filter(Boolean).join(" · ")}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest">Status</p>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ${STATUS_COLORS[app.status] ?? "bg-gray-100 text-gray-600"}`}>
              <span className="material-symbols-outlined text-[14px]">{app.statusIcon}</span>
              {app.statusLabel}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest">Applied On</p>
            <p className="text-[13px] font-semibold text-[#333]">{app.submittedOn || "—"}</p>
          </div>
        </div>

        {/* Doc count pill */}
        {hasDocs && (
          <div className="flex items-center gap-1.5 mb-4">
            <span className="material-symbols-outlined text-[15px] text-emerald-500">attach_file</span>
            <span className="text-[12px] font-semibold text-emerald-600">{app.documents!.length} document{app.documents!.length > 1 ? "s" : ""} uploaded</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest">Application Fee</span>
            <span className="text-[16px] font-bold text-[#333]">₹{app.fees.toLocaleString("en-IN")}</span>
          </div>
          <button
            onClick={() => setExpanded(p => !p)}
            className="px-5 py-2.5 bg-[#1a1a1a] text-white text-[12px] font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all flex items-center gap-1.5"
          >
            {expanded ? "Hide Details" : "View Details"}
            <span className="material-symbols-outlined text-[16px]">{expanded ? "expand_less" : "expand_more"}</span>
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-100 bg-[#fafafa] px-6 py-5 space-y-6">

          {/* Documents */}
          {hasDocs && (
            <div>
              <p className="text-[11px] font-bold text-[#e31e24] uppercase tracking-widest mb-3">Uploaded Documents</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {app.documents!.map((doc, i) => (
                  <DocBadge key={i} doc={doc} />
                ))}
              </div>
            </div>
          )}

          {/* Personal Info */}
          {app.personal_info && (
            <div>
              <p className="text-[11px] font-bold text-[#e31e24] uppercase tracking-widest mb-3">Personal Information</p>
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="Full Name" value={app.personal_info.name} />
                <InfoRow label="Email" value={app.personal_info.email} />
                <InfoRow label="Phone" value={app.personal_info.countryCode && app.personal_info.phone ? `${app.personal_info.countryCode} ${app.personal_info.phone}` : app.personal_info.phone} />
                <InfoRow label="Date of Birth" value={app.personal_info.dob} />
                <InfoRow label="City" value={app.personal_info.city} />
                <InfoRow label="Preferred Start" value={app.personal_info.preferredStartDate} />
                {app.personal_info.address && (
                  <div className="col-span-2 flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Address</span>
                    <span className="text-[13px] font-medium text-[#333]">{app.personal_info.address}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Academic Info */}
          {app.academic_info && (
            <div>
              <p className="text-[11px] font-bold text-[#e31e24] uppercase tracking-widest mb-3">Academic Information</p>
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="Qualification" value={app.academic_info.qualification} />
                <InfoRow label="Board" value={app.academic_info.board} />
                <InfoRow label="Stream" value={app.academic_info.stream} />
                <InfoRow label="Percentage" value={app.academic_info.percentage ? `${app.academic_info.percentage}%` : null} />
                <InfoRow label="Year of Passing" value={app.academic_info.yearOfPassing} />
                <InfoRow label="Entrance Exam" value={app.academic_info.entranceExam} />
                <InfoRow label="Entrance %" value={app.academic_info.entrancePercentage ? `${app.academic_info.entrancePercentage}%` : null} />
                <InfoRow label="Year of Exam" value={app.academic_info.yearOfExam} />
              </div>
            </div>
          )}

          {/* Payment Info */}
          {app.payment_info && (
            <div>
              <p className="text-[11px] font-bold text-[#e31e24] uppercase tracking-widest mb-3">Payment Information</p>
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="Method" value={app.payment_info.method?.toUpperCase()} />
                <InfoRow label="Card Holder" value={app.payment_info.cardName} />
                <InfoRow label="Expiry" value={app.payment_info.expiry} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ApplicationsTab({ user }: Props) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/student/${user.id}/applications`);
      const data = await res.json();
      setApplications(data.applications ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="space-y-6 pt-10 animate-pulse">
      {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-50 rounded-xl" />)}
    </div>
  );

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-[26px] font-bold text-[#222]">My Applications</h2>
          <p className="text-gray-400 font-semibold uppercase text-[12px] tracking-widest mt-1">Track your admission progress</p>
        </div>
        <span className="text-[13px] font-semibold text-gray-300 uppercase tracking-widest">{applications.length} Total</span>
      </div>

      {applications.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {applications.map(app => <AppCard key={String(app.id)} app={app} />)}
        </div>
      ) : (
        <div className="bg-white rounded-[10px] border border-gray-100 flex flex-col items-center justify-center py-32 text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-200">
            <span className="material-symbols-outlined text-[48px]">description</span>
          </div>
          <h3 className="text-[20px] font-bold text-[#333]">No Applications Yet</h3>
          <p className="text-[14px] font-medium text-gray-400 max-w-[320px] mt-2">You haven't applied to any colleges. Start your journey by exploring top universities.</p>
          <a href="/top-colleges" className="mt-8 px-10 py-3.5 bg-[#e31e24] text-white text-[13px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-red-100 hover:scale-105 active:scale-95 transition-all inline-block">
            Explore Colleges
          </a>
        </div>
      )}
    </div>
  );
}
