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
    <section className="py-32 bg-white border-t border-slate-50">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="mb-24">
          <h2 className="text-[56px] font-black text-slate-900 mb-6 tracking-tight">Your Journey to Study Abroad</h2>
          <p className="text-[19px] text-slate-500 max-w-3xl leading-relaxed">
            Explore the most popular countries for international students based on quality of education, post study work right, and living standards.
          </p>
        </div>

        {/* Timeline Desktop */}
        <div className="relative">
          {/* Connector Line */}
          <div className="absolute top-12 left-0 w-full h-[3px] bg-red-100 hidden md:block" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-16 relative z-10">
            {steps.map((step) => (
              <div key={step.number} className="group">
                <div className="w-24 h-24 bg-primary text-white rounded-[24px] flex items-center justify-center text-4xl font-black mb-10 shadow-2xl shadow-primary/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  {step.number}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-5 tracking-tight group-hover:text-primary transition-colors">{step.title}</h3>
                <p className="text-lg text-slate-400 leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
