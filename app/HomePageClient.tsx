"use client";

import { useState, useEffect } from "react";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import FieldsOfStudy from "./components/FieldsOfStudy";
import TopUniversities from "./components/TopUniversities";
import TopCourse from "./components/TopCourse";
import EntranceExams from "./components/EntranceExams";
import NewsSection from "./components/NewsSection";
import ContactSection from "./components/ContactSection";
import AuthModal from "./components/AuthModal";
import Footer from "./components/Footer";

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
}

export default function HomePageClient({
  universities,
  dbBlogs,
  dbExams,
  stats,
  streamCounts,
}: HomePageClientProps) {
  const [mounted, setMounted] = useState(false);
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeModal = () => setAuthModal(null);
  const switchMode = (mode: "login" | "register") => setAuthModal(mode);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-teal selection:text-white">
      {/* Auth Modal */}
      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={closeModal}
          onSwitchMode={switchMode}
        />
      )}

      {/* Floating Header */}
      <Header />

      <main>
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Top Categories (Fields of Study) */}
        <FieldsOfStudy />

        {/* 3. Discover the Top Universities */}
        <TopUniversities universities={universities} />

        {/* 4. Discover the Top Course */}
        <TopCourse />

        {/* 5. Recent coming exams */}
        <EntranceExams dbExams={dbExams} />

        {/* 6. Student Life & Beyond (News/Blogs) */}
        <NewsSection dbBlogs={dbBlogs} />

        {/* 7. Get in Touch Section */}
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
