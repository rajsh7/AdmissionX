"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface DestinationCardProps {
  href: string;
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
  href,
  country,
  image,
  fees,
  visaSuccess,
  postStudyWork,
}: Omit<DestinationCardProps, "feesProgress" | "visaProgress" | "workProgress">) => (
  <div className="bg-white rounded-[5px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
    <div className="relative h-[240px] overflow-hidden">
      <Image
        src={image}
        alt={country}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-6 left-6">
        <h3 className="text-[20px] font-semibold text-white tracking-tight">{country}</h3>
      </div>
    </div>

    <div className="p-6">
      <div className="space-y-4">
        {/* Fees */}
        <div className="flex items-center justify-between text-[14px]">
          <div className="flex items-center gap-2.5 text-[#6C6C6CBF] font-medium text-[13px]">
            <span className="material-symbols-rounded text-[20px] text-[#00000099]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
            <span>Avg. Fees</span>
          </div>
          <span className="font-medium text-[14px] text-[#5B5B5B]">{fees}</span>
        </div>

        {/* Visa Success */}
        <div className="flex items-center justify-between text-[14px]">
          <div className="flex items-center gap-2.5 text-[#6C6C6CBF] font-medium text-[13px]">
            <span className="material-symbols-rounded text-[20px] text-[#00000099]" style={{ fontVariationSettings: "'FILL' 1" }}>assignment_ind</span>
            <span>Visa Success</span>
          </div>
          <span className=" text-[#00A12B]">{visaSuccess}</span>
        </div>

        {/* Post Study Work */}
        <div className="flex items-center justify-between text-[14px]">
          <div className="flex items-center gap-2.5 text-[#6C6C6CBF] font-medium text-[13px]">
            <span className="material-symbols-rounded text-[20px] text-[#00000099]" style={{ fontVariationSettings: "'FILL' 1" }}>work</span>
            <span>Post-Study Work</span>
          </div>
          <span className="font-medium text-[14px] text-[#5B5B5B]">{postStudyWork}</span>
        </div>
      </div>

      <Link
        href={href}
        className="w-full mt-8 h-[51.8px] border border-[#FF3C3C] text-[#FF3C3C] hover:bg-[#FF3C3C] hover:text-white rounded-[5px] font-bold text-[15px] transition-all flex items-center justify-center active:scale-[0.98]"
      >
        Explore {country}
      </Link>
    </div>
  </div>
);

interface CountryOption {
  id: number;
  name: string;
}

interface TopDestinationsProps {
  countries: CountryOption[];
}

export default function TopDestinations({ countries }: TopDestinationsProps) {
  const getCountryHref = (countryName: string) => {
    const matchedCountry = countries.find(
      (country) => country.name.trim().toLowerCase() === countryName.trim().toLowerCase()
    );

    return matchedCountry
      ? `/study-abroad?country_id=${matchedCountry.id}`
      : "/study-abroad?view=all";
  };

  const destinations = [
    {
      country: "United States",
      image: "https://images.unsplash.com/photo-1501446522555-304675543ec5?auto=format&fit=crop&q=80&w=800",
      fees: "₹20L - ₹40L/yr",
      visaSuccess: "95%",
      postStudyWork: "Up to 3 years",
    },
    {
      country: "United Kingdom",
      image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800",
      fees: "₹15L - ₹35L/yr",
      visaSuccess: "95%",
      postStudyWork: "Up to 2 years",
    },
    {
      country: "Canada",
      image: "https://images.unsplash.com/photo-1503614472666-60707c772ed2?auto=format&fit=crop&q=80&w=800",
      fees: "₹12L - ₹28L/yr",
      visaSuccess: "95%",
      postStudyWork: "Up to 3 years",
    },
    {
      country: "Australia",
      image: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&q=80&w=800",
      fees: "₹18L - ₹40L/yr",
      visaSuccess: "95%",
      postStudyWork: "Up to 4 years",
    },
  ];

  return (
    <section className="pt-48 pb-32 bg-white">
      <div className="home-page-shell">

        <div className="mb-16">
          <div className="flex flex-wrap items-center justify-between gap-6 mb-4">
            <h2 className="text-[48px] font-semibold text-[#3E3E3E] leading-tight tracking-tight">Top Destination</h2>
            <Link href="/study-abroad?view=all" className="flex items-center gap-2 text-[#FF3C3C] font-bold text-[18px] group transition-all">
              View All
              <span className="material-symbols-rounded font-bold text-[22px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
          <p className="text-[20px] text-[#3E3E3EB5] font-medium max-w-2xl leading-relaxed">
            Explore the most popular countries for international student based on
            quality of education, post study work right, and living standards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {destinations.map((dest) => (
            <DestinationCard key={dest.country} href={getCountryHref(dest.country)} {...dest} />
          ))}
        </div>

      </div>
    </section>
  );
}
