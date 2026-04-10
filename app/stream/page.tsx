import { getDb } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

// Dynamic page (requires database access at request time)
export const dynamic = 'force-dynamic';

interface StreamCard {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  college_count: number;
  degree_count: number;
  course_count: number;
  color: string;
  icon: string;
  gradient: string;
}

const STREAM_META: Record<string, { color: string; icon: string; gradient: string }> = {
  engineering:  { color: "text-blue-700",    icon: "engineering",       gradient: "from-blue-500 to-blue-700"     },
  management:   { color: "text-purple-700",  icon: "business_center",   gradient: "from-purple-500 to-purple-700" },
  mba:          { color: "text-indigo-700",  icon: "trending_up",       gradient: "from-indigo-500 to-indigo-700" },
  medical:      { color: "text-red-700",     icon: "medical_services",  gradient: "from-red-500 to-red-700"       },
  law:          { color: "text-amber-700",   icon: "gavel",             gradient: "from-amber-500 to-amber-600"   },
  arts:         { color: "text-rose-700",    icon: "palette",           gradient: "from-rose-500 to-rose-700"     },
  science:      { color: "text-emerald-700", icon: "science",           gradient: "from-emerald-500 to-emerald-700"},
  commerce:     { color: "text-orange-700",  icon: "account_balance",   gradient: "from-orange-500 to-orange-600" },
  computer:     { color: "text-cyan-700",    icon: "computer",          gradient: "from-cyan-500 to-cyan-700"     },
  education:    { color: "text-teal-700",    icon: "school",            gradient: "from-teal-500 to-teal-700"     },
  pharmacy:     { color: "text-green-700",   icon: "medication",        gradient: "from-green-500 to-green-700"   },
  design:       { color: "text-pink-700",    icon: "draw",              gradient: "from-pink-500 to-pink-700"     },
  hospitality:  { color: "text-yellow-700",  icon: "hotel",             gradient: "from-yellow-500 to-yellow-600" },
  media:        { color: "text-violet-700",  icon: "movie",             gradient: "from-violet-500 to-violet-700" },
  agriculture:  { color: "text-lime-700",    icon: "agriculture",       gradient: "from-lime-500 to-lime-700"     },
  architecture: { color: "text-stone-700",   icon: "architecture",      gradient: "from-stone-500 to-stone-700"   },
  default:      { color: "text-neutral-700", icon: "menu_book",         gradient: "from-neutral-500 to-neutral-700"},
};

const GRADIENTS = [
  "from-blue-500 to-blue-700", "from-red-500 to-rose-700", "from-emerald-500 to-teal-700",
  "from-purple-500 to-indigo-700", "from-amber-500 to-orange-600", "from-cyan-500 to-blue-600",
  "from-pink-500 to-rose-600", "from-green-500 to-emerald-700", "from-violet-500 to-purple-700",
  "from-orange-500 to-red-600",
];

function getStreamMeta(name: string) {
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(STREAM_META)) {
    if (key !== "default" && lower.includes(key)) return val;
  }
  return STREAM_META.default;
}

export const metadata = {
  title: "Explore Study Streams | AdmissionX",
  description: "Browse all study streams — Engineering, MBA, Medical, Law, Arts, Science and more.",
};

export const revalidate = 300;

