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
    <div className="w-full">
      {/* OVERVIEW HIGHLIGHTS CARD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-12 py-8 mt-2">
        <div 
          className="rounded-xl overflow-hidden shadow-2xl relative"
          style={{ backgroundColor: "#1a1f24" }}
        >
          <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
             <Image 
                src={mosaicImages[0]} 
                alt="Background" 
                fill 
                className="object-cover blur-sm" 
             />
             <div className="absolute inset-0 bg-black/60" />
          </div>

          <div className="relative z-10 p-8 sm:p-10">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              India&apos;s biggest university,<br/>{collegeName}
            </h2>
            <div className="mt-3 flex items-center gap-2 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0 text-white">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.079 3.218-4.402 3.218-6.853a6.5 6.5 0 10-13 0c0 2.451 1.274 4.774 3.218 6.853a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-white">{location}</span>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              {stats.slice(0, 3).map((stat, idx) => (
                <div key={idx} className="bg-white rounded-lg p-5 w-40 flex flex-col items-start shadow-md">
                   <span className="text-xl font-extrabold text-black">{stat.value}</span>
                   <span className="text-xs text-gray-600 font-semibold mt-1">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
               <a href={`/college/${slug}/admission-procedure`} className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-extrabold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "#00bfa5" }}>
                  Apply Now
               </a>
               <button className="inline-flex items-center gap-2 px-6 py-3 rounded border border-white/40 text-sm font-extrabold text-white transition-colors hover:bg-white/10 backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download Brochure
               </button>
               <button className="inline-flex items-center gap-2 px-6 py-3 rounded border border-white/40 text-sm font-extrabold text-white transition-colors hover:bg-white/10 backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                  Compare
               </button>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT US CONTENT */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-12 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="relative">
              <div className="absolute -top-10 -left-6 hidden md:block">
                 <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,50 L50,0 L100,20 L80,100 Z" fill="#00bfa5" />
                 </svg>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="flex flex-col gap-4 pt-12">
                    <div className="relative rounded-lg overflow-hidden h-64 shadow-lg">
                       <Image src={mosaicImages[1]} alt="Student" fill className="object-cover" />
                    </div>
                 </div>
                 <div className="flex flex-col gap-4">
                    <div className="relative rounded-lg overflow-hidden h-48 shadow-lg">
                       <Image src={mosaicImages[0]} alt="Building" fill className="object-cover" />
                    </div>
                    <div className="relative rounded-lg overflow-hidden h-48 shadow-lg">
                       <Image src={mosaicImages[2]} alt="Campus" fill className="object-cover" />
                    </div>
                 </div>
              </div>
            </div>

            <div className="flex flex-col pt-4">
               <span className="text-xs font-extrabold tracking-widest uppercase text-teal-500 mb-2">ABOUT US</span>
               <h2 className="text-3xl font-extrabold text-blue-900 leading-tight mb-6">
                 Benefit From Our Online<br/>Learning Expertise Earn<br/>
                 <span className="text-teal-500">Professional</span>
               </h2>
               
               <p className="text-sm leading-relaxed text-gray-600 mb-4">{aboutPara1}</p>
               <p className="text-sm leading-relaxed text-gray-600 mb-8">{aboutPara2}</p>

               <div className="flex flex-col sm:flex-row gap-8 mb-8">
                  <div className="flex-1">
                     <h4 className="text-xs font-bold text-gray-900 mb-2 tracking-wide uppercase">OUR MISSION</h4>
                     <p className="text-xs text-gray-500 leading-relaxed">{missionText}</p>
                  </div>
                  <div className="flex-1">
                     <h4 className="text-xs font-bold text-gray-900 mb-2 tracking-wide uppercase">OUR VISION</h4>
                     <p className="text-xs text-gray-500 leading-relaxed">{visionText}</p>
                  </div>
               </div>

               <div>
                 <a href={`/college/${slug}/admission-procedure`} className="inline-flex items-center gap-2 px-8 py-3 rounded bg-teal-400 font-extrabold text-white text-sm hover:bg-teal-500 transition shadow-md">
                   Admission ⟶
                 </a>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* FULL DETAILS ABOUT */}
      <section className="bg-white pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-12">
           <h3 className="text-2xl font-extrabold text-gray-900 mb-6 font-serif">
              About {collegeName}
           </h3>
           <div className="space-y-4">
              {paragraphs.length > 0 ? (
                paragraphs.map((para, idx) => (
                  <p key={idx} className="text-sm leading-relaxed text-gray-600">
                    {para}
                  </p>
                ))
              ) : (
                <p className="text-sm leading-relaxed text-gray-600">
                  {descriptionText}
                </p>
              )}
           </div>
        </div>
      </section>
    </div>
  );
}
