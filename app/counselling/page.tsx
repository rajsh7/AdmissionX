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

      <div className="relative z-10 pt-[100px] lg:pt-[104px]">

        <CounsellingPageClient />
        <Footer />
      </div>
    </div>
  );
}
