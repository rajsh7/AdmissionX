import Image from "next/image";

interface PlacementsTabProps {
  collegeName: string;
  location: string;
  placementRatio?: string;
  avgPackage?: string;
  highPackage?: string;
  recruitersCount?: string;
  mosaicImage?: string;
}

export default function PlacementsTab({
  collegeName,
  location,
  placementRatio = "98%",
  avgPackage = "8.2 LPA",
  highPackage = "45 LPA",
  recruitersCount = "1,200+",
  mosaicImage
}: PlacementsTabProps) {
  
  const topRecruiters = [
    { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
    { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" },
    { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
    { name: "IBM", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" },
    { name: "Adobe", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Adobe_Corporate_logo.svg" },
    { name: "Deloitte", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Deloitte.svg" },
    { name: "Accenture", logo: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg" },
    { name: "Infosys", logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg" },
    { name: "TCS", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg" },
    { name: "Cognizant", logo: "https://upload.wikimedia.org/wikipedia/commons/4/43/Cognizant_logo_2022.svg" }
  ];

  return (
    <div className="w-full bg-white pb-24">
      {/* ─── PHASE 1: PLACEMENT STATS BANNER ─── */}
      <section className="relative w-full overflow-hidden">
        {/* Background with Darkened Image */}
        <div className="absolute inset-0 z-0 h-[450px]">
          {mosaicImage && (
            <Image 
              src={mosaicImage} 
              alt="Placement Context" 
              fill 
              className="object-cover blur-[2px]" 
            />
          )}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10 max-w-[1920px] mx-auto px-8 lg:px-12 xl:px-20 py-16 lg:py-24">
          <div className="flex flex-col gap-10">
            {/* Title & Location */}
            <div className="animate-in fade-in slide-in-from-left duration-700">
              <h2 className="text-3xl lg:text-5xl font-black text-white leading-tight">
                India&apos;s biggest university,<br />
                <span className="text-[#FF3C3C]">{collegeName}</span>
              </h2>
              <div className="mt-4 flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm self-start px-4 py-2 rounded-full border border-white/10">
                <span className="material-symbols-rounded text-white text-xl">location_on</span>
                <span className="text-sm font-bold text-white/90 uppercase tracking-widest">{location}</span>
              </div>
            </div>

            {/* Placement Stats Grid (4 Columns) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-5xl animate-in fade-in slide-in-from-bottom duration-700 delay-200">
              <div className="bg-white rounded-xl p-6 lg:p-8 flex flex-col items-start shadow-2xl border border-neutral-100 transition-transform hover:scale-[1.02]">
                <span className="text-2xl lg:text-3xl font-black text-slate-900 leading-none">{placementRatio}</span>
                <span className="text-xs lg:text-sm text-slate-500 font-bold mt-2 uppercase tracking-wide">Placement Ratio</span>
              </div>
              <div className="bg-white rounded-xl p-6 lg:p-8 flex flex-col items-start shadow-2xl border border-neutral-100 transition-transform hover:scale-[1.02]">
                <span className="text-2xl lg:text-3xl font-black text-slate-900 leading-none">{avgPackage}</span>
                <span className="text-xs lg:text-sm text-slate-500 font-bold mt-2 uppercase tracking-wide">Average Package</span>
              </div>
              <div className="bg-white rounded-xl p-6 lg:p-8 flex flex-col items-start shadow-2xl border border-neutral-100 transition-transform hover:scale-[1.02]">
                <span className="text-2xl lg:text-3xl font-black text-slate-900 leading-none">{highPackage}</span>
                <span className="text-xs lg:text-sm text-slate-500 font-bold mt-2 uppercase tracking-wide">Highest Package</span>
              </div>
              <div className="bg-white rounded-xl p-6 lg:p-8 flex flex-col items-start shadow-2xl border border-neutral-100 transition-transform hover:scale-[1.02]">
                <span className="text-2xl lg:text-3xl font-black text-slate-900 leading-none">{recruitersCount}</span>
                <span className="text-xs lg:text-sm text-slate-500 font-bold mt-2 uppercase tracking-wide">Recruiters</span>
              </div>
            </div>
            
            <div className="mt-4">
              <button className="px-10 py-4 bg-[#FF3C3C] text-white font-black text-sm uppercase tracking-widest rounded-md shadow-lg shadow-red-500/20 transition-all hover:scale-105 active:scale-95">
                Download Placement Report 2025
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PHASE 2: TOP RECRUITERS GRID ─── */}
      <section className="py-24">
        <div className="max-w-[1920px] mx-auto px-8 lg:px-12 xl:px-20">
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="border-b border-neutral-50 px-10 py-8 flex justify-between items-center text-slate-900">
              <h3 className="text-2xl lg:text-3xl font-black tracking-tight">Top Recruiters 2025</h3>
              <div className="h-1 lg:w-32 bg-[#FF3C3C] rounded-full hidden sm:block" />
            </div>
            
            <div className="p-10 lg:p-16">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {topRecruiters.map((recruiter, idx) => (
                  <div key={idx} className="group border border-neutral-50 rounded-2xl flex flex-col items-center justify-center p-8 transition-all duration-300 hover:border-[#FF3C3C]/30 hover:shadow-xl hover:shadow-[#FF3C3C]/5 h-32 lg:h-40 relative">
                    <div className="relative w-full h-12 lg:h-16 flex items-center justify-center grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-110">
                      <Image 
                        src={recruiter.logo} 
                        alt={recruiter.name} 
                        fill 
                        className="object-contain" 
                        unoptimized
                      />
                    </div>
                    {/* Tooltip or Label on Hover */}
                    <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-[10px] font-black text-[#FF3C3C] uppercase tracking-widest">{recruiter.name}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Decorative Footer */}
              <div className="mt-16 pt-10 border-t border-neutral-50 flex flex-col md:flex-row justify-between items-center gap-8">
                <p className="text-slate-500 font-bold text-sm">Join the 10,000+ graduates placed at top Fortune 500 companies.</p>
                <button className="px-8 py-3 rounded-full bg-slate-900 text-white font-black text-xs uppercase tracking-widest transition-all hover:bg-[#FF3C3C]">
                  View All Companies
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
