import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import CounsellingPageClient from "./CounsellingPageClient";

export const metadata: Metadata = {
  title: "Counselling — Find Your Course & College | AdmissionX",
  description:
    "Match your interests and goals to courses and colleges in minutes. Free AI-assisted counselling and expert guidance on AdmissionX.",
};

export default function CounsellingPage() {
  return (
    <div className="min-h-screen bg-[#F4F4F5]">
      <Header />

      <div className="relative z-10">
        <div className="w-full max-w-none px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-10 pt-6">
          <nav className="w-full flex items-center gap-2 text-xs text-neutral-500 font-medium">
            <Link href="/" className="hover:text-neutral-800 transition-colors">
              Home
            </Link>
            <span className="material-symbols-outlined text-[14px] text-neutral-400">chevron_right</span>
            <span className="text-neutral-600">Counselling</span>
          </nav>
        </div>

        <CounsellingPageClient />
        <Footer />
      </div>
    </div>
  );
}
