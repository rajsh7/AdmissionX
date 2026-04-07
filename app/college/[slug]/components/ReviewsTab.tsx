import Image from "next/image";

interface Review {
  id: string | number;
  name: string;
  text: string;
  rating: number;
  avatar: string;
  role: string;
}

interface ReviewsTabProps {
  reviews?: Review[];
}

const fallbackReviews: Review[] = Array.from({ length: 6 }).map((_, i) => ({
  id: i,
  name: i % 2 === 0 ? "Lara Smith" : "John Doe",
  role: i % 2 === 0 ? "Harvard Medical" : "Stanford University",
  text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters.",
  rating: 4,
  avatar: i % 2 === 0
    ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=60&w=150&h=150"
    : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=60&w=150&h=150",
}));

export default function ReviewsTab({ reviews: propReviews }: ReviewsTabProps = {}) {
  const reviews = propReviews && propReviews.length > 0 ? propReviews : fallbackReviews;

  const ratingStats = [
    { star: 5, pct: 71 },
    { star: 4, pct: 20 },
    { star: 3, pct: 7 },
    { star: 2, pct: 1 },
    { star: 1, pct: 1 }
  ];

  return (
    <div className="w-full bg-[#f8fafc] pb-24">
      <div className="max-w-[1920px] mx-auto px-8 lg:px-12 xl:px-20 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

        {/* ─── PHASE 1: LEFT SIDEBAR (RATING SUMMARY) ─── */}
        <aside className="lg:col-span-4 space-y-8">

          {/* Overall Rating Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-neutral-100">
            <h4 className="text-slate-900 font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#FF3C3C] rounded-full" />
              Overall Rating
            </h4>

            <div className="flex items-center gap-6 mb-8">
              <div className="text-6xl font-black text-slate-900 leading-none tracking-tighter">4.8</div>
              <div className="flex flex-col gap-1">
                <div className="flex text-[#FF3C3C] text-xl">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <span key={idx} className="material-symbols-rounded fill-1">star</span>
                  ))}
                </div>
                <span className="text-[11px] text-slate-400 font-black uppercase tracking-wider">Based on 5,249 reviews</span>
              </div>
            </div>

            {/* Rating Bars Breakout */}
            <div className="space-y-4">
              {ratingStats.map((stat, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="text-xs font-black text-slate-500 w-12">{stat.star} Stars</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF3C3C] rounded-full"
                      style={{ width: `${stat.pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-slate-900 w-10 text-right">{stat.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Satisfaction Stats Card */}
          <div className="bg-slate-900 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
            {/* Decorative pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

            <span className="text-[#FF3C3C] text-[10px] font-black tracking-[0.3em] uppercase block mb-2">STUDENT</span>
            <h4 className="text-2xl font-black mb-8">Student Satisfaction</h4>

            <div className="flex gap-4">
               <div className="flex-1 bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 text-center transition-all hover:bg-white/10">
                  <span className="material-symbols-rounded text-[#FF3C3C] text-4xl mb-3">thumb_up</span>
                  <h5 className="font-black text-2xl text-white mb-1">94%</h5>
                  <p className="text-[10px] text-white/50 font-black uppercase tracking-widest leading-tight">Recommend to <br /> a friend</p>
               </div>
               <div className="flex-1 bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 text-center transition-all hover:bg-white/10">
                  <span className="material-symbols-rounded text-green-400 text-4xl mb-3">work</span>
                  <h5 className="font-black text-2xl text-white mb-1">92%</h5>
                  <p className="text-[10px] text-white/50 font-black uppercase tracking-widest leading-tight">Employed <br /> in 6 months</p>
               </div>
            </div>
          </div>
        </aside>

        {/* ─── PHASE 2: REVIEWS CONTENT AREA ─── */}
        <main className="lg:col-span-8">

          {/* Main Filter Tabs */}
          <div className="flex flex-wrap items-center gap-3 mb-10 overflow-x-auto scrollbar-hide pb-2">
            {["All Reviews", "Student", "Alumni", "Campus Life", "Placements"].map((tag, idx) => (
              <button
                key={idx}
                className={`px-8 py-3 text-xs font-black whitespace-nowrap transition-all duration-300 border-2 rounded-full uppercase tracking-widest ${
                  idx === 0
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xl'
                    : 'bg-white text-slate-500 border-neutral-100 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Modern Review Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-8 shadow-2xl shadow-slate-200/40 border border-neutral-50 relative group transition-all duration-500 hover:-translate-y-2 hover:shadow-red-500/10"
              >
                {/* Visual Quote Accent */}
                <div className="absolute top-8 right-8 text-neutral-100 group-hover:text-red-50 transition-colors duration-500">
                   <span className="material-symbols-rounded text-6xl rotate-180 opacity-50">format_quote</span>
                </div>

                <div className="relative z-10">
                  {/* User Info */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-xl">
                       <Image src={rev.avatar} alt={rev.name} fill className="object-cover" />
                    </div>
                    <div>
                      <h5 className="text-base font-black text-slate-900 leading-none mb-1">{rev.name}</h5>
                      <span className="text-[11px] font-black text-[#FF3C3C] uppercase tracking-widest">{rev.role}</span>
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-sm leading-relaxed text-slate-600 font-medium mb-8">
                    &ldquo;{rev.text}&rdquo;
                  </p>

                  {/* Rating Stars */}
                  <div className="flex text-[#FF3C3C] border-t border-neutral-50 pt-4 gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                       <span key={i} className={`material-symbols-rounded text-xl ${i < rev.rating ? 'fill-1' : 'text-neutral-200'}`}>star</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* High-Fidelity Red Pagination */}
          <nav className="mt-16 flex justify-center items-center gap-3">
             <button className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-[#FF3C3C] transition-colors">
               <span className="material-symbols-rounded">chevron_left</span>
             </button>
             <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#FF3C3C] text-white font-black text-sm shadow-xl shadow-red-500/20">1</button>
             <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-white text-slate-600 font-black text-sm border border-neutral-100 shadow-sm transition-all hover:border-[#FF3C3C] hover:text-[#FF3C3C]">2</button>
             <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-white text-slate-600 font-black text-sm border border-neutral-100 shadow-sm transition-all hover:border-[#FF3C3C] hover:text-[#FF3C3C]">3</button>
             <span className="text-slate-300 font-black px-2">...</span>
             <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-white text-slate-600 font-black text-sm border border-neutral-100 shadow-sm transition-all hover:border-[#FF3C3C] hover:text-[#FF3C3C]">9</button>
             <button className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-[#FF3C3C] transition-colors">
               <span className="material-symbols-rounded">chevron_right</span>
             </button>
          </nav>
        </main>
      </div>
    </div>
  );
}
