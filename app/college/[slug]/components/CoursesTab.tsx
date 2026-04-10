import Image from "next/image";

interface CourseRow {
  course_name: string;
  degree_name: string | null;
  stream_name?: string | null;
  fees: string | null;
  seats?: string | null;
  courseduration: string | null;
  twelvemarks?: string | null;
  description?: string | null;
}

interface CoursesTabProps {
  courses: CourseRow[];
}

export default function CoursesTab({ courses }: CoursesTabProps) {
  // Hardcoded sub-tabs to match UI
  const subTabs = ["Undergraduate", "Postgraduate", "Phd", "Diploma", "Certificate Programs"];
  const instructors = [
    { name: "Meet Our Instructor", role: "Teacher", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400" },
    { name: "Meet Our Instructor", role: "Teacher", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400" },
    { name: "Meet Our Instructor", role: "Teacher", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400" },
    { name: "Meet Our Instructor", role: "Teacher", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400" },
  ];

  return (
    <div className="w-full bg-white pb-24">
      <div className="max-w-[1920px] mx-auto px-4 md:px-10 lg:px-12 py-12">

        {/* --- PHASE 1: SUB-TABS FILTERS - Unified Block --- */}
        <div className="mb-10 inline-flex items-center bg-white border border-neutral-200 rounded-[5px] shadow-[0_10px_60px_-15px_rgba(0,0,0,0.25)] overflow-hidden">
          {subTabs.map((tab, idx) => (
            <button
              key={idx}
              className={`px-8 py-3.5 text-xs font-black whitespace-nowrap transition-all duration-300 uppercase tracking-widest border-r border-neutral-100 last:border-r-0 ${idx === 0
                  ? 'text-[#FF3C3C]'
                  : 'bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }`}
              style={idx === 0 ? { backgroundColor: 'rgba(255, 60, 60, 0.2)' } : {}}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ─── PHASE 2: COURSES LISTING GRID ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="space-y-6">
            {courses.length > 0 ? courses.slice(0, 3).map((course, idx) => (
              <div
                key={idx}
                className="bg-white rounded-[5px] shadow-[0_10px_60px_-15px_rgba(0,0,0,0.25)] border border-neutral-100 overflow-hidden transition-all hover:border-[#FF3C3C] hover:-translate-y-1"
              >
                {/* Course Header */}
                <div className="p-8 border-b border-neutral-100 flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                      Top courses in 2025
                    </h3>
                    <h4 className="text-xl font-black text-slate-900 leading-tight mb-2 uppercase tracking-tight">
                      {course.course_name}
                    </h4>
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-[5px]">
                      {course.courseduration || "4 Years"} {course.degree_name || 'Undergraduate'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#FF3C3C] text-[14px] font-medium tracking-[0.3em] uppercase block mb-3">TEACHER</span>
                    <span className="text-lg font-black text-slate-900">
                      {course.fees ? `₹ ${course.fees}` : '₹ 1,35,000'} <span className="text-xs text-slate-400">/ annual</span>
                    </span>
                  </div>
                </div>

                {/* Course Footer Info */}
                <div className="px-8 py-4 bg-slate-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-rounded text-[#FF3C3C] text-xl">verified</span>
                    <span className="text-sm font-black text-slate-600">Placement – {idx === 0 ? '85%' : '80%'}</span>
                  </div>
                  <button className="px-10 py-3 bg-[#FF3C3C] text-white font-black text-xs uppercase tracking-widest rounded-[5px] transition-all hover:bg-slate-900 shadow-lg shadow-red-500/20 active:scale-95">
                    Apply Now
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-slate-400 py-20 text-center font-bold">No courses available for this selection.</div>
            )}

            <div className="pt-4">
              <button className="px-12 py-3 bg-slate-900 text-white font-black text-sm uppercase tracking-widest rounded-[5px] shadow-[0_10px_60px_-15px_rgba(0,0,0,0.25)] transition-all hover:bg-[#FF3C3C] hover:shadow-red-500/20">
                View All Courses
              </button>
            </div>
          </div>

          {/* Right side placeholder or decorative element to match 2-column layout in design */}
          <div className="hidden lg:block">
            <div className="relative h-full min-h-[500px] w-full bg-slate-100 rounded-[5px] overflow-hidden shadow-inner flex items-center justify-center border-2 border-dashed border-slate-200">
              <span className="material-symbols-rounded text-6xl text-slate-300">school</span>
            </div>
          </div>
        </div>

        {/* --- PHASE 3: INSTRUCTORS SECTION --- */}
        <div className="bg-slate-500 rounded-[5px] overflow-hidden p-12 lg:p-20 relative shadow-[0_10px_60px_-15px_rgba(0,0,0,0.25)]">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-16 relative z-10">
            <div>
              <div className="flex items-center gap-3 text-white/70 text-xs font-black uppercase tracking-[0.3em] mb-4">
                <span className="w-10 h-[2px] bg-[#FF3C3C]" />
                TEACHER
              </div>
              <h3 className="font-bold leading-tight tracking-tight whitespace-nowrap" style={{ fontSize: '45px', color: 'rgba(255, 255, 255, 1)' }}>
                Meet Our Instructor
              </h3>
            </div>
            <button className="px-12 py-3 bg-[#FF3C3C] text-white font-black text-sm uppercase tracking-widest rounded-[5px] shadow-[0_10px_60px_-15px_rgba(0,0,0,0.25)] transition-all hover:bg-white hover:text-slate-900 active:scale-95">
              View All
            </button>
          </div>

          {/* Background Decorative Pattern */}
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>

          {/* Instructor Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {instructors.map((inst, idx) => (
              <div key={idx} className="bg-white rounded-[5px] overflow-hidden flex flex-col group relative shadow-[0_10px_60px_-15px_rgba(0,0,0,0.25)] transition-all duration-500 hover:-translate-y-3">
                <div className="h-[320px] relative bg-slate-100 overflow-hidden">
                  {/* Design's Header Pattern */}
                  <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-yellow-400 to-amber-600 opacity-90 transition-all duration-500 group-hover:h-full group-hover:opacity-100 z-0" />

                  {/* Avatar */}
                  <div className="relative w-full h-full flex items-end justify-center z-10 p-4">
                    <div className="relative w-full h-[85%] rounded-[5px] overflow-hidden shadow-2xl group-hover:scale-110 transition-transform duration-700">
                      <Image
                        src={inst.image}
                        alt={inst.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Share/Action Button */}
                  <button className="absolute bottom-6 right-6 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl border-2 border-white/20 transition-all hover:bg-[#FF3C3C] hover:rotate-12 active:scale-90 z-20">
                    <span className="material-symbols-rounded text-xl font-black">share</span>
                  </button>
                </div>

                <div className="p-8 text-left bg-white border-t border-neutral-50 relative z-20">
                  <h5 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-[#FF3C3C] transition-colors">{inst.name}</h5>
                  <span className="text-xs text-[#FF3C3C] font-medium uppercase tracking-widest">{inst.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