export default async function StreamPage() {
  const db = await getDb();

  const faRows = await db.collection("functionalarea")
    .find({ name: { $exists: true, $ne: "" } })
    .sort({ isShowOnTop: -1, name: 1 })
    .limit(50)
    .project({ id: 1, name: 1, pageslug: 1, logoimage: 1, bannerimage: 1 })
    .toArray();

  // Get college counts per functionalarea
  const faIds = faRows.map((r) => r.id).filter(Boolean);
  const [collegeCounts, degreeCounts, courseCounts] = await Promise.all([
    db.collection("collegemaster").aggregate([
      { $match: { functionalarea_id: { $in: faIds } } },
      { $group: { _id: "$functionalarea_id", count: { $addToSet: "$collegeprofile_id" } } },
      { $project: { count: { $size: "$count" } } },
    ]).toArray(),
    db.collection("degree").aggregate([
      { $match: { functionalarea_id: { $in: faIds } } },
      { $group: { _id: "$functionalarea_id", count: { $sum: 1 } } },
    ]).toArray(),
    db.collection("course").aggregate([
      { $match: { functionalarea_id: { $in: faIds } } },
      { $group: { _id: "$functionalarea_id", count: { $sum: 1 } } },
    ]).toArray(),
  ]);

  const collegeMap = Object.fromEntries(collegeCounts.map((r) => [r._id, r.count]));
  const degreeMap = Object.fromEntries(degreeCounts.map((r) => [r._id, r.count]));
  const courseMap = Object.fromEntries(courseCounts.map((r) => [r._id, r.count]));

  const streams: StreamCard[] = faRows.map((row, i) => {
    const slug = row.pageslug || row.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const meta = getStreamMeta(row.name);
    return {
      id: row.id,
      name: row.name,
      slug,
      image: row.bannerimage ? `https://admin.admissionx.in/uploads/${row.bannerimage}` : null,
      college_count: collegeMap[row.id] ?? 0,
      degree_count: degreeMap[row.id] ?? 0,
      course_count: courseMap[row.id] ?? 0,
      color: meta.color,
      icon: meta.icon,
      gradient: meta.gradient || GRADIENTS[i % GRADIENTS.length],
    };
  });

  streams.sort((a, b) => b.college_count - a.college_count);

  const totalColleges = streams.reduce((s, r) => s + r.college_count, 0);
  const featured = streams.slice(0, 6);
  const remaining = streams.slice(6);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col relative">
      <div className="absolute top-0 left-0 w-full h-[380px] z-0 overflow-hidden text-[0px] font-[0] leading-[0]">
        <Image
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000"
          alt="Campus Background" fill priority sizes="100vw" quality={80} className="object-cover"
        />
        <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10">
        <Header />

        <div className="pt-28 pb-20">
          <div className="w-full px-4 lg:px-8 xl:px-12 flex flex-col items-center text-center">
            <nav className="flex items-center justify-center gap-2 text-xs text-neutral-500 mb-6 font-medium">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-neutral-300">Streams</span>
            </nav>

            <div className="w-full max-w-4xl flex flex-col items-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                  <span className="material-symbols-outlined text-[13px]">school</span>
                  Explore by Stream
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                Find Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500">
                  Field of Study
                </span>
              </h1>
              <p className="text-neutral-400 text-base sm:text-lg leading-relaxed mb-8">
                Browse {streams.length} streams across India&apos;s top colleges.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6">
                {[
                  { label: "Streams", value: streams.length, icon: "category" },
                  { label: "Colleges", value: `${Math.floor(totalColleges / 100) * 100}+`, icon: "account_balance" },
                  { label: "Degrees", value: "200+", icon: "workspace_premium" },
                  { label: "Courses", value: "1500+", icon: "menu_book" },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-red-400">{stat.icon}</span>
                    <div>
                      <span className="text-white font-black text-lg leading-none">{stat.value}</span>
                      <span className="text-neutral-500 text-xs block">{stat.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full px-4 lg:px-8 xl:px-12 py-12">
          {featured.length > 0 && (
            <section className="mb-14">
              <div className="mb-6">
                <h2 className="text-xl font-black text-white">Popular Streams</h2>
                <p className="text-sm text-neutral-300 mt-1">Most-searched fields of study</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
                {featured.map((stream) => (
                  <Link
                    key={stream.id}
                    href={`/search?stream=${stream.slug}`}
                    className="group relative overflow-hidden rounded-3xl bg-neutral-900 min-h-[200px] flex flex-col justify-between p-6 hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-black/20"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${stream.gradient} opacity-80 group-hover:opacity-90 transition-opacity duration-300`} />
                    <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                        <span className="material-symbols-outlined text-[22px] text-white">{stream.icon}</span>
                      </div>
                      <h3 className="text-xl font-black text-white mb-1">{stream.name}</h3>
                      <p className="text-white/70 text-sm font-medium">{stream.college_count.toLocaleString()} colleges</p>
                    </div>
                    <div className="relative z-10 mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-white/60 text-xs font-medium">
                        {stream.degree_count > 0 && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">workspace_premium</span>
                            {stream.degree_count} degrees
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1.5 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl group-hover:bg-white group-hover:text-neutral-900 transition-colors duration-300">
                        Explore
                        <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {remaining.length > 0 && (
            <section>
              <div className="mb-6">
                <h2 className="text-xl font-black text-white">All Streams</h2>
                <p className="text-sm text-neutral-300 mt-1">{remaining.length} more streams to explore</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3">
                {remaining.map((stream, i) => (
                  <Link
                    key={stream.id}
                    href={`/search?stream=${stream.slug}`}
                    className="group flex items-center gap-3 bg-white rounded-2xl border border-neutral-100 hover:border-red-200 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300 p-4"
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <span className="material-symbols-outlined text-[18px] text-white">{stream.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-neutral-900 group-hover:text-red-600 transition-colors truncate">{stream.name}</h3>
                      <p className="text-xs text-neutral-400 mt-0.5">{stream.college_count.toLocaleString()} colleges</p>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-neutral-300 group-hover:text-red-500 transition-all duration-200 flex-shrink-0">arrow_forward</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {streams.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-3xl bg-neutral-100 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-[40px] text-neutral-300">school</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No streams found</h3>
              <p className="text-sm text-neutral-300 max-w-xs">We couldn&apos;t load the streams right now. Please try again shortly.</p>
            </div>
          )}

          {streams.length > 0 && (
            <div className="mt-16 rounded-3xl bg-neutral-900 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 p-8 sm:p-10">
                <div>
                  <h3 className="text-2xl font-black text-white mb-2">Can&apos;t decide your stream?</h3>
                  <p className="text-neutral-400 text-sm max-w-sm">Browse all colleges across every stream, apply filters, and find the perfect fit.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                  <Link href="/search" className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition-colors shadow-lg shadow-red-600/20 whitespace-nowrap">
                    <span className="material-symbols-outlined text-[18px]">search</span>
                    Explore All Colleges
                  </Link>
                  <Link href="/top-colleges" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition-colors whitespace-nowrap">
                    <span className="material-symbols-outlined text-[18px]">emoji_events</span>
                    Top Colleges
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}




