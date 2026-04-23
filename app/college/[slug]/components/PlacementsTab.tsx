import Image from "next/image";
import ExploreCards from "@/app/components/ExploreCards";

interface PlacementsTabProps {
  collegeName: string;
  location: string;
  placementRatio?: string;
  avgPackage?: string;
  highPackage?: string;
  lowPackage?: string;
  recruitersCount?: string;
  placementInfo?: string | null;
  hasData?: boolean;
  mosaicImage?: string;
}

const TOP_RECRUITERS = [
  { name: "Google",    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
  { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" },
  { name: "Amazon",    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
  { name: "IBM",       logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" },
  { name: "Adobe",     logo: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Adobe_Corporate_logo.svg" },
  { name: "Deloitte",  logo: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Deloitte.svg" },
  { name: "Accenture", logo: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg" },
  { name: "Infosys",   logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg" },
  { name: "TCS",       logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg" },
  { name: "Cognizant", logo: "https://upload.wikimedia.org/wikipedia/commons/4/43/Cognizant_logo_2022.svg" },
];

export default function PlacementsTab({
  collegeName,
  location,
  placementRatio = "—",
  avgPackage = "—",
  highPackage = "—",
  lowPackage = "—",
  recruitersCount = "—",
  placementInfo,
  hasData = false,
  mosaicImage,
}: PlacementsTabProps) {

  const stats = [
    { label: "Placement Ratio",  value: placementRatio, icon: "verified",        color: "text-emerald-600" },
    { label: "Average Package",  value: avgPackage,     icon: "trending_up",     color: "text-blue-600"    },
    { label: "Highest Package",  value: highPackage,    icon: "workspace_premium",color: "text-amber-600"  },
    { label: "Lowest Package",   value: lowPackage,     icon: "trending_down",   color: "text-slate-600"   },
    { label: "Recruiters",       value: recruitersCount,icon: "business",        color: "text-purple-600"  },
  ];

  return (
    <div className="w-full bg-white pt-10 pb-24">
      <div className="w-full px-4 md:px-10 lg:px-12 mx-auto max-w-[1920px]">

        {/* Hero card with banner bg */}
        <div className="bg-white rounded-[5px] shadow-sm overflow-hidden border border-neutral-100 mt-8 relative">
          {/* Background */}
          <div className="absolute inset-0 z-0">
            {mosaicImage && (
              <Image src={mosaicImage} alt="Placement Background" fill className="object-cover" priority unoptimized />
            )}
            <div className="absolute inset-0 bg-black/75" />
          </div>

          <div className="relative z-10 px-4 sm:px-6 md:px-10 lg:px-12 py-8 sm:py-12 lg:py-16">
            {/* Title */}
            <span className="text-[#FF3C3C] text-[16px] sm:text-[20px] font-bold tracking-[0.3em] uppercase block mb-3">Placements</span>
            <h2 className="text-[24px] sm:text-[32px] md:text-[45px] font-bold leading-tight text-white mb-3">
              {collegeName}
            </h2>
            <div className="flex items-center gap-2 mb-6 sm:mb-8">
              <span className="material-symbols-rounded text-white text-xl">location_on</span>
              <span className="text-sm font-bold text-white/80 uppercase tracking-widest">{location}</span>
            </div>

            {/* Stats grid — 2 cols on mobile, 3 on sm, 5 on lg */}
            {hasData ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 max-w-5xl">
                {stats.map((s) => (
                  <div key={s.label} className="bg-white rounded-[5px] p-4 sm:p-5 flex flex-col shadow-xl border border-neutral-100 hover:-translate-y-1 transition-transform">
                    <span className={`material-symbols-rounded text-[18px] sm:text-[22px] mb-2 ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {s.icon}
                    </span>
                    <span className="text-[18px] sm:text-[22px] lg:text-[24px] font-black text-slate-800 leading-none">{s.value}</span>
                    <span className="text-[11px] sm:text-[13px] font-semibold text-slate-500 mt-1.5 leading-tight">{s.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/10 border border-white/20 rounded-[5px] px-4 sm:px-6 py-4 sm:py-5 max-w-lg">
                <p className="text-white/70 text-sm font-semibold">
                  Placement data for {collegeName} will be updated soon. Contact the college for the latest placement statistics.
                </p>
              </div>
            )}

            {/* Placement info */}
            {placementInfo && (
              <div className="mt-5 sm:mt-6 bg-white/10 border border-white/20 rounded-[5px] px-4 sm:px-6 py-3 sm:py-4 max-w-3xl">
                <p className="text-white/80 text-sm leading-relaxed">{placementInfo}</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Recruiters */}
        <div className="mt-6 sm:mt-10 bg-white rounded-[5px] shadow-sm border border-neutral-100 p-5 sm:p-8 lg:p-12">
          <div className="flex items-center justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-neutral-100">
            <div>
              <h3 className="text-[22px] sm:text-[28px] lg:text-[32px] font-bold text-slate-900">Top Recruiters</h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">Companies that regularly hire from this institution</p>
            </div>
            <div className="h-1 w-16 sm:w-24 bg-[#FF3C3C] rounded-full hidden sm:block" />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-6">
            {TOP_RECRUITERS.map((r, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-[5px] flex flex-col items-center justify-center p-3 sm:p-6 border border-neutral-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all h-20 sm:h-28 relative"
              >
                <div className="relative w-full h-8 sm:h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Image src={r.logo} alt={r.name} fill className="object-contain" unoptimized />
                </div>
                <span className="absolute bottom-2 text-[9px] sm:text-[10px] font-black text-[#FF3C3C] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  {r.name}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 sm:mt-10 pt-4 sm:pt-6 border-t border-neutral-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-slate-500 font-semibold text-xs sm:text-sm">
              Join thousands of graduates placed at top companies worldwide.
            </p>
            <a
              href={`/apply`}
              className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-[5px] bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-[#FF3C3C] transition-colors whitespace-nowrap"
            >
              Apply Now
            </a>
          </div>
        </div>
      </div>

      {/* Explore Cards */}
      <div className="w-full px-4 md:px-10 lg:px-12 mx-auto max-w-[1920px] pt-8 pb-10">
        <ExploreCards />
      </div>
    </div>
  );
}
