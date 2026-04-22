"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Review {
  id: string;
  title: string;
  description: string;
  academic: number;
  infrastructure: number;
  faculty: number;
  accommodation: number;
  placement: number;
  social: number;
  votes: number;
  student_name: string;
  student_email: string;
  created_at: string;
  rating: number;
}

interface Props {
  college: CollegeUser;
}

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(max)].map((_, i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-[18px] ${
            i < value ? "text-amber-500" : "text-slate-200"
          }`}
          style={{ fontVariationSettings: i < value ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
    </div>
  );
}

function RatingBadge({ label, value }: { label: string; value: number }) {
  // value is 0-10, show as X/10
  return (
    <div className="flex items-center justify-between gap-4 p-2 rounded-lg bg-slate-50 border border-slate-100">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-red-500 rounded-full" style={{ width: `${(value / 10) * 100}%` }} />
        </div>
        <span className="text-[12px] font-black text-slate-700">{value}/10</span>
      </div>
    </div>
  );
}

export default function ReviewsTab({ college }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = college.slug;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/reviews`);
      if (!res.ok) throw new Error("Failed to load reviews");
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="pb-24 font-poppins">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-1.5 h-6 bg-[#FF3D3D] rounded-full" />
            <h2 className="text-[24px] font-black text-slate-800 uppercase tracking-tight">Student Reviews</h2>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            Listen to what students are saying about your institution.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-6 shadow-sm">
          <div className="text-center border-r border-slate-100 pr-6">
            <p className="text-[32px] font-black text-slate-800 leading-none mb-1">{avgRating}</p>
            <StarRating value={Math.round(Number(avgRating))} />
          </div>
          <div className="space-y-1">
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Total Reviews</p>
            <p className="text-[18px] font-black text-slate-800">{reviews.length} Responses</p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="p-12 text-center bg-red-50 rounded-3xl border border-red-100">
          <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
          <p className="text-red-700 font-bold">{error}</p>
          <button onClick={load} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg font-bold">Try Again</button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
          <span className="material-symbols-outlined text-slate-300 text-6xl mb-4">rate_review</span>
          <p className="text-slate-400 font-bold text-lg">No reviews found for your institution yet.</p>
          <p className="text-slate-400 text-sm mt-1 text-balance max-w-sm mx-auto">
            Reviews will appear here once students start sharing their experiences.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="p-6 border-b border-slate-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                      <span className="material-symbols-outlined text-slate-400 text-[20px]">person</span>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{r.student_name}</p>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">Verified Student</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StarRating value={r.rating} />
                    <p className="text-[10px] text-slate-400 mt-1 font-bold">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Recently"}
                    </p>
                  </div>
                </div>
                <h3 className="text-[16px] font-black text-slate-800 mb-2 leading-tight">
                  &ldquo;{r.title}&rdquo;
                </h3>
                <p className="text-[13px] text-slate-600 leading-relaxed line-clamp-3 italic">
                  {r.description}
                </p>
              </div>
              <div className="p-6 bg-slate-50/50 flex-1">
                <div className="grid grid-cols-2 gap-3">
                  <RatingBadge label="Academic" value={r.academic} />
                  <RatingBadge label="Infra" value={r.infrastructure} />
                  <RatingBadge label="Faculty" value={r.faculty} />
                  <RatingBadge label="Placement" value={r.placement} />
                  <RatingBadge label="Social" value={r.social} />
                  <RatingBadge label="Hostel" value={r.accommodation} />
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>thumb_up</span>
                    <span className="text-[11px] font-black uppercase tracking-widest">{r.votes} Helpful</span>
                  </div>
                  <button className="text-[11px] font-black text-red-600 uppercase tracking-widest hover:underline">
                    Report Issue
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
