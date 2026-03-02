"use client";

import { useState, useEffect } from "react";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import FieldsOfStudy from "./components/FieldsOfStudy";
import TopUniversities from "./components/TopUniversities";
import StudyAbroad from "./components/StudyAbroad";
import TrendingDegrees from "./components/TrendingDegrees";
import EntranceExams from "./components/EntranceExams";
import NewsSection from "./components/NewsSection";
import CallToAction from "./components/CallToAction";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";

import { University } from "./components/TopUniversities";

interface HomePageClientProps {
  universities: University[];
}

export default function HomePageClient({ universities }: HomePageClientProps) {
  const [isDark, setIsDark] = useState(false);
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("admissionx-dark");
    if (stored === "true") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const openLogin = () => setAuthModal("login");
  const openRegister = () => setAuthModal("register");
  const closeModal = () => setAuthModal(null);
  const switchMode = (mode: "login" | "register") => setAuthModal(mode);

  return (
    <div className={`min-h-screen bg-background-dark text-white ${isDark ? "dark" : ""}`}>
      {/* Auth Modal */}
      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={closeModal}
          onSwitchMode={switchMode}
        />
      )}

      {/* Floating Header */}
      <Header onLoginClick={openLogin} onRegisterClick={openRegister} />

      {/* Story Flow */}
      <main>
        {/* Prologue: The Dream */}
        <HeroSection />

        {/* Chapter 1: Explore Your Passion */}
        <FieldsOfStudy />

        {/* Chapter 2: Discover Universities */}
        <TopUniversities universities={universities} />

        {/* Chapter 3: Go Global */}
        <StudyAbroad />

        {/* Chapter 4: Choose Your Path */}
        <TrendingDegrees />

        {/* Chapter 5: Prepare for Exams */}
        <EntranceExams />

        {/* Chapter 6: Stay Informed */}
        <NewsSection />

        {/* Epilogue: Your Story Starts Now */}
        <CallToAction />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
