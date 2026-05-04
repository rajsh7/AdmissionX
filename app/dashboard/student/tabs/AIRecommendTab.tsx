"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface Props {
  user: { id: string | number; name: string; email: string } | null;
  navigate?: (tab: string) => void;
}

interface CollegeRec {
  id: string;
  slug: string;
  name: string;
  location: string;
  image: string | null;
  rating: number;
  totalRatingUser: number;
  ranking: number | null;
  isTopUniversity: boolean;
  verified: boolean;
  min_fees: number | null;
  streams: string[];
  pct_required: number | null;
}

interface Recommendation {
  college: CollegeRec;
  score: number;
  matchPercent: number;
  reasons: string[];
}

interface ProfileSummary {
  pct12: number;
  stream: string;
  city: string | null;
  hasMarks: boolean;
}

const IMAGE_PROXY = (url: string) => `/api/image-proxy?url=${encodeURIComponent(url)}`;

function MatchRing({ percent }: { percent: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  const color = percent >= 80 ? "#22c55e" : percent >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg width="64" height="64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#f1f5f9" strokeWidth="5" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <span className="absolute text-[13px] font-black" style={{ color }}>{percent}%</span>
    </div>
  );
}

function CollegeCard({ rec, rank }: { rec: Recommendation; rank: number }) {
  const { college, matchPercent, reasons } = rec;
  const feesLabel = college.min_fees
    ? college.min_fees >= 100000
      ? `₹${(college.min_fees / 100000).toFixed(1)}L/yr`
      : `₹${(college.min_fees / 1000).toFixed(0)}K/yr`
    : null;

  return (
    <div className={`relative bg-white rounded-2xl border-2 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${rank === 1 ? "border-[#FF3C3C]" : "border-gray-100"}`}>
      {rank === 1 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF3C3C] via-orange-400 to-yellow-400" />
      )}

      {/* Badge */}
      <div className={`absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-lg ${rank === 1 ? "bg-[#FF3C3C] text-white" : "bg-gray-900 text-white"}`}>
        <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          {rank === 1 ? "workspace_premium" : "recommend"}
        </span>
        {rank === 1 ? "Best Match" : "2nd Pick"}
      </div>

      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {college.image ? (
          <Image src={IMAGE_PROXY(college.image)} alt={college.name} fill sizes="600px"
            className="object-cover" unoptimized />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-[64px] text-slate-300">account_balance</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 right-3">
          <MatchRing percent={matchPercent} />
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-[17px] font-bold text-[#1a1a1a] leading-snug line-clamp-2">{college.name}</h3>
        </div>

        <p className="flex items-center gap-1 text-[12px] text-slate-400 mb-3">
          <span className="material-symbols-outlined text-[14px]">location_on</span>
          {college.location}
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap gap-2 mb-4">
          {college.rating > 0 && (
            <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-[11px] font-bold">
              <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              {college.rating.toFixed(1)}
            </span>
          )}
          {college.ranking && (
            <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-[11px] font-bold">
              <span className="material-symbols-outlined text-[13px]">leaderboard</span>
              #{college.ranking}
            </span>
          )}
          {college.isTopUniversity && (
            <span className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-[11px] font-bold">
              <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
              Top University
            </span>
          )}
          {college.verified && (
            <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[11px] font-bold">
              <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              Verified
            </span>
          )}
          {feesLabel && (
            <span className="flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-600 rounded-lg text-[11px] font-bold">
              <span className="material-symbols-outlined text-[13px]">currency_rupee</span>
              {feesLabel}
            </span>
          )}
        </div>

        {/* Streams */}
        {college.streams.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {college.streams.slice(0, 3).map(s => (
              <span key={s} className="px-2 py-0.5 bg-[#FF3C3C]/5 text-[#FF3C3C] text-[10px] font-bold rounded-full border border-[#FF3C3C]/20">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* AI Reasons */}
        <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-1.5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
            Why this college?
          </p>
          {reasons.slice(0, 3).map((r, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[14px] text-emerald-500 mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-[12px] text-slate-600 font-medium">{r}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/college/${college.slug}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#FF3C3C] hover:bg-[#e63636] text-white text-[12px] font-bold rounded-xl transition-colors">
            <span className="material-symbols-outlined text-[15px]">open_in_new</span>
            View College
          </Link>
          <Link href={`/apply/${college.slug}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-900 hover:bg-black text-white text-[12px] font-bold rounded-xl transition-colors">
            <span className="material-symbols-outlined text-[15px]">edit_document</span>
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AIRecommendTab({ user, navigate }: Props) {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/ai/recommend/${user.id}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to load recommendations"); return; }
      setRecommendations(data.recommendations ?? []);
      setProfileSummary(data.profileSummary ?? null);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-24 bg-gradient-to-r from-[#FF3C3C]/10 to-orange-100 rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-96 bg-gray-100 rounded-2xl" />
        <div className="h-96 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[26px] font-bold text-[#222] flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px] text-[#FF3C3C]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            AI College Recommendations
          </h2>
          <p className="text-gray-400 font-semibold uppercase text-[12px] tracking-widest mt-1">
            Personalised picks based on your academic profile
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-[12px] font-bold rounded-xl hover:border-[#FF3C3C] hover:text-[#FF3C3C] transition-all shadow-sm">
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Refresh
        </button>
      </div>

      {/* Profile summary banner */}
      {profileSummary && (
        <div className={`rounded-2xl p-5 flex flex-wrap items-center gap-4 ${profileSummary.hasMarks ? "bg-gradient-to-r from-[#FF3C3C]/5 to-orange-50 border border-[#FF3C3C]/10" : "bg-amber-50 border border-amber-200"}`}>
          <span className="material-symbols-outlined text-[28px] text-[#FF3C3C]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {profileSummary.hasMarks ? "school" : "warning"}
          </span>
          <div className="flex-1 min-w-0">
            {profileSummary.hasMarks ? (
              <>
                <p className="text-[14px] font-bold text-[#1a1a1a]">
                  Based on your {profileSummary.pct12}% in {profileSummary.stream}
                  {profileSummary.city ? ` · ${profileSummary.city}` : ""}
                </p>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Our AI has analysed thousands of colleges to find your best matches
                </p>
              </>
            ) : (
              <>
                <p className="text-[14px] font-bold text-amber-800">Add your academic marks for better recommendations</p>
                <p className="text-[12px] text-amber-600 mt-0.5">
                  Go to Academic Records and fill in your 10th / 12th details
                </p>
              </>
            )}
          </div>
          {!profileSummary.hasMarks && navigate && (
            <button onClick={() => navigate("academic-details")}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-bold rounded-xl transition-colors whitespace-nowrap">
              Add Marks
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[13px] font-medium">
          <span className="material-symbols-outlined text-[20px]">error</span>
          {error}
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.map((rec, i) => (
              <CollegeCard key={rec.college.id} rec={rec} rank={i + 1} />
            ))}
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="material-symbols-outlined text-[18px] text-slate-400 shrink-0 mt-0.5">info</span>
            <p className="text-[12px] text-slate-500 leading-relaxed">
              Recommendations are generated by our AI scoring engine based on your academic marks, stream, location, and college data.
              Match % reflects eligibility and fit — not guaranteed admission.
              <Link href="/search" className="ml-1 text-[#FF3C3C] font-semibold hover:underline">Explore all colleges →</Link>
            </p>
          </div>
        </>
      ) : !loading && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 bg-[#FF3C3C]/5 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[40px] text-[#FF3C3C]/40">school</span>
          </div>
          <h3 className="text-[18px] font-bold text-[#333] mb-2">No recommendations yet</h3>
          <p className="text-[13px] text-gray-400 max-w-xs mb-6">
            Fill in your academic marks and stream to get personalised college recommendations.
          </p>
          {navigate && (
            <button onClick={() => navigate("academic-details")}
              className="px-8 py-3 bg-[#FF3C3C] text-white text-[13px] font-bold rounded-xl hover:bg-[#e63636] transition-colors shadow-lg shadow-red-100">
              Add Academic Details
            </button>
          )}
        </div>
      )}
    </div>
  );
}
