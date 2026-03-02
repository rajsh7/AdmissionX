"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const heroImages = [
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2670&auto=format&fit=crop", // Oxford/classic architecture
  "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=2670&auto=format&fit=crop", // Modern university library
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2670&auto=format&fit=crop", // Students walking on campus
  "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2686&auto=format&fit=crop"  // Graduation caps/celebration
];

export default function HeroSection() {
  const router = useRouter();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [location, setLocation] = useState("");
  const [degree, setDegree] = useState("");
  const [course, setCourse] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % heroImages.length);
    }, 4000); // 4 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (degree) params.set("degree", degree);
    if (course) params.set("course", course);
    router.push(`/colleges?${params.toString()}`);
  };

  const handleStartRegistration = () => {
    router.push("/register");
  };

  return (
    <section className="relative w-full">
      {/* Hero Banner */}
      <div className="bg-slate-900 relative min-h-[85vh] flex flex-col justify-center items-center text-center p-8 lg:p-16">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-slate-900/30 z-10" />
          {heroImages.map((img, idx) => (
            <div
              key={img}
              className={`absolute inset-0 h-full w-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                idx === currentImageIdx ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundImage: `url('${img}')` }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl flex flex-col items-center gap-6">
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find Your Dream College
          </h1>
          <p className="text-lg text-slate-200 sm:text-xl font-light max-w-2xl">
            Discover top universities and courses that match your career goals.
            Explore over 500+ institutes worldwide.
          </p>
          <div className="mt-4 flex flex-col w-full max-w-sm sm:max-w-md gap-3">
            <button
              onClick={handleStartRegistration}
              className="h-12 w-full rounded-xl bg-primary px-8 text-base font-bold text-white shadow-xl hover:bg-primary-dark hover:scale-[1.02] transition-all duration-200"
              style={{ boxShadow: "0 8px 25px rgba(19,91,236,0.3)" }}
            >
              Start Registration
            </button>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Free for students
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar Floating Card */}
      <div className="relative z-20 -mt-10 px-6">
        <div className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/10 sm:p-6">
          <div className="grid gap-4 md:grid-cols-4 items-end">
            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Location
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">
                  location_on
                </span>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-3 pl-10 pr-8 text-sm font-medium text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select State</option>
                  <option value="california">California</option>
                  <option value="new-york">New York</option>
                  <option value="texas">Texas</option>
                  <option value="massachusetts">Massachusetts</option>
                  <option value="uk">United Kingdom</option>
                  <option value="singapore">Singapore</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 material-symbols-outlined text-[20px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Degree */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Degree
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">
                  school
                </span>
                <select
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-3 pl-10 pr-8 text-sm font-medium text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select Degree</option>
                  <option value="bachelors">Bachelors</option>
                  <option value="masters">Masters</option>
                  <option value="phd">PhD</option>
                  <option value="diploma">Diploma</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 material-symbols-outlined text-[20px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Course */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Course Interest
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">
                  menu_book
                </span>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-3 pl-10 pr-8 text-sm font-medium text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">All Courses</option>
                  <option value="cs">Computer Science</option>
                  <option value="business">Business Admin</option>
                  <option value="medicine">Medicine</option>
                  <option value="engineering">Engineering</option>
                  <option value="law">Law</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 material-symbols-outlined text-[20px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="flex h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-primary px-4 text-sm font-bold text-white hover:bg-slate-800 dark:hover:bg-primary-dark transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              Search Colleges
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
