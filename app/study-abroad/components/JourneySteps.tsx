"use client";

import AdCard from "@/app/components/AdCard";
import type { AdItem } from "@/app/components/AdsSection";

interface JourneyStepsProps {
  ads?: AdItem[];
}

export default function JourneySteps({ ads = [] }: JourneyStepsProps) {
  return (
    <section className="py-24 bg-white">
      <div className="home-page-shell">
        
        <div className="mb-20">
          <h2 className="text-[32px] font-semibold text-[#3E3E3E] mb-4 tracking-tight text-center lg:text-left">Your Journey to Study Abroad</h2>
          <p className="text-[16px] text-[#6C6C6C] font-medium max-w-2xl leading-relaxed text-center lg:text-left">
            Explore the most popular countries for international student based on quality of education, post study work right, and living standards.
          </p>
        </div>

        {/* Stepper Grid Container */}
        <div className="max-w-full mx-auto mb-20 px-4">
          
          <div className="relative">
            {/* Progress connector line — half red (completed), half grey (remaining) */}
            <div
              className="absolute top-[36px] z-0"
              style={{
                left: "12.5%",
                right: "12.5%",
                height: "2px",
                background: "linear-gradient(to right, #FF3C3C 0%, #FF3C3C 33.33%, #e2e8f0 33.33%, #e2e8f0 100%)",
              }}
            />

            <div className="grid grid-cols-4 gap-8">
              
              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                <div className="w-[72px] h-[72px] bg-[#FF3C3C] rounded-[5px] flex items-center justify-center text-white text-[24px] font-bold shadow-xl shadow-red-500/20">
                  1
                </div>
                <div className="space-y-4 px-4">
                  <h3 className="text-[18px] font-bold text-slate-800">Profile Evaluation</h3>
                  <p className="text-[14px] text-slate-400 leading-relaxed max-w-[200px]">
                    We assess your academic background, test scores, and career goals to find the best match.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                <div className="w-[72px] h-[72px] bg-white border border-slate-100 rounded-[5px] flex items-center justify-center text-slate-300 text-[24px] font-bold shadow-sm">
                  2
                </div>
                <div className="space-y-4 px-4">
                  <h3 className="text-[18px] font-bold text-slate-800">Shortlisting</h3>
                  <p className="text-[14px] text-slate-400 leading-relaxed max-w-[200px]">
                    Get a curated list of universities and courses that align perfectly with your profile and budget.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                <div className="w-[72px] h-[72px] bg-white border border-slate-100 rounded-[5px] flex items-center justify-center text-slate-300 text-[24px] font-bold shadow-sm">
                  3
                </div>
                <div className="space-y-4 px-4">
                  <h3 className="text-[18px] font-bold text-slate-800">Application & Visas</h3>
                  <p className="text-[14px] text-slate-400 leading-relaxed max-w-[200px]">
                    Expert assistance with SOPs, LORs, and navigating the visa process smoothly.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                <div className="w-[72px] h-[72px] bg-white border border-slate-100 rounded-[5px] flex items-center justify-center text-slate-300 text-[24px] font-bold shadow-sm">
                  4
                </div>
                <div className="space-y-4 px-4">
                  <h3 className="text-[18px] font-bold text-slate-800">Pr-Departure</h3>
                  <p className="text-[14px] text-slate-400 leading-relaxed max-w-[200px]">
                    Help with accommodation, flights, forex, and networking with others student
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

        <div className="rounded-[5px] border border-slate-100/50 bg-[#EAEAEA] p-4 sm:p-5">
          <AdCard
            ads={ads}
            className="h-[320px] sm:h-[340px]"
            emptyTitle="No active study abroad ads found"
            emptyDescription="Add or activate ads with the position study_abroad, study-abroad, or study abroad to show them here."
          />
        </div>

      </div>
    </section>
  );
}
