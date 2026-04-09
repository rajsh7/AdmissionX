import Image from "next/image";

interface Stat { label: string; value: string; }

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
  collegeName, slug, location, stats, mosaicImages,
  aboutPara1, missionText, visionText, descriptionText, paragraphs,
}: AboutTabProps) {
  return (
    <div className="w-full bg-white">

      {/* -- STATS BANNER — full bleed --------------------------------------- */}
      <section className="relative w-full overflow-hidden bg-[#1a1a2e]" style={{ minHeight: 300 }}>
        {/* Campus image fades in from right */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-1/2 z-0">
          <Image src={mosaicImages[0]} alt={collegeName} fill className="object-cover" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e] via-[#1a1a2e]/85 to-transparent" />
        </div>

        <div className="relative z-10 w-full px-6 md:px-12 lg:px-16 py-10 md:py-14">
          <div className="max-w-2xl flex flex-col gap-5">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">
                Indian&apos;s biggest university,<br />
                <span className="text-[#FF3C3C]">{collegeName}</span>
              </h2>
              <div className="flex items-center gap-1.5 text-white/70 text-xs font-semibold mt-2">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span className="uppercase tracking-widest">{location}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 md:p-4 flex flex-col shadow-md">
                  <span className="text-lg md:text-xl font-black text-slate-900 leading-none">{stat.value}</span>
                  <span className="text-[10px] text-slate-500 font-semibold mt-1 uppercase tracking-wide leading-tight">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <a href={`/college/${slug}/admission-procedure`}
                className="px-6 py-2.5 bg-[#FF3C3C] text-white font-bold text-sm rounded-md shadow-lg shadow-red-500/20 hover:bg-red-700 transition-colors">
                Apply Now
              </a>
              <button className="px-6 py-2.5 border border-white/30 text-white font-bold text-sm rounded-md hover:bg-white/10 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Brochure
              </button>
              <button className="px-6 py-2.5 border border-white/30 text-white font-bold text-sm rounded-md hover:bg-white/10 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Compare
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* -- ABOUT US MOSAIC — full bleed ----------------------------------- */}
      <section className="bg-white py-14 md:py-20 w-full">
        <div className="w-full px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left: Image Mosaic */}
            <div className="relative">
              <div className="absolute -top-6 -left-6 z-0 hidden lg:block" aria-hidden="true">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                  <path d="M0,50 L50,0 L100,20 L80,100 Z" fill="#05CEB5" opacity="0.9" />
                </svg>
              </div>
              <div className="grid grid-cols-2 gap-3 relative z-10">
                <div className="pt-8">
                  <div className="relative rounded-xl overflow-hidden shadow-xl" style={{ height: 380 }}>
                    <Image src={mosaicImages[1]} alt="Campus Life" fill className="object-cover" unoptimized />
                    <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded">Academic Life</div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="relative rounded-xl overflow-hidden shadow-xl" style={{ height: 183 }}>
                    <Image src={mosaicImages[0]} alt="Campus Building" fill className="object-cover" unoptimized />
                    <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded">Campus Building</div>
                  </div>
                  <div className="relative rounded-xl overflow-hidden shadow-xl" style={{ height: 183 }}>
                    <Image src={mosaicImages[2]} alt="Modern Library" fill className="object-cover" unoptimized />
                    <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded">Modern Library</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div>
              <span className="text-[#FF3C3C] text-[11px] font-black tracking-[0.3em] uppercase block mb-3">ABOUT US</span>
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 leading-[1.15] mb-5">
                Benefit From Our Online<br />
                Learning Expertise Earn<br />
                <span className="text-[#FF3C3C]">Professional</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-7">{aboutPara1}</p>
              <div className="grid grid-cols-2 gap-5 mb-8">
                <div>
                  <h4 className="text-[11px] font-black text-slate-900 mb-2 uppercase tracking-widest border-l-4 border-[#FF3C3C] pl-3">Our Mission</h4>
                  <p className="text-xs text-slate-500 leading-relaxed pl-3">{missionText}</p>
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-slate-900 mb-2 uppercase tracking-widest border-l-4 border-[#FF3C3C] pl-3">Our Vision</h4>
                  <p className="text-xs text-slate-500 leading-relaxed pl-3">{visionText}</p>
                </div>
              </div>
              <a href={`/college/${slug}/admission-procedure`}
                className="inline-flex items-center gap-3 px-7 py-3 bg-[#FF3C3C] text-white rounded-md font-bold text-sm uppercase tracking-widest hover:bg-red-700 transition-colors group">
                Admission
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* -- ABOUT ARTICLE — full bleed ------------------------------------- */}
      <section className="bg-white border-t border-neutral-100 py-12 md:py-16 w-full">
        <div className="w-full px-6 md:px-12 lg:px-16">
          <div className="max-w-4xl">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-5">About {collegeName}</h3>
            <div className="space-y-4">
              {paragraphs.length > 0 ? (
                paragraphs.map((para, idx) => (
                  <p key={idx} className="text-base leading-relaxed text-slate-600">{para}</p>
                ))
              ) : (
                <p className="text-base leading-relaxed text-slate-600">
                  {descriptionText || `${collegeName} is a premier educational institution dedicated to academic excellence.`}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
