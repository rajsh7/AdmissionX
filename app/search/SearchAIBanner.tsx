"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Props {
  cityId?: string;
  q?: string;
}

interface Rec {
  college: {
    id: string;
    slug: string;
    name: string;
    location: string;
    image: string | null;
    rating: number;
    ranking: number | null;
    isTopUniversity: boolean;
    verified: boolean;
    min_fees: number | null;
    max_fees: number | null;
    streams: string[];
  };
  matchPercent: number;
  reasons: string[];
}

function formatFees(fees: number | null): string | null {
  if (!fees || fees < 500) return null;
  return `₹${fees.toLocaleString("en-IN")} / yr`;
}

function MatchBadge({ pct }: { pct: number }) {
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-[#FF3C3C]";
  return (
    <span className={`${color} text-white text-[10px] font-black px-2.5 py-1 rounded-full whitespace-nowrap`}>
      {pct}% match
    </span>
  );
}

function AICard({ rec, rank }: { rec: Rec; rank: number }) {
  const { college, matchPercent, reasons } = rec;
  const feesLabel = formatFees(college.min_fees) ?? formatFees(college.max_fees);
  const imgSrc = college.image
    ? `/api/image-proxy?url=${encodeURIComponent(college.image)}`
    : null;

  return (
    <div className={`relative bg-white rounded-[12px] border-2 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col ${rank === 1 ? "border-[#FF3C3C]" : "border-neutral-200"}`}>
      {rank === 1 && <div className="h-1 w-full bg-gradient-to-r from-[#FF3C3C] via-orange-400 to-yellow-400" />}

      <div className="relative h-48 w-full flex-shrink-0 bg-neutral-100">
        {imgSrc ? (
          <Image src={imgSrc} alt={college.name} fill sizes="500px" className="object-cover" unoptimized />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
            <span className="material-symbols-outlined text-[56px] text-neutral-300">account_balance</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div className={`absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase shadow-lg ${rank === 1 ? "bg-[#FF3C3C] text-white" : "bg-neutral-900 text-white"}`}>
          <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {rank === 1 ? "workspace_premium" : "recommend"}
          </span>
          {rank === 1 ? "Best Match" : "2nd Pick"}
        </div>

        <div className="absolute top-3 right-3">
          {feesLabel ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-[8px] px-3 py-1.5 shadow-lg border border-white/50">
              <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest leading-none mb-0.5">Starting Fees</p>
              <p className="text-[15px] font-black text-[#FF3C3C] leading-none">{feesLabel}</p>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-sm rounded-[8px] px-3 py-1.5 shadow-lg border border-white/50">
              <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest leading-none mb-0.5">Fees</p>
              <p className="text-[12px] font-bold text-neutral-500 leading-none italic">Contact college</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-[16px] font-bold text-[#1a1a1a] leading-snug line-clamp-2 flex-1">{college.name}</h4>
          <MatchBadge pct={matchPercent} />
        </div>

        <p className="flex items-center gap-1 text-[12px] text-neutral-400 -mt-1">
          <span className="material-symbols-outlined text-[14px]">location_on</span>
          <span className="truncate">{college.location}</span>
        </p>

        <div className="flex flex-wrap gap-1.5">
          {college.rating > 0 && (
            <span className="flex items-center gap-0.5 px-2 py-1 bg-amber-50 text-amber-700 rounded-[6px] text-[11px] font-bold">
              <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              {college.rating.toFixed(1)}
            </span>
          )}
          {college.ranking && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-[6px] text-[11px] font-bold">
              #{college.ranking} Ranked
            </span>
          )}
          {college.isTopUniversity && (
            <span className="flex items-center gap-0.5 px-2 py-1 bg-purple-50 text-purple-700 rounded-[6px] text-[11px] font-bold">
              <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
              Top University
            </span>
          )}
          {college.verified && (
            <span className="flex items-center gap-0.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-[6px] text-[11px] font-bold">
              <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              Verified
            </span>
          )}
        </div>

        {college.streams.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {college.streams.slice(0, 3).map(s => (
              <span key={s} className="px-2 py-0.5 bg-[#FF3C3C]/5 text-[#FF3C3C] text-[10px] font-bold rounded-full border border-[#FF3C3C]/15">
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="bg-slate-50 rounded-[8px] p-3 space-y-1.5">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
            <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
            Why this college?
          </p>
          {reasons.slice(0, 2).map((r, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="material-symbols-outlined text-[13px] text-emerald-500 shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-[11px] text-slate-600 font-medium leading-snug">{r}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-auto pt-1">
          <Link
            href={`/college/${college.slug}?query=1`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white border-2 border-[#FF3C3C] hover:bg-[#FF3C3C] hover:text-white text-[#FF3C3C] text-[12px] font-bold rounded-[8px] transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[14px]">help</span>
            Ask Query
          </Link>
          <Link
            href={`/apply/${college.slug}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#FF3C3C] hover:bg-[#e63636] text-white text-[12px] font-bold rounded-[8px] transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">edit_document</span>
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SearchAIBanner({ cityId, q }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const [recs, setRecs] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  // Check auth once on mount
  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d?.user?.role === "student" && d.user.id) {
          setUserId(String(d.user.id));
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  // Re-fetch recommendations whenever userId, cityId, or q changes
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (cityId) params.set("city_id", cityId);
    if (q) params.set("q", q);
    const qs = params.toString();
    fetch(`/api/ai/recommend/${userId}${qs ? `?${qs}` : ""}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        setRecs(d.recommendations ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId, cityId, q]);

  if (dismissed || (!loading && (!userId || recs.length === 0))) return null;

  if (loading) {
    return (
      <div className="mb-8 rounded-[12px] border border-[#FF3C3C]/20 bg-gradient-to-r from-[#FF3C3C]/5 to-orange-50 p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-4 bg-[#FF3C3C]/20 rounded" />
          <div className="h-4 w-40 bg-[#FF3C3C]/10 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-72 bg-white/70 rounded-[12px]" />
          <div className="h-72 bg-white/70 rounded-[12px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-[12px] border border-[#FF3C3C]/20 bg-gradient-to-br from-[#FF3C3C]/5 via-orange-50/50 to-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#FF3C3C] rounded-[8px] flex items-center justify-center shadow-md shadow-red-200">
            <span className="material-symbols-outlined text-[18px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>
          <div>
            <p className="text-[14px] font-black text-[#1a1a1a] leading-none">AI Picks For You</p>
            <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
              {cityId ? "Best matches in your selected city" : "Personalised based on your academic profile"}
            </p>
          </div>
          <span className="text-[10px] font-black text-[#FF3C3C] bg-[#FF3C3C]/10 px-2.5 py-1 rounded-full uppercase tracking-wider border border-[#FF3C3C]/20">
            Smart Match
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-neutral-200 transition-colors text-neutral-400"
          aria-label="Dismiss"
        >
          <span className="material-symbols-outlined text-[17px]">close</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recs.map((rec, i) => (
          <AICard key={rec.college.id} rec={rec} rank={i + 1} />
        ))}
      </div>

      <p className="mt-3 text-[11px] text-neutral-400 text-center">
        Match score based on your marks & stream ·{" "}
        <Link href="/dashboard/student" className="text-[#FF3C3C] font-semibold hover:underline">
          Update academic details
        </Link>{" "}
        for better picks
      </p>
    </div>
  );
}
