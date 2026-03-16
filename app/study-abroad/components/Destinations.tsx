import React from "react";
import Link from "next/link";

interface CountryRow {
  id: number;
  name: string;
  pageslug: string | null;
  college_count: number;
}

interface DestinationsProps {
  countries: CountryRow[];
  getDestinationMeta: (name: string) => { flag: string; highlight: string; color: string };
}

export default function Destinations({ countries, getDestinationMeta }: DestinationsProps) {
  if (countries.length === 0) return null;

  return (
    <div id="destinations" className="py-14">
      <div className="w-full px-4 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-white mb-1">
              Popular Destinations
            </h2>
            <p className="text-neutral-300 text-sm">
              Top countries for Indian students studying abroad
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
          {countries.map((country) => {
            const meta = getDestinationMeta(country.name);
            return (
              <Link
                key={country.id}
                href={`/search?type=abroad`}
                className="group relative overflow-hidden rounded-2xl bg-neutral-900 p-5 min-h-[140px] flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 hover:shadow-xl hover:shadow-black/10"
              >
                {/* Gradient background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${meta.color} opacity-80 group-hover:opacity-90 transition-opacity`}
                />

                {/* Content */}
                <div className="relative z-10">
                  <div className="text-3xl mb-2">{meta.flag}</div>
                  <h3 className="text-base font-black text-white mb-0.5">
                    {country.name}
                  </h3>
                  <p className="text-white/60 text-xs leading-snug">
                    {meta.highlight}
                  </p>
                </div>

                {/* College count */}
                <div className="relative z-10 mt-4 flex items-center justify-between">
                  <span className="text-white/70 text-xs font-medium">
                    {Number(country.college_count)} colleges
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all">
                    arrow_forward
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
