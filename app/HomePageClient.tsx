"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import FieldsOfStudy from "./components/FieldsOfStudy";
import TopUniversities from "./components/TopUniversities";
import TopCourse from "./components/TopCourse";
import StatsBar from "./components/StatsBar";
import CareerGuidance from "./components/CareerGuidance";
import Testimonials from "./components/Testimonials";
import ContactSection from "./components/ContactSection";
import HomeTicker from "./components/HomeTicker";
import type { FilterCollegeResult } from "@/lib/college-filter";
import type { AdItem } from "./components/AdsSection";
import type { TickerAdItem } from "./components/HomeTicker";
import type { University } from "./components/TopUniversities";
import type { DbBlog } from "./api/home/latest-blogs/route";
import type { DbExam } from "./api/home/exams/route";
import type { HomeStat } from "./api/home/stats/route";
import type { HomepageTestimonial } from "./components/Testimonials";

// Heavy below-the-fold components — lazy loaded after first paint
const NewsSection  = dynamic(() => import("./components/NewsSection"),  { ssr: true });
const Footer       = dynamic(() => import("./components/Footer"),       { ssr: true });
// AuthModal is client-only (uses portals/browser APIs) — rendered after mount only
const AuthModal    = dynamic(() => import("./components/AuthModal"),    { ssr: false });

interface HomePageClientProps {
  universities: University[];
  dbBlogs: DbBlog[];
  dbExams: DbExam[];
  stats: HomeStat[];
  streamCounts: Record<string, number>;
  initialStreamColleges: FilterCollegeResult[];
  ads: AdItem[];
  partnerAds: AdItem[];
  featuredAds: AdItem[];
  tickerAds: TickerAdItem[];
  testimonials: HomepageTestimonial[];
}

export default function HomePageClient({
  universities,
  dbBlogs,
  dbExams,
  stats,
  streamCounts,
  initialStreamColleges,
  ads,
  partnerAds,
  featuredAds,
  tickerAds,
  testimonials,
}: HomePageClientProps) {
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  // Only render AuthModal after hydration to avoid SSR mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const closeModal  = () => setAuthModal(null);
  const switchMode  = (mode: "login" | "register") => setAuthModal(mode);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-primary selection:text-white">
      {/* AuthModal — only after hydration, never on server */}
      {mounted && authModal && (
        <AuthModal mode={authModal} onClose={closeModal} onSwitchMode={switchMode} />
      )}

      <Header />

      <main>
        <HeroSection />

        <div data-gsap="fade-up">
          <StatsBar ads={ads} />
        </div>

        <div data-gsap="fade-up">
          <TopUniversities
            universities={universities}
            initialStreamColleges={initialStreamColleges}
            ads={ads}
            partnerAds={partnerAds}
            featuredAds={featuredAds}
            tickerAds={tickerAds}
          />
        </div>

        <HomeTicker ads={tickerAds} />

        <div data-gsap="fade-up">
          <TopCourse />
        </div>

        <div data-gsap="fade-up">
          <CareerGuidance />
        </div>

        <div data-gsap="fade-up">
          <FieldsOfStudy />
        </div>

        <div data-gsap="fade-up">
          <NewsSection dbBlogs={dbBlogs} />
        </div>

        <div data-gsap="fade-up">
          <Testimonials testimonials={testimonials} />
        </div>

        <div data-gsap="fade-up">
          <ContactSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
