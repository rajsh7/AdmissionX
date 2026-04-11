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
    <div className="w-full bg-white pt-10 pb-24">
      {/* --- PHASE 1: UNIFIED PLACEMENTS CARD --- */}
      <div className="w-full px-4 md:px-10 lg:px-12 mx-auto max-w-[1920px]">
        <div className="bg-white rounded-[5px] shadow-[0_10px_60px_-15px_rgba(0,0,0,0.25)] overflow-hidden border border-neutral-100 mt-8 relative">
          {/* Unified Background Image & Overlay */}
          <div className="absolute inset-0 z-0">
            {mosaicImage && (
              <Image 
                src={mosaicImage} 
                alt="Placement Background" 
                fill 
                className="object-cover opacity-100" 
                priority
              />
            )}
            <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px]" />
          </div>
          
          <div className="relative z-10 w-full">
            {/* Top: Stats Header (Transparent) */}
            <section className="relative w-full overflow-hidden py-12 lg:py-16 flex flex-col justify-center">
              <div className="w-full px-6 md:px-10 lg:px-12">
                <div className="flex flex-col gap-10">
                  {/* Title & Location */}
                  <div className="animate-in fade-in slide-in-from-left duration-700">
                    <h2 className="text-[24px] font-bold leading-tight" style={{ color: 'rgba(255, 255, 255, 1)' }}>
                      India&apos;s biggest university,<br />
                      {collegeName}
                    </h2>
                    <div className="mt-4 flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm self-start px-4 py-2 rounded-[5px] border border-white/10">
                      <span className="material-symbols-rounded text-white text-xl">location_on</span>
                      <span className="text-sm font-bold text-white/90 uppercase tracking-widest">{location}</span>
                    </div>
                  </div>

                  {/* Placement Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-5xl animate-in fade-in slide-in-from-bottom duration-700 delay-200">
                    <div className="bg-white rounded-[5px] p-6 lg:p-8 flex flex-col items-start shadow-xl border border-neutral-100 transition-transform hover:-translate-y-1">
                      <span className="text-[24px] font-semibold leading-none" style={{ color: 'rgba(62, 62, 62, 1)' }}>{placementRatio}</span>
                      <span className="text-[18px] font-semibold mt-1.5 leading-tight" style={{ color: 'rgba(62, 62, 62, 1)' }}>Placement Ratio</span>
                    </div>
                    <div className="bg-white rounded-[5px] p-6 lg:p-8 flex flex-col items-start shadow-xl border border-neutral-100 transition-transform hover:-translate-y-1">
                      <span className="text-[24px] font-semibold leading-none" style={{ color: 'rgba(62, 62, 62, 1)' }}>{avgPackage}</span>
                      <span className="text-[18px] font-semibold mt-1.5 leading-tight" style={{ color: 'rgba(62, 62, 62, 1)' }}>Average Package</span>
                    </div>
                    <div className="bg-white rounded-[5px] p-6 lg:p-8 flex flex-col items-start shadow-xl border border-neutral-100 transition-transform hover:-translate-y-1">
                      <span className="text-[24px] font-semibold leading-none" style={{ color: 'rgba(62, 62, 62, 1)' }}>{highPackage}</span>
                      <span className="text-[18px] font-semibold mt-1.5 leading-tight" style={{ color: 'rgba(62, 62, 62, 1)' }}>Highest Package</span>
                    </div>
                    <div className="bg-white rounded-[5px] p-6 lg:p-8 flex flex-col items-start shadow-xl border border-neutral-100 transition-transform hover:-translate-y-1">
                      <span className="text-[24px] font-semibold leading-none" style={{ color: 'rgba(62, 62, 62, 1)' }}>{recruitersCount}</span>
                      <span className="text-[18px] font-semibold mt-1.5 leading-tight" style={{ color: 'rgba(62, 62, 62, 1)' }}>Recruiters</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <button className="px-10 py-3 bg-[#FF3C3C] text-white font-black text-sm uppercase tracking-widest rounded-[5px] shadow-lg shadow-red-500/20 transition-all hover:bg-red-700">
                      Download Placement Report 2025
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Bottom: Top Recruiters Inside Card */}
            <div className="px-6 md:px-10 lg:px-12 pb-16 lg:pb-24">
              <section className="bg-white rounded-[5px] shadow-[0_10px_60px_-15px_rgba(0,0,0,0.25)] p-10 lg:p-16 border border-neutral-100 relative z-30">
              <div className="border-b border-neutral-200 pb-8 mb-12 flex justify-between items-center text-slate-900">
                <h3 className="text-3xl lg:text-4xl font-bold tracking-tight">Top Recruiters 2025</h3>
                <div className="h-1 lg:w-32 bg-[#FF3C3C] rounded-full hidden sm:block" />
              </div>

              <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {topRecruiters.map((recruiter, idx) => (
                  <div key={idx} className="group bg-white rounded-[5px] flex flex-col items-center justify-center p-8 transition-all duration-500 shadow-[0_10px_60px_-15px_rgba(0,0,0,0.25)] hover:shadow-[0_25px_80px_-20px_rgba(0,0,0,0.3)] border border-neutral-100 h-32 lg:h-40 relative hover:-translate-y-2">
                    <div className="relative w-full h-12 lg:h-16 flex items-center justify-center transition-all duration-500 group-hover:scale-110">
                      <Image 
                        src={recruiter.logo} 
                        alt={recruiter.name} 
                        fill 
                        className="object-contain" 
                        unoptimized
                      />
                    </div>
                    <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-[10px] font-black text-[#FF3C3C] uppercase tracking-widest">{recruiter.name}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Joined Status */}
              <div className="mt-16 pt-10 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-8">
                <p className="text-slate-500 font-bold text-sm">Join the 10,000+ graduates placed at top Fortune 500 companies.</p>
                <button className="px-10 py-3 rounded-[5px] bg-slate-900 text-white font-black text-xs uppercase tracking-widest transition-all hover:bg-[#FF3C3C]">
                  View All Companies
                </button>
              </div>
              </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
