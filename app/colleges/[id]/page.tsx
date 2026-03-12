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
  default: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
  engineering: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", dot: "bg-sky-500" },
  business: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  medical: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-500" },
  arts: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  law: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200", dot: "bg-slate-600" },
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
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "facilities" | "gallery" | "faculties" | "events" | "admission" | "reviews" | "faqs" | "helpdesk" | "social">("overview");

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
        <Header onLoginClick={() => { }} onRegisterClick={() => { }} />
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
        <Header onLoginClick={() => { }} onRegisterClick={() => { }} />
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
      <Header onLoginClick={() => { }} onRegisterClick={() => { }} />

      {/* ── CINEMATIC HERO ── */}
      <section className="relative h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] flex items-end overflow-hidden group">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
          style={{ backgroundImage: `url(${college.image || FALLBACK_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Floating particles or accents could go here */}

        <div className="relative z-10 px-15 w-full pb-10 sm:pb-16">
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

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-2xl max-w-4xl">
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
      <section className="px-15 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-10">

          {/* LEFT CONTENT */}
          <div className="flex-1 space-y-8 min-w-0">

            {/* TABS NAVBAR */}
            <div className="flex items-center gap-4 lg:gap-6 border-b border-gray-200 overflow-x-auto hide-scrollbar pb-2">
              {[
                { id: "overview", label: "Overview" },
                { id: "courses", label: "Courses" },
                { id: "facilities", label: "Facilities" },
                { id: "gallery", label: "Gallery" },
                { id: "faculties", label: "Faculties" },
                { id: "events", label: "Placement" },
                { id: "admission", label: "Admission" },
                { id: "reviews", label: "Reviews" },
                { id: "faqs", label: "FAQs" },
                { id: "helpdesk", label: "Help" },
                { id: "social", label: "Social" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative pb-4 text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${activeTab === tab.id ? "text-red-600" : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
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
                className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-5 sm:p-8 md:p-12 shadow-sm border border-gray-100 min-h-[400px]"
              >
                {activeTab === "overview" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">About the Institution</h2>
                      <div
                        className="prose prose-red max-w-none text-gray-600 leading-relaxed text-lg"
                        dangerouslySetInnerHTML={{ __html: college.profile.description || "No detailed description available." }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pt-8 border-t border-gray-100">
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
                      <h2 className="text-2xl md:text-3xl font-black text-gray-900">Academic Programs</h2>
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
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">World Class Facilities</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
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

                {activeTab === "gallery" && (
                  <div className="animate-fade-in">
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">Photos, Videos & Achievements</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {/* Using mock images for gallery */}
                      <div className="col-span-2 md:col-span-2 row-span-2 relative rounded-3xl overflow-hidden group">
                        <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800" alt="Campus" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                          <span className="text-white font-bold text-lg">Main Campus Building</span>
                        </div>
                      </div>
                      <div className="relative rounded-3xl overflow-hidden group aspect-square">
                        <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=400" alt="Graduation" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="relative rounded-3xl overflow-hidden group aspect-square">
                        <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=400" alt="Students" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mt-10 mb-6">Recent Achievements</h3>
                    <div className="space-y-4">
                      {[
                        "Ranked #1 in Innovation by National Education Board 2025",
                        "Best Green Campus Award 2024",
                        "100% Placement Record in Computer Science department for 3 consecutive years"
                      ].map((achievement, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100">
                          <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center shrink-0 text-xl">
                            🏆
                          </div>
                          <p className="font-semibold text-gray-800">{achievement}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "faculties" && (
                  <div className="animate-fade-in">
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">Our Distinguished Faculties</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {[
                        { name: "Dr. Sarah Jenkins", role: "Dean of Engineering", exp: "20+ Years" },
                        { name: "Prof. Michael Chen", role: "Head of Business Administration", exp: "15+ Years" },
                        { name: "Dr. Emily Rodriguez", role: "Director of Research", exp: "18+ Years" },
                        { name: "Prof. James Wilson", role: "Sr. Professor, Computer Science", exp: "12+ Years" },
                        { name: "Dr. Anita Patel", role: "Head of Medical Sciences", exp: "22+ Years" },
                        { name: "Prof. David Thompson", role: "Professor of Arts & Design", exp: "10+ Years" },
                      ].map((faculty, idx) => (
                        <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-6 text-center hover:shadow-xl transition-all group shrink-0">
                          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg">
                            <img src={`https://i.pravatar.cc/150?img=${idx + 10}`} alt={faculty.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          </div>
                          <h4 className="font-bold text-gray-900 text-lg">{faculty.name}</h4>
                          <p className="text-red-600 text-sm font-semibold mb-2">{faculty.role}</p>
                          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{faculty.exp} Experience</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "events" && (
                  <div className="animate-fade-in space-y-12">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">Upcoming Events</h2>
                      <div className="space-y-4">
                        {[
                          { date: "15 Oct", month: "2026", title: "Annual Tech Symposium", desc: "A national level technical fest for engineering students." },
                          { date: "02 Nov", month: "2026", title: "Global MBA Summit", desc: "Industry leaders gathering to discuss the future of business." },
                          { date: "20 Dec", month: "2026", title: "Winter Cultural Fest", desc: "Annual cultural festival featuring arts, music, and dance." }
                        ].map((event, idx) => (
                          <div key={idx} className="flex gap-6 bg-white border border-gray-100 p-5 rounded-3xl hover:shadow-md transition-all">
                            <div className="bg-red-50 text-red-600 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[100px] text-center shrink-0">
                              <span className="text-2xl font-black">{event.date.split(' ')[0]}</span>
                              <span className="text-xs font-bold uppercase">{event.date.split(' ')[1]}</span>
                              <span className="text-[10px] text-red-400 mt-1">{event.month}</span>
                            </div>
                            <div className="flex flex-col justify-center">
                              <h4 className="font-bold text-gray-900 text-xl mb-1">{event.title}</h4>
                              <p className="text-gray-500 text-sm">{event.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">Top Recruiters & Placement Stats</h2>
                      <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 text-white mb-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
                          <div>
                            <div className="text-3xl font-black text-green-400 mb-1">98%</div>
                            <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Placement Rate</div>
                          </div>
                          <div>
                            <div className="text-3xl font-black text-blue-400 mb-1">45 LPA</div>
                            <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Highest Package</div>
                          </div>
                          <div>
                            <div className="text-3xl font-black text-purple-400 mb-1">8.5 LPA</div>
                            <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Average Package</div>
                          </div>
                          <div>
                            <div className="text-3xl font-black text-yellow-400 mb-1">250+</div>
                            <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Visiting Companies</div>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-6 font-medium">Our students have been successfully placed in leading global corporations:</p>
                      <div className="flex flex-wrap gap-4">
                        {["Microsoft", "Google", "Amazon", "Deloitte", "TCS", "Infosys", "Wipro", "IBM", "Accenture", "Cognizant"].map((company, idx) => (
                          <div key={idx} className="bg-white border text-xl font-black text-gray-300 border-gray-100 px-6 py-4 rounded-xl flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:text-gray-900 transition-all cursor-pointer">
                            {company}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "admission" && (
                  <div className="animate-fade-in">
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">Admission Procedure (2026-27)</h2>
                    <div className="relative border-l-2 border-red-100 ml-6 space-y-12">
                      {[
                        { step: "01", title: "Online Application & Registration", desc: "Fill out the online application form with personal, academic, and contact details. Pay the required application fee via our secure payment gateway." },
                        { step: "02", title: "Entrance Examination / Merit List", desc: "Appear for the university entrance exam. For merit-based courses, wait for the first cut-off list to be published on the official website." },
                        { step: "03", title: "Counseling & Interview", desc: "Shortlisted candidates will be called for a personal interview and counseling session. Bring original documents for verification." },
                        { step: "04", title: "Fee Payment & Enrollment", desc: "Pay the first semester fee to confirm your seat. Collect your enrollment number, ID card, and academic calendar." },
                      ].map((proc, idx) => (
                        <div key={idx} className="relative pl-10">
                          <div className="absolute -left-[21px] top-1 w-10 h-10 bg-white border-4 border-red-100 rounded-full flex items-center justify-center shadow-sm">
                            <span className="w-4 h-4 bg-red-500 rounded-full" />
                          </div>
                          <span className="text-red-600 font-bold text-sm tracking-wider uppercase mb-1 block">Step {proc.step}</span>
                          <h4 className="text-xl font-bold text-gray-900 mb-2">{proc.title}</h4>
                          <p className="text-gray-600 leading-relaxed">{proc.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-12 bg-red-50 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-red-100">
                      <div>
                        <h4 className="text-xl font-bold text-red-900 mb-1">Ready to Apply?</h4>
                        <p className="text-red-700/80">Applications for the Fall 2026 batch are now open.</p>
                      </div>
                      <button className="bg-red-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-red-200">
                        Start Application
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl md:text-3xl font-black text-gray-900">Student Reviews</h2>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <p className="text-2xl md:text-3xl font-black text-gray-900">{college.rating ? college.rating.toFixed(1) : "4.8"}</p>
                          <StarRating value={college.rating || 4.8} />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        { name: "Rahul Sharma", course: "B.Tech Computer Science", year: "3rd Year", rating: 5, text: "The faculty is extremely supportive and the labs are equipped with the latest technology. The campus life is vibrant with numerous clubs." },
                        { name: "Priya Patel", course: "MBA Finance", year: "Alumni (2025)", rating: 4, text: "Excellent placement support. The curriculum is highly industry-relevant. I got placed in a top MNC during campus recruitment." },
                        { name: "John Doe", course: "BBA", year: "2nd Year", rating: 5, text: "Amazing infrastructure and facilities. The library is massive. The events organized here are top-notch and provide great exposure." },
                        { name: "Aisha Khan", course: "B.Sc Medical", year: "1st Year", rating: 4, text: "Good academic environment. The professors are highly qualified. Only downside is the hostel mess food could be better." },
                      ].map((review, idx) => (
                        <div key={idx} className="bg-white border border-gray-100 p-6 rounded-3xl hover:shadow-lg transition-all h-full">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 text-lg">
                                {review.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900">{review.name}</h4>
                                <p className="text-xs text-gray-500">{review.course} • {review.year}</p>
                              </div>
                            </div>
                            <StarRating value={review.rating} />
                          </div>
                          <p className="text-gray-600 italic">"{review.text}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "faqs" && (
                  <div className="animate-fade-in">
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                      {[
                        { q: "Is the university UGC/AICTE approved?", a: "Yes, our university is fully recognized by UGC and all our technical programs are approved by AICTE." },
                        { q: "Are hostel facilities available for outstation students?", a: "Yes, we provide separate hostel facilities for boys and girls with 24/7 security, WiFi, and mess facilities." },
                        { q: "Does the college provide scholarships?", a: "We offer merit-based scholarships up to 100% tuition fee waiver for outstanding students. Need-based financial aid is also available." },
                        { q: "What is the student-to-faculty ratio?", a: "We maintain a healthy student-to-faculty ratio of 15:1 to ensure personalized attention and better learning outcomes." },
                        { q: "Is there any provision for education loans?", a: "We have tie-ups with leading nationalized and private banks to facilitate easy education loans for our students." }
                      ].map((faq, idx) => (
                        <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-6">
                          <h4 className="font-bold text-gray-900 text-lg mb-2 flex items-start gap-3">
                            <span className="text-red-500 font-black">Q.</span>
                            {faq.q}
                          </h4>
                          <p className="text-gray-600 pl-8">{faq.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "helpdesk" && (
                  <div className="animate-fade-in">
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">Help Desk & Support</h2>

                    <div className="grid md:grid-cols-5 gap-8">
                      <div className="md:col-span-3 bg-white border border-gray-100 rounded-3xl p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Send us a message</h3>
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                              <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-red-500 focus:bg-white transition-all" placeholder="John Doe" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                              <input type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-red-500 focus:bg-white transition-all" placeholder="john@example.com" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Subject / Query Type</label>
                            <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-red-500 focus:bg-white transition-all">
                              <option>Admission Enquiry</option>
                              <option>Fee Structure</option>
                              <option>Hostel Details</option>
                              <option>Placement Information</option>
                              <option>Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Your Message</label>
                            <textarea rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-red-500 focus:bg-white transition-all" placeholder="How can we help you?"></textarea>
                          </div>
                          <button type="submit" className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all">
                            Submit Request
                          </button>
                        </form>
                      </div>

                      <div className="md:col-span-2 space-y-4">
                        <div className="bg-red-50 text-red-900 rounded-3xl p-6 border border-red-100">
                          <div className="w-12 h-12 bg-white text-red-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          </div>
                          <h4 className="font-bold mb-1">Helpline Number</h4>
                          <p className="text-red-700/80 text-sm mb-2">Available Mon-Sat, 9AM to 6PM</p>
                          <p className="text-xl font-black">{college.profile.phone || "1800-123-4567"}</p>
                        </div>

                        <div className="bg-blue-50 text-blue-900 rounded-3xl p-6 border border-blue-100">
                          <div className="w-12 h-12 bg-white text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          </div>
                          <h4 className="font-bold mb-1">Email Support</h4>
                          <p className="text-blue-700/80 text-sm mb-2">Typically replies within 24 hours</p>
                          <p className="text-lg font-bold truncate">{college.profile.email || "support@university.edu"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "social" && (
                  <div className="animate-fade-in">
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">Social Winget</h2>
                    <p className="text-gray-500 mb-8">Stay updated with our latest activities on social media.</p>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Mock Instagram Feed */}
                      <div className="bg-white border border-gray-100 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm">@university_official</h4>
                              <p className="text-xs text-gray-500">Instagram</p>
                            </div>
                          </div>
                          <button className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100">Follow</button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative">
                            <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&h=200&fit=crop" className="w-full h-full object-cover" alt="Insta Post 1" />
                          </div>
                          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative">
                            <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&h=200&fit=crop" className="w-full h-full object-cover" alt="Insta Post 2" />
                          </div>
                          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative">
                            <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=200&h=200&fit=crop" className="w-full h-full object-cover" alt="Insta Post 3" />
                          </div>
                          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative">
                            <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=200&h=200&fit=crop" className="w-full h-full object-cover" alt="Insta Post 4" />
                          </div>
                          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative">
                            <img src="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=200&h=200&fit=crop" className="w-full h-full object-cover" alt="Insta Post 5" />
                          </div>
                          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative flex items-center justify-center bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors">
                            <span className="font-bold text-sm text-gray-500">More...</span>
                          </div>
                        </div>
                      </div>

                      {/* Mock X (Twitter) Feed */}
                      <div className="bg-white border border-gray-100 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" /></svg>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm">University Updates</h4>
                              <p className="text-xs text-gray-500">@uni_updates</p>
                            </div>
                          </div>
                          <button className="text-xs font-bold text-black bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200">Follow</button>
                        </div>

                        <div className="space-y-4">
                          <div className="pb-4 border-b border-gray-100">
                            <p className="text-sm text-gray-800 mb-2">Excited to announce our new state-of-the-art AI Research Lab! Applications for the winter internship program are now open. 🚀 #AI #Research #University</p>
                            <p className="text-xs text-gray-500">2 hours ago</p>
                          </div>
                          <div className="pb-4">
                            <p className="text-sm text-gray-800 mb-2">Congratulations to the Class of 2026 on your remarkable achievements. The world is yours to shape! 🎓✨</p>
                            <p className="text-xs text-gray-500">1 day ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="w-full lg:w-[320px] xl:w-[300px] shrink-0 space-y-8">

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
                  Students Joined <br /> This Month
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
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.3c-4.6 0-5.6 3.5-5.6 5.6v1.4H6.5v4.3h2.1V23.5h5.6V11.8h3.9l.67-4.34z" /></svg>
                    </a>
                  )}
                  {college.profile.twitter && (
                    <a href={college.profile.twitter} className="w-10 h-10 bg-gray-50 text-gray-400 hover:bg-black hover:text-white rounded-xl flex items-center justify-center transition-all">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" /></svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

          </aside>
        </div>
      </section>

      {/* ── FOOTER SPACING ── */}

    </div>
  );
}