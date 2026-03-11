"use client";

import { useEffect, useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Header from "../../components/Header";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200";

interface CourseDetails {
  id: number;
  name: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  degree: string;
  functionalArea: string;
  details: {
    fees: string | number;
    seats: number;
    duration: string;
    eligibility: string;
    otherInfo: string;
  };
  college: {
    id: number;
    name: string;
    slug: string;
    image: string;
    location: string;
  } | null;
  otherColleges: Array<{
    id: number;
    name: string;
    slug: string;
    image: string;
    location: string;
  }>;
}

export default function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!courseId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/courses/${courseId}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load course details");
        }
        setCourse(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header onLoginClick={() => {}} onRegisterClick={() => {}} />
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full"
          />
          <p className="mt-4 text-gray-500 font-medium">Loading Course Experience...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header onLoginClick={() => {}} onRegisterClick={() => {}} />
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="p-8 bg-red-50 rounded-[2rem] border border-red-100 text-center max-w-md">
            <h1 className="text-2xl font-black text-gray-900 mb-2">Wait, something's missing</h1>
            <p className="text-gray-600 mb-6">{error || "Course data could not be retrieved."}</p>
            <Link href="/courses" className="inline-block bg-red-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-red-600 transition shadow-lg shadow-red-200">
              Browse All Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20">
      <Header onLoginClick={() => {}} onRegisterClick={() => {}} />

      {/* HERO SECTION */}
      <section className="relative h-[60vh] min-h-[500px] flex items-end overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img 
            src={course.image || FALLBACK_IMAGE} 
            alt={course.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDFDFD] via-black/40 to-transparent" />
        </motion.div>

        <div className="relative px-15 pb-16 w-full">
          <div className="lg:w-2/3">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-3 mb-6"
            >
              <span className="bg-red-500 text-white text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-red-500/30">
                {course.degree}
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider border border-white/30">
                {course.functionalArea}
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1]"
            >
              {course.name}
            </motion.h1>

            {course.college && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 text-white/90"
              >
                <div className="w-12 h-12 rounded-xl border-2 border-white/50 overflow-hidden shrink-0">
                  <img src={course.college.image} alt={course.college.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/60">Primary Offering By</p>
                  <Link href={`/colleges/${course.college.slug || course.college.id}`} className="font-black text-xl hover:text-red-400 transition">
                    {course.college.name}
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* CONTENT GRID */}
      <section className="px-15 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* MAIN CONTENT */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* OVERVIEW */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100"
            >
              <h2 className="text-3xl font-black text-gray-900 mb-6">Course Overview</h2>
              <div className="prose prose-lg text-gray-600 max-w-none leading-relaxed">
                {course.description || course.title || "No description available for this course yet. Please contact the admissions office for a detailed prospectus."}
              </div>
              
              {course.details.eligibility && (
                <div className="mt-10 p-6 bg-red-50/50 rounded-3xl border border-red-100/50">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">🎓</span> Eligibility Criteria
                  </h3>
                  <p className="text-gray-600 italic">
                    {course.details.eligibility}
                  </p>
                </div>
              )}
            </motion.div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Duration", value: course.details.duration || "N/A", icon: "⏱️" },
                { label: "Est. Fees", value: course.details.fees ? `₹${course.details.fees.toLocaleString()}` : "Contact Office", icon: "💰" },
                { label: "Available Seats", value: course.details.seats || "Variable", icon: "💺" },
                { label: "Admission", value: "Open", icon: "📝" },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-3xl border border-gray-100 text-center hover:shadow-lg transition-all"
                >
                  <span className="text-2xl mb-3 block">{stat.icon}</span>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-sm font-black text-gray-900">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* OTHER COLLEGES (SIMILAR) */}
            {course.otherColleges.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-black text-gray-900 px-2">Other Colleges Offering This Course</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {course.otherColleges.map((col, idx) => (
                    <motion.div
                      key={col.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      viewport={{ once: true }}
                      className="group bg-white p-4 rounded-3xl border border-gray-100 flex gap-4 hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                      <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                        <img src={col.image} alt={col.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="font-bold text-gray-900 text-lg line-clamp-1 mb-1">{col.name}</h4>
                        <p className="text-gray-400 text-xs mb-3 flex items-center gap-1">
                          📍 {col.location}
                        </p>
                        <Link href={`/colleges/${col.slug || col.id}`} className="text-red-500 text-xs font-black uppercase tracking-widest hover:text-red-600">
                          View College →
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2.5rem] p-10 text-white shadow-2xl sticky top-8">
              <h3 className="text-3xl font-black mb-6 leading-tight">Secure Your Spot Today</h3>
              <ul className="space-y-4 mb-10 text-gray-400">
                <li className="flex items-center gap-3">
                  <span className="text-green-500 font-bold">✓</span> Direct Admission Channel
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500 font-bold">✓</span> Scholarship Guidance
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500 font-bold">✓</span> Career Counseling Included
                </li>
              </ul>
              
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-2xl transition shadow-xl shadow-red-900/40 mb-4">
                Apply for Admission
              </button>
              <button className="w-full bg-white/10 hover:bg-white/20 text-white font-black py-5 rounded-2xl transition border border-white/20">
                Download Brochure
              </button>
              
              <div className="mt-10 pt-10 border-t border-white/10 text-center">
                <p className="text-xs text-gray-500 font-bold tracking-widest uppercase mb-2">Speak to a Counselor</p>
                <p className="text-xl font-black">+91 91523 03758</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
