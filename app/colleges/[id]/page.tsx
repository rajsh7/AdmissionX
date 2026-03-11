"use client";

import { useEffect, useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Header from "../../components/Header";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200";

interface CollegeDetails {
  id: number;
  name: string;
  image: string | null;
  slug: string | null;
  location: string;
  city: string;
  country: string;
  rating: number | null;
  estyear: string;
  address: string;
  totalStudent: number | null;
  ranking: number | null;
  universityType: string | null;
  profile: {
    description: string;
    established_year: string;
    website: string;
    phone: string;
    email: string;
    facebook?: string;
    twitter?: string;
    admissionStart?: string;
    admissionEnd?: string;
    contactPerson?: string;
  };
  courses?: Array<{
    id: number;
    name: string;
    pageslug?: string;
    logoimage?: string;
    bannerimage?: string;
    duration?: string;
    degree_name?: string;
    functional_area_name?: string;
  }>;
  facilities?: string[];
}

type DegreeColorKey = "default" | "engineering" | "business" | "medical" | "arts" | "law";

const DEGREE_COLORS: Record<DegreeColorKey, { bg: string; text: string; border: string; dot: string }> = {
  default:     { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500" },
  engineering: { bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200",     dot: "bg-sky-500" },
  business:    { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500" },
  medical:     { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    dot: "bg-rose-500" },
  arts:        { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  law:         { bg: "bg-slate-100",  text: "text-slate-700",   border: "border-slate-200",   dot: "bg-slate-600" },
};

function getDegreeColorKey(name: string): DegreeColorKey {
  const lower = (name || "").toLowerCase();
  if (lower.match(/engineer|tech|computer|software|it\b/)) return "engineering";
  if (lower.match(/business|management|mba|bba|commerce|finance/)) return "business";
  if (lower.match(/medical|medicine|health|nursing|pharma|dental/)) return "medical";
  if (lower.match(/arts|design|humanit|literature|media/)) return "arts";
  if (lower.match(/law|legal|policy|political/)) return "law";
  return "default";
}

function StarRating({ value }: { value: number | null }) {
  if (value === null) return <span className="text-gray-400 text-xs text-nowrap">No rating</span>;
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <svg
            key={s}
            className={`w-4 h-4 ${s <= Math.round(value) ? "text-yellow-400" : "text-gray-300"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.164c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.951 2.878c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.062 9.384c-.783-.57-.38-1.81.588-1.81h4.164a1 1 0 00.95-.69l1.285-3.957z" />
          </svg>
        ))}
      </div>
      <span className="text-sm font-bold text-gray-700 ml-1">{value.toFixed(1)}</span>
    </div>
  );
}

export default function CollegeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const collegeId = resolvedParams.id;

  const [college, setCollege] = useState<CollegeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "facilities">("overview");

  useEffect(() => {
    async function loadData() {
      if (!collegeId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/colleges/${collegeId}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load college");
        }
        setCollege(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [collegeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header onLoginClick={() => {}} onRegisterClick={() => {}} />
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full"
          />
          <p className="mt-4 text-gray-500 font-medium animate-pulse">Gathering college details...</p>
        </div>
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header onLoginClick={() => {}} onRegisterClick={() => {}} />
        <div className="flex-1 flex items-center justify-center p-6 text-nowrap">
          <div className="bg-white border border-gray-100 shadow-xl rounded-3xl p-10 text-center max-w-lg w-full">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">College Not Found</h2>
            <p className="text-gray-500 mb-8 whitespace-normal">
              {error || "We couldn't find the college you were looking for. It might have been moved or deleted."}
            </p>
            <Link
              href="/colleges"
              className="inline-flex items-center justify-center bg-red-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-red-200"
            >
              Back to Explorer
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const location = [college.city, college.country].filter(Boolean).join(", ") || college.location;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header onLoginClick={() => {}} onRegisterClick={() => {}} />

      {/* ── CINEMATIC HERO ── */}
      <section className="relative h-[450px] md:h-[550px] flex items-end overflow-hidden group">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
          style={{ backgroundImage: `url(${college.image || FALLBACK_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        {/* Floating particles or accents could go here */}
        
        <div className="relative z-10 px-15 w-full pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/colleges"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 text-sm font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-md transition-all border border-white/10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Browse All Colleges
            </Link>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              {college.universityType && (
                <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md">
                  {college.universityType}
                </span>
              )}
              {college.ranking && (
                <span className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md">
                  Rank #{college.ranking}
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-2xl max-w-4xl">
              {college.name}
            </h1>

            <div className="flex flex-wrap items-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-white/90">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="font-semibold text-lg">{location}</span>
              </div>

              {college.rating && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                  <StarRating value={college.rating} />
                  <span className="text-xs text-white/60 font-medium">Verified Rating</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS RIBBON ── */}
      <div className="relative -mt-8 z-20 px-15">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-white p-5 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center text-center">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Established</span>
            <span className="text-xl font-black text-gray-900">{college.estyear || college.profile?.established_year}</span>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center text-center">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Students</span>
            <span className="text-xl font-black text-gray-900">{college.totalStudent || "2500+"}</span>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center text-center">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Courses</span>
            <span className="text-xl font-black text-gray-900">{college.courses?.length || 0}+</span>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center text-center">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Campus Type</span>
            <span className="text-xl font-black text-gray-900">{college.universityType || "Private"}</span>
          </div>
        </motion.div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <section className="px-15 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* LEFT CONTENT */}
          <div className="flex-1 space-y-8">
            
            {/* TABS NAVBAR */}
            <div className="flex items-center gap-8 border-b border-gray-200">
              {["overview", "courses", "facilities"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`relative pb-4 text-sm font-bold uppercase tracking-widest transition-colors ${
                    activeTab === tab ? "text-red-600" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 min-h-[400px]"
              >
                {activeTab === "overview" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-black text-gray-900 mb-6">About the Institution</h2>
                      <div 
                        className="prose prose-red max-w-none text-gray-600 leading-relaxed text-lg"
                        dangerouslySetInnerHTML={{ __html: college.profile.description || "No detailed description available." }}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Contact Information
                        </h3>
                        <div className="space-y-3">
                          <p className="text-gray-600 flex items-center gap-3">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                            {college.profile.phone || "Not available"}
                          </p>
                          <p className="text-gray-600 flex items-center gap-3">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                            {college.profile.email || "Not available"}
                          </p>
                          {college.profile.website && (
                            <a 
                              href={college.profile.website.startsWith('http') ? college.profile.website : `https://${college.profile.website}`}
                              target="_blank" rel="noopener noreferrer"
                              className="text-red-600 hover:underline flex items-center gap-3 font-semibold"
                            >
                              <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                              Visit Official Website
                            </a>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Campus Address
                        </h3>
                        <p className="text-gray-600 leading-relaxed italic">
                          {college.address || "Please contact the admissions office for the full address."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "courses" && (
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-3xl font-black text-gray-900">Academic Programs</h2>
                      <span className="bg-red-50 text-red-600 text-xs font-bold px-4 py-2 rounded-full">
                        {college.courses?.length || 0} Program{(college.courses?.length || 0) !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {college.courses && college.courses.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {college.courses.map((course, index) => {
                          const colorKey = getDegreeColorKey(course.degree_name || course.name);
                          const color = DEGREE_COLORS[colorKey];
                          return (
                            <motion.div
                              key={course.id}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                            >
                              <Link
                                href={`/courses/${course.pageslug || course.id}`}
                                className="group block h-full"
                              >
                                <div className="h-full bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:border-red-100 transition-all duration-300 flex flex-col gap-3">
                                  {/* Top row: badge + arrow */}
                                  <div className="flex items-start justify-between gap-2">
                                    <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${color.bg} ${color.text} ${color.border} border`}>
                                      {colorKey}
                                    </span>
                                    <span className="text-gray-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                      </svg>
                                    </span>
                                  </div>

                                  {/* Course name */}
                                  <h4 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors leading-snug line-clamp-2">
                                    {course.name}
                                  </h4>

                                  {/* Meta row */}
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-auto">
                                    {course.degree_name && (
                                      <span className="flex items-center gap-1 text-[11px] text-gray-500">
                                        <span className={`w-1.5 h-1.5 rounded-full ${color.dot} inline-block`} />
                                        {course.degree_name}
                                      </span>
                                    )}
                                    {course.functional_area_name && (
                                      <span className="flex items-center gap-1 text-[11px] text-gray-400 italic">
                                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        {course.functional_area_name}
                                      </span>
                                    )}
                                    {course.duration && (
                                      <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {course.duration}
                                      </span>
                                    )}
                                  </div>

                                  {/* Footer */}
                                  <div className="pt-3 border-t border-gray-50">
                                    <span className="text-[11px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                                      Admissions Open
                                    </span>
                                  </div>
                                </div>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-3xl p-12 text-center">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-gray-500 font-medium">Courses list for this session is being updated.</p>
                        <button className="mt-4 text-red-600 font-bold hover:underline">Get Notified</button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "facilities" && (
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-8">World Class Facilities</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {(college.facilities || []).map((facility) => (
                        <div key={facility} className="group relative p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-red-100 transition-all flex flex-col items-center text-center">
                          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="text-2xl">
                              {facility === "WiFi" ? "📡" : 
                               facility === "Library" ? "📚" : 
                               facility === "Hostel" ? "🏠" : 
                               facility === "Sports" ? "⚽" : 
                               facility === "Labs" ? "🧪" : "🌟"}
                            </span>
                          </div>
                          <span className="font-bold text-gray-900">{facility}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="w-full lg:w-[380px] space-y-8">
            
            {/* CTA CARD */}
            <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-3xl" />
              
              <h3 className="text-2xl font-black mb-4">Admissions Open 2026</h3>
              <p className="text-white/80 mb-8 leading-relaxed">
                Take the first step towards your career. Our counselors are ready to guide you.
              </p>
              
              <div className="space-y-4">
                <button className="w-full bg-white text-red-700 py-4 rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Apply Online Now
                </button>
                <button className="w-full bg-red-500/30 border border-white/20 text-white py-4 rounded-2xl font-bold hover:bg-white/10 transition-all">
                  Download Brochure
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gray-200 border-2 border-red-700" />
                  ))}
                  <div className="w-10 h-10 rounded-full bg-red-400 border-2 border-red-700 flex items-center justify-center text-[10px] font-bold">
                    +5k
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/60 text-right">
                  Students Joined <br/> This Month
                </span>
              </div>
            </div>

            {/* QUICK CONTACT */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
              <h4 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-wider">Quick Contact</h4>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Call Support</p>
                    <p className="text-gray-900 font-bold">{college.profile.phone || "+91-1234567890"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Admissions In-charge</p>
                    <p className="text-gray-900 font-bold">{college.profile.contactPerson || "Prof. John Doe"}</p>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex gap-4 pt-4 border-t border-gray-50">
                  {college.profile.facebook && (
                    <a href={college.profile.facebook} className="w-10 h-10 bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white rounded-xl flex items-center justify-center transition-all">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.3c-4.6 0-5.6 3.5-5.6 5.6v1.4H6.5v4.3h2.1V23.5h5.6V11.8h3.9l.67-4.34z"/></svg>
                    </a>
                  )}
                  {college.profile.twitter && (
                    <a href={college.profile.twitter} className="w-10 h-10 bg-gray-50 text-gray-400 hover:bg-black hover:text-white rounded-xl flex items-center justify-center transition-all">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

          </aside>
        </div>
      </section>
      
      {/* ── FOOTER SPACING ── */}
      <div className="h-20" />
    </div>
  );
}