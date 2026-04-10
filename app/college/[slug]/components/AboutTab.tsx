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
    <div className="w-full bg-white pt-4 pb-6">
      <div className="w-full px-4 md:px-10 lg:px-12 mx-auto max-w-[1920px]">
        {/* -- STATS BANNER — Card Style --------------------------------------- */}
        <section className="relative w-full overflow-hidden rounded-[5px] shadow-[0_10px_60px_-15px_rgba(0,0,0,0.25)]" style={{ minHeight: 280 }}>
          {/* Campus Image background */}
          <div className="absolute inset-0 z-0 bg-[#2b2b2b]">
            <Image src={mosaicImages[0]} alt={collegeName} fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          </div>

          <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 py-8 md:py-10 flex flex-col justify-center min-h-[280px]">
            <div className="max-w-2xl flex flex-col gap-5">
              <div>
                <h2 className="text-[24px] font-bold text-white leading-tight mb-2">
                  Indian&apos;s biggest university,<br />
                  <span className="text-white">{collegeName}</span>
                </h2>
                <div className="flex items-center gap-1.5 text-white mt-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span className="text-[20px] font-semibold">{location}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-2">
                {stats.map((stat, idx) => (
                  <div key={idx} className="bg-white rounded-[5px] px-5 py-4 flex flex-col w-[209px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-white/20 transition-transform hover:-translate-y-1">
                    <span className="text-[24px] font-semibold leading-none" style={{ color: 'rgba(62,62,62,1)' }}>{stat.value}</span>
                    <span className="text-[18px] font-semibold mt-1.5 leading-tight" style={{ color: 'rgba(62,62,62,1)' }}>{stat.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 mt-2">
                <a href={`/college/${slug}/admission-procedure`}
                  className="px-10 py-3 bg-[#FF3C3C] text-white font-bold text-sm rounded-[5px] shadow-lg shadow-red-500/20 hover:bg-red-700 transition-colors">
                  Apply Now
                </a>
                <button className="px-10 py-3 bg-[#8b4545]/60 hover:bg-[#8b4545]/80 backdrop-blur-md border border-white/20 text-white font-bold text-sm rounded-[5px] transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Brochure
                </button>
                <button className="px-10 py-3 bg-[#8b4545]/60 hover:bg-[#8b4545]/80 backdrop-blur-md border border-white/20 text-white font-bold text-sm rounded-[5px] transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Compare
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* -- ABOUT US MOSAIC — Card Style ----------------------------------- */}
      <section className="w-full px-4 md:px-10 lg:px-12 mx-auto max-w-[1920px] pt-6 md:pt-10 pb-10 md:pb-14">
        <div className="bg-white shadow-[0_10px_60px_-15px_rgba(0,0,0,0.25)] border border-gray-200 rounded-[5px] w-full p-6 md:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left: Image Mosaic */}
            <div className="relative">
              <div className="absolute -top-6 -left-6 z-0 hidden lg:block" aria-hidden="true">

              </div>
              <div className="grid grid-cols-2 gap-3 relative z-10">
                <div className="pt-16 relative">
                  {/* Overlay badge image on top */}
                  <div className="absolute -top-2 left-0 z-20 w-20 h-20 rounded-[5px] overflow-hidden shadow-2xl border-2 border-white">
                    <Image src="/images/f21f0c4442ff56d9c6a16bbb7039cd521e7f02b5.png" alt="Badge" fill className="object-cover" unoptimized />
                  </div>
                  <div className="relative rounded-[5px] overflow-hidden shadow-xl" style={{ height: 600 }}>
                    <Image src={mosaicImages[1]} alt="Campus Life" fill className="object-cover" unoptimized />
                    <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-[5px]">Academic Life</div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="relative rounded-[5px] overflow-hidden shadow-xl" style={{ height: 294 }}>
                    <Image src={mosaicImages[0]} alt="Campus Building" fill className="object-cover" unoptimized />
                    <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-[5px]">Campus Building</div>
                  </div>
                  <div className="relative rounded-[5px] overflow-hidden shadow-xl" style={{ height: 294 }}>
                    <Image src={mosaicImages[2]} alt="Modern Library" fill className="object-cover" unoptimized />
                    <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-[5px]">Modern Library</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div>
              <span className="text-[#FF3C3C] text-[14px] font-black tracking-[0.3em] uppercase block mb-3">ABOUT US</span>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-[1.15] mb-5">
                Benefit From Our Online<br />
                Learning Expertise Earn<br />
                <span className="text-[#FF3C3C]">Professional</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-7">{aboutPara1}</p>
              <div className="grid grid-cols-2 gap-5 mb-8">
                <div>
                  <h4 className="text-[14px] font-black text-slate-900 mb-2 uppercase tracking-widest border-l-4 border-[#FF3C3C] pl-3">Our Mission</h4>
                  <p className="text-xs text-slate-500 leading-relaxed pl-3">{missionText}</p>
                </div>
                <div>
                  <h4 className="text-[14px] font-black text-slate-900 mb-2 uppercase tracking-widest border-l-4 border-[#FF3C3C] pl-3">Our Vision</h4>
                  <p className="text-xs text-slate-500 leading-relaxed pl-3">{visionText}</p>
                </div>
              </div>
              <a href={`/college/${slug}/admission-procedure`}
                className="inline-flex items-center gap-3 px-7 py-3 bg-[#FF3C3C] text-white rounded-[5px] font-bold text-sm uppercase tracking-widest hover:bg-red-700 transition-colors group">
                Admission
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>

          {/* -- ABOUT ARTICLE — Inside Card ------------------------------------- */}
          <div className="mt-12 pt-12 border-t border-neutral-100 w-full">
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5">About {collegeName}</h3>
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
