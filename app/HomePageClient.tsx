"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
const Header = dynamic(() => import("./components/Header"), { ssr: false });
import HeroSection from "./components/HeroSection";
import FieldsOfStudy from "./components/FieldsOfStudy";
import TopUniversities from "./components/TopUniversities";
import TopCourse from "./components/TopCourse";
import type { FilterCollegeResult } from "@/lib/college-filter";
import type { AdItem } from "./components/AdsSection";
import HomeTicker from "./components/HomeTicker";
import type { TickerAdItem } from "./components/HomeTicker";

const EntranceExams = dynamic(() => import("./components/EntranceExams"), { ssr: true });
const NewsSection = dynamic(() => import("./components/NewsSection"), { ssr: true });
import ContactSection from "./components/ContactSection";
import StatsBar from "./components/StatsBar";
import CareerGuidance from "./components/CareerGuidance";
import Testimonials from "./components/Testimonials";

const Footer = dynamic(() => import("./components/Footer"), { ssr: true });
const AuthModal = dynamic(() => import("./components/AuthModal"), { ssr: false });

import type { University } from "./components/TopUniversities";
import type { DbBlog } from "./api/home/latest-blogs/route";
import type { DbExam } from "./api/home/exams/route";
import type { HomeStat } from "./api/home/stats/route";

interface HomePageClientProps {
  universities: University[];
  dbBlogs: DbBlog[];
  dbExams: DbExam[];
  stats: HomeStat[];
  streamCounts: Record<string, number>;
  initialStreamColleges: FilterCollegeResult[];
  ads: AdItem[];
  tickerAds: TickerAdItem[];
  testimonials: any[];
}

export default function HomePageClient({
  universities,
  dbBlogs,
  dbExams,
  stats,
  streamCounts,
  initialStreamColleges,
  ads,
  tickerAds,
  testimonials,
}: HomePageClientProps) {
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);

  const closeModal = () => setAuthModal(null);
  const switchMode = (mode: "login" | "register") => setAuthModal(mode);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-primary selection:text-white">
      {authModal && (
        <AuthModal mode={authModal} onClose={closeModal} onSwitchMode={switchMode} />
      )}

      <Header />

      <main>
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Stats Bar */}
        <div data-gsap="fade-up">
          <StatsBar />
        </div>

        {/* Divider */}
        <hr className="border-t border-slate-200" />

        {/* 3. Discover the Top Universities */}
        <div data-gsap="fade-up">
          <TopUniversities
            universities={universities}
            initialStreamColleges={initialStreamColleges}
            ads={tickerAds}
          />
        </div>

        {/* 3b. Ticker Ad Strip */}
        <HomeTicker ads={tickerAds} />

        {/* 4. Discover the Top Course */}
        <div data-gsap="fade-up">
          <TopCourse />
        </div>

        <hr className="border-t border-slate-200" />

        {/* 5. Career Guidance */}
        <div data-gsap="fade-up">
          <CareerGuidance />
        </div>

        {/* 6. Article Grid */}
        <div data-gsap="fade-up">
          <FieldsOfStudy />
        </div>

        <hr className="border-t border-slate-200" />

        {/* 7. Student Life & Beyond (Blogs) */}
        <div data-gsap="fade-up">
          <NewsSection dbBlogs={dbBlogs} />
        </div>

        <hr className="border-t border-slate-200" />

        {/* 8. Unfiltered Student Voices */}
        <div data-gsap="fade-up">
          <Testimonials testimonials={testimonials} />
        </div>

        {/* 9. Get in Touch */}
        <div data-gsap="fade-up">
          <ContactSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
