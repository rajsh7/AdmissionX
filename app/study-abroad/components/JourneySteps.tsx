"use client";

import React from "react";

const steps = [
  {
    number: "1",
    title: "Profile Evaluation",
    description: "We assess your academic background, test scores, and career goals to find the best match.",
  },
  {
    number: "2",
    title: "Shortlisting",
    description: "Select from over 500+ universities and courses that align perfectly with your profile and budget.",
  },
  {
    number: "3",
    title: "Application & Visas",
    description: "Expert assistance with SOPs, LORs, and navigating the visa process smoothly.",
  },
  {
    number: "4",
    title: "Pre-Departure",
    description: "Help with accommodation, flights, forex, and networking with other students.",
  },
];

export default function JourneySteps() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1920px] mx-auto px-8 lg:px-12">
        
        <div className="mb-20">
          <h2 className="text-[40px] font-bold text-slate-800 mb-4 tracking-tight text-center lg:text-left">Your Journey to Study Abroad</h2>
          <p className="text-[17px] text-slate-400 max-w-2xl leading-relaxed text-center lg:text-left">
            Explore the most popular countries for international student based on quality of education, post study work right, and living standards.
          </p>
        </div>

        {/* Stepper Grid Container */}
        <div className="max-w-full mx-auto mb-20 px-4">
          
          <div className="relative">
            {/* Background Line */}
            <div className="absolute top-[36px] left-[12.5%] right-[12.5%] h-[2px] bg-slate-100 -z-10" />
            
            {/* Red Active Line Segment (from step 1 to 2) */}
            <div className="absolute top-[36px] left-[12.5%] w-[25%] h-[2px] bg-[#FF3C3C] -z-10" />

            <div className="grid grid-cols-4 gap-8">
              
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center space-y-8">
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
              <div className="flex flex-col items-center text-center space-y-8">
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
              <div className="flex flex-col items-center text-center space-y-8">
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
              <div className="flex flex-col items-center text-center space-y-8">
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

        {/* Large Placeholder Box */}
        <div className="w-full h-[320px] bg-[#EAEAEA] rounded-[5px] border border-slate-100/50" />

      </div>
    </section>
  );
}
