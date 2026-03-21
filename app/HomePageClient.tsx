"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import FieldsOfStudy from "./components/FieldsOfStudy";
import TopUniversities from "./components/TopUniversities";
import TopCourse from "./components/TopCourse";

// Below-the-fold components loaded lazily – they won't block the first paint
const EntranceExams = dynamic(() => import("./components/EntranceExams"), {
  ssr: true,
});
const NewsSection = dynamic(() => import("./components/NewsSection"), {
  ssr: true,
});
import ContactSection from "./components/ContactSection";

const Footer = dynamic(() => import("./components/Footer"), { ssr: true });

// AuthModal is rarely shown – load it only when needed
const AuthModal = dynamic(() => import("./components/AuthModal"), {
  ssr: false,
});

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
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);

  const closeModal = () => setAuthModal(null);
  const switchMode = (mode: "login" | "register") => setAuthModal(mode);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-teal selection:text-white">
      {/* Auth Modal – only rendered when user clicks login */}
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

