import React from "react";
import Link from "next/link";

interface HeroProps {
  totalColleges: number;
  totalCountries: number;
}

export default function Hero({ totalColleges, totalCountries }: HeroProps) {
  return (
    <div className="relative overflow-hidden pt-24 pb-20">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-600 rounded-full blur-[100px] translate-y-1/2" />
      </div>

      <div className="relative z-10 w-full px-4 lg:px-8 xl:px-12 flex flex-col items-center text-center">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-7">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span className="material-symbols-outlined text-[14px]">
            chevron_right
          </span>
          <span className="text-neutral-300">Study Abroad</span>
        </nav>

        <div className="w-full max-w-4xl flex flex-col items-center">
          {/* Badge */}
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
              <span className="material-symbols-outlined text-[13px]">
                flight_takeoff
              </span>
              Study Abroad
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-5">
            Study at the World&apos;s{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">
              Best Universities
            </span>
          </h1>
          <p className="text-neutral-400 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl text-center">
            Discover top international colleges in the USA, UK, Canada,
            Australia, and more. Compare programs, fees, and admission
            requirements — all in one place.
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
            {[
              {
                icon: "public",
                label: "Countries",
                value: `${totalCountries}+`,
              },
              {
                icon: "account_balance",
                label: "Colleges",
                value: `${totalColleges}+`,
              },
              { icon: "school", label: "Programs", value: "500+" },
              {
                icon: "currency_rupee",
                label: "Scholarships",
                value: "100+",
              },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] text-red-400">
                    {stat.icon}
                  </span>
                </div>
                <div>
                  <p className="text-white font-black text-lg leading-none">
                    {stat.value}
                  </p>
                  <p className="text-neutral-500 text-xs">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/study-abroad?stream=engineering"
              className="inline-flex items-center gap-2 bg-[#FF3C3C] hover:bg-[#E63636] text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition-colors shadow-lg shadow-[#FF3C3C]/20"
            >
              <span className="material-symbols-outlined text-[18px]">
                search
              </span>
              Explore Programs
            </Link>
            <Link
              href="#destinations"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                public
              </span>
              Browse Destinations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}




