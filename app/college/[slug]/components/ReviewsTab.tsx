"use client";
import ExploreCards from "@/app/components/ExploreCards";

interface Review {
  id: string | number;
  name: string;
  text: string;
  rating: number;
  role: string;
}

interface ReviewsTabProps {
  reviews?: Review[];
}

export default function ReviewsTab({ reviews = [] }: ReviewsTabProps) {
  const count = reviews.length;
  const avg = count > 0
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
    : 0;

  const ratingBuckets = [5, 4, 3, 2, 1].map(star => ({
    star,
    pct: count > 0
      ? Math.round((reviews.filter(r => r.rating === star).length / count) * 100)
      : 0,
  }));

  return (
    <div className="w-full bg-[#f8fafc] pb-24">
      <div className="max-w-[1920px] mx-auto px-4 md:px-10 lg:px-12 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

        {/* LEFT SIDEBAR */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[5px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] pl-4 md:pl-6 pr-8 py-8 border border-neutral-100">
            <span className="text-[#FF3C3C] text-[24px] font-bold tracking-[0.3em] uppercase block mb-4">OVERALL RATING</span>
            {count > 0 ? (
              <>
                <div className="flex items-center gap-6 mb-8">
                  <div className="text-[40px] font-bold leading-none tracking-tighter" style={{ color: "rgba(62,62,62,1)" }}>{avg}</div>
                  <div className="flex flex-col gap-1">
                    <div className="flex text-yellow-400 gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="material-symbols-rounded text-xl"
                          style={{ fontVariationSettings: i < Math.round(avg) ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                      Based on {count} review{count !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {ratingBuckets.map(({ star, pct }) => (
                    <div key={star} className="flex items-center gap-4">
                      <span className="text-xs font-black text-slate-500 w-12">{star} Stars</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-[5px] overflow-hidden">
                        <div className="h-full bg-[#FF3C3C] rounded-[5px]" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-black text-slate-900 w-10 text-right">{pct}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-slate-400 text-sm">No ratings yet.</p>
            )}
          </div>
        </aside>

        {/* REVIEWS AREA */}
        <main className="lg:col-span-8">
          {count === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-20 text-center">
              <span className="material-symbols-outlined text-6xl text-slate-200 block mb-4"
                style={{ fontVariationSettings: "'FILL' 1" }}>rate_review</span>
              <p className="text-slate-400 font-bold text-lg">No reviews yet.</p>
              <p className="text-slate-400 text-sm mt-1">Be the first to share your experience.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reviews.map((rev) => (
                <div key={rev.id}
                  className="bg-white rounded-[5px] pl-4 md:pl-6 pr-8 pt-8 pb-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-50 relative transition-all duration-500 hover:-translate-y-2">
                  <div className="absolute top-8 right-8 text-[#FF3C3C]">
                    <span className="material-symbols-rounded text-3xl">format_quote</span>
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center text-lg font-black shrink-0">
                        {rev.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h5 className="text-[16px] font-bold text-slate-900 leading-none mb-1">{rev.name}</h5>
                        <span className="text-[11px] font-medium text-slate-400">{rev.role}</span>
                      </div>
                    </div>
                    <div className="border-l-2 border-[#FF3C3C] pl-4 mb-8">
                      <p className="text-sm leading-relaxed text-slate-600 font-medium italic">&ldquo;{rev.text}&rdquo;</p>
                    </div>
                    <div className="flex text-yellow-400 border-t border-neutral-200 pt-3 gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`material-symbols-rounded text-xl ${i >= rev.rating ? "text-neutral-200" : ""}`}
                          style={{ fontVariationSettings: i < rev.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 md:px-10 lg:px-12 pb-10">
        <ExploreCards />
      </div>
    </div>
  );
}
