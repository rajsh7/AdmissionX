import Image from "next/image";

interface Stat {
  label: string;
  value: string;
}

interface AboutTabProps {
  collegeName: string;
  slug: string;
  location: string;
  stats: Stat[];
  mosaicImages: string[];
  aboutPara1: string;
  aboutPara2: string;
  missionText: string;
  visionText: string;
  descriptionText: string;
  paragraphs: string[];
}

export default function AboutTab({
  collegeName,
  slug,
  location,
  stats,
  mosaicImages,
  aboutPara1,
  aboutPara2,
  missionText,
  visionText,
  descriptionText,
  paragraphs,
}: AboutTabProps) {
  return (
    <div className="w-full bg-white">
      {/* ─── PHASE 1: SUB-HERO STATS BANNER ─── */}
      <section className="relative w-full overflow-hidden">
        {/* Background with Darkened Image */}
        <div className="absolute inset-0 z-0 h-[450px]">
          <Image 
            src={mosaicImages[0]} 
            alt="University Background" 
            fill 
            className="object-cover blur-[2px]" 
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
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

            {/* Stat Cards Grid (4 Columns) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-5xl animate-in fade-in slide-in-from-bottom duration-700 delay-200">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white rounded-xl p-6 lg:p-8 flex flex-col items-start shadow-xl border border-neutral-100 transition-transform hover:scale-[1.02]">
                  <span className="text-2xl lg:text-3xl font-black text-slate-900 leading-none">{stat.value}</span>
                  <span className="text-xs lg:text-sm text-slate-500 font-bold mt-2 uppercase tracking-wide">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Action Grid Buttons */}
            <div className="flex flex-wrap gap-4 mt-4 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
              <a 
                href={`/college/${slug}/admission-procedure`} 
                className="px-10 py-4 bg-[#FF3C3C] text-white font-black text-sm uppercase tracking-widest rounded-md shadow-lg shadow-red-500/20 transition-all hover:scale-105 active:scale-95"
              >
                Apply Now
              </a>
              <button className="px-10 py-4 border-2 border-white/40 text-white font-black text-sm uppercase tracking-widest rounded-md backdrop-blur-md transition-all hover:bg-white hover:text-slate-900 shadow-xl">
                Download Brochure
              </button>
              <button className="px-10 py-4 border-2 border-white/40 text-white font-black text-sm uppercase tracking-widest rounded-md backdrop-blur-md transition-all hover:bg-white hover:text-slate-900 shadow-xl">
                Compare
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PHASE 2: ABOUT US MOSAIC SECTION ─── */}
      <section className="bg-white py-24">
        <div className="max-w-[1920px] mx-auto px-8 lg:px-12 xl:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
            
            {/* Left: Image Mosaic */}
            <div className="lg:col-span-6 relative">
              {/* Abstract decorative element (teal star from design) */}
              <div className="absolute -top-12 -left-12 z-0 opacity-80 hidden xl:block">
                <svg width="240" height="240" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0,50 L50,0 L100,20 L80,100 Z" fill="#2DD4BF" className="animate-pulse" />
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="flex flex-col gap-4 pt-16">
                  <div className="relative rounded-2xl overflow-hidden h-[450px] shadow-2xl border-4 border-white">
                    <Image src={mosaicImages[1]} alt="Academic Life" fill className="object-cover" />
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="relative rounded-2xl overflow-hidden h-[260px] shadow-2xl border-4 border-white">
                    <Image src={mosaicImages[0]} alt="Campus Building" fill className="object-cover" />
                  </div>
                  <div className="relative rounded-2xl overflow-hidden h-[260px] shadow-2xl border-4 border-white">
                    <Image src={mosaicImages[2]} alt="Modern Library" fill className="object-cover" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div className="lg:col-span-6">
              <span className="text-[#FF3C3C] text-sm font-black tracking-[0.3em] uppercase block mb-4">ABOUT US</span>
              <h3 className="text-4xl lg:text-6xl font-black text-slate-900 leading-[1.05] mb-8">
                Benefit From Our Online <br />
                Learning Expertise Earn <br />
                <span className="text-[#FF3C3C]">Professional</span>
              </h3>
              
              <div className="space-y-6 mb-12">
                <p className="text-lg leading-relaxed text-slate-600 font-medium">{aboutPara1}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 mb-3 uppercase tracking-widest border-l-4 border-[#FF3C3C] pl-4">Our Mission</h4>
                    <p className="text-sm text-slate-500 leading-safe">{missionText}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 mb-3 uppercase tracking-widest border-l-4 border-[#FF3C3C] pl-4">Our Vision</h4>
                    <p className="text-sm text-slate-500 leading-safe">{visionText}</p>
                  </div>
                </div>
              </div>

              <a 
                href={`/college/${slug}/admission-procedure`} 
                className="inline-flex items-center gap-4 px-10 py-5 bg-[#FF3C3C] text-white rounded-lg font-black text-sm uppercase tracking-widest transition-all hover:bg-slate-900 hover:shadow-2xl active:scale-95 group"
              >
                Admission
                <span className="material-symbols-rounded transition-transform group-hover:translate-x-2">trending_flat</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PHASE 3: DETAILED ARTICLE SECTION ─── */}
      <section className="bg-neutral-50/50 py-24 border-t border-neutral-100">
        <div className="max-w-[1920px] mx-auto px-8 lg:px-12 xl:px-20">
          <div className="max-w-5xl">
            <h3 className="text-4xl font-black text-slate-900 mb-10 tracking-tight leading-none">
              About {collegeName}
            </h3>
            <div className="space-y-8">
              {paragraphs.length > 0 ? (
                paragraphs.map((para, idx) => (
                  <p key={idx} className="text-lg lg:text-xl leading-relaxed text-slate-600 font-medium">
                    {para}
                  </p>
                ))
              ) : (
                <p className="text-lg lg:text-xl leading-relaxed text-slate-600 font-medium">
                  {descriptionText}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
