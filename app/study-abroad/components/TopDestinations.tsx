"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface DestinationCardProps {
  country: string;
  image: string;
  fees: string;
  visaSuccess: string;
  postStudyWork: string;
  feesProgress: number;
  visaProgress: number;
  workProgress: number;
}

const DestinationCard = ({
  country,
  image,
  fees,
  visaSuccess,
  postStudyWork,
  feesProgress,
  visaProgress,
  workProgress,
}: DestinationCardProps) => (
  <div className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
    <div className="relative h-[240px] overflow-hidden">
      <Image 
        src={image} 
        alt={country} 
        fill 
        className="object-cover transition-transform duration-700 group-hover:scale-110" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-6 left-6">
        <h3 className="text-3xl font-black text-white tracking-tight">{country}</h3>
      </div>
    </div>
    
    <div className="p-8">
      <div className="space-y-6">
        <div>
          <div className="flex justify-between text-sm mb-2.5">
            <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">currency_rupee</span>
              Avg. Fees
            </span>
            <span className="font-black text-slate-900">{fees}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-primary rounded-full" style={{ width: `${feesProgress}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2.5">
            <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              Visa Success
            </span>
            <span className="font-black text-slate-900">{visaSuccess}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-green-500 rounded-full" style={{ width: `${visaProgress}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2.5">
            <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">work</span>
              Post Study Work
            </span>
            <span className="font-black text-slate-900">{postStudyWork}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-blue-500 rounded-full" style={{ width: `${workProgress}%` }} />
          </div>
        </div>
      </div>

      <button className="w-full mt-10 py-4 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-[16px] font-black text-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
        Explore {country}
        <span className="material-symbols-outlined font-bold">arrow_forward</span>
      </button>
    </div>
  </div>
);

export default function TopDestinations() {
  const destinations = [
    {
      country: "United States",
      image: "https://images.unsplash.com/photo-1501446522555-304675543ec5?auto=format&fit=crop&q=80&w=800",
      fees: "$20k - $45k/yr",
      visaSuccess: "92%",
      postStudyWork: "Up to 3 Years",
      feesProgress: 65,
      visaProgress: 92,
      workProgress: 85,
    },
    {
      country: "United Kingdom",
      image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800",
      fees: "£15k - £35k/yr",
      visaSuccess: "95%",
      postStudyWork: "Up to 2 Years",
      feesProgress: 55,
      visaProgress: 95,
      workProgress: 70,
    },
    {
      country: "Canada",
      image: "https://images.unsplash.com/photo-1503614472666-60707c772ed2?auto=format&fit=crop&q=80&w=800",
      fees: "CA$15k - $35k/yr",
      visaSuccess: "88%",
      postStudyWork: "Up to 3 Years",
      feesProgress: 50,
      visaProgress: 88,
      workProgress: 90,
    },
    {
      country: "Australia",
      image: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&q=80&w=800",
      fees: "AU$20k - $45k/yr",
      visaSuccess: "90%",
      postStudyWork: "Up to 4 Years",
      feesProgress: 60,
      visaProgress: 90,
      workProgress: 95,
    },
  ];

  return (
    <section className="py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex items-end justify-between mb-20">
          <div>
            <h2 className="text-[56px] font-black text-slate-900 leading-tight mb-6 tracking-tight">Top Destination</h2>
            <p className="text-[19px] text-slate-500 max-w-3xl leading-relaxed">
              Explore the most popular countries for international students based on quality <br />
              of education, post study work right, and living standards.
            </p>
          </div>
          <Link href="/search" className="flex items-center gap-3 text-primary font-black text-xl hover:gap-5 transition-all mb-4 group">
            View All
            <span className="material-symbols-outlined font-black">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {destinations.map((dest) => (
            <DestinationCard key={dest.country} {...dest} />
          ))}
        </div>
      </div>
    </section>
  );
}
