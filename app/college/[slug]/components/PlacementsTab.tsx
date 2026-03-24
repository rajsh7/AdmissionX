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
    { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
    { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
    { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
    { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" },
    { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
    { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
    { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" }
  ];

  return (
    <div className="w-full">
      <section className="max-w-7xl mx-auto px-4 sm:px-12 py-8 mt-2">
        <div 
          className="rounded-xl overflow-hidden shadow-2xl relative"
          style={{ backgroundColor: "#1a1f24" }}
        >
          {/* Background Image Setup */}
          <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
             {mosaicImage && (
                <Image 
                   src={mosaicImage} 
                   alt="Background" 
                   fill 
                   className="object-cover blur-sm" 
                />
             )}
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

            {/* Stats Row */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg">
               <div className="bg-white rounded-lg p-4 flex flex-col justify-center items-start shadow-md">
                 <span className="text-xl font-black text-black">{placementRatio}</span>
                 <span className="text-[11px] text-gray-600 font-bold uppercase tracking-wider mt-1">Placement ratio</span>
               </div>
               <div className="bg-white rounded-lg p-4 flex flex-col justify-center items-start shadow-md">
                 <span className="text-xl font-black text-black">{avgPackage}</span>
                 <span className="text-[11px] text-gray-600 font-bold uppercase tracking-wider mt-1">Average Package</span>
               </div>
               <div className="bg-white rounded-lg p-4 flex flex-col justify-center items-start shadow-md">
                 <span className="text-xl font-black text-black">{highPackage}</span>
                 <span className="text-[11px] text-gray-600 font-bold uppercase tracking-wider mt-1">Highest Package</span>
               </div>
               <div className="bg-white rounded-lg p-4 flex flex-col justify-center items-start shadow-md">
                 <span className="text-xl font-black text-black">{recruitersCount}</span>
                 <span className="text-[11px] text-gray-600 font-bold uppercase tracking-wider mt-1">Recruiters</span>
               </div>
            </div>

            {/* Top Recruiters Area */}
            <div className="mt-10 bg-white rounded-lg overflow-hidden shadow-lg">
               <div className="border-b border-gray-200 px-6 py-4">
                 <h3 className="text-gray-900 font-extrabold text-base">Top Recruiters 2025</h3>
               </div>
               <div className="p-6 sm:p-8">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                     {topRecruiters.map((recruiter, idx) => (
                       <div key={idx} className="border border-gray-100 rounded flex items-center justify-center p-4 hover:border-gray-300 transition-colors h-20">
                          <div className="relative w-full h-8 flex items-center justify-center">
                            <Image 
                              src={recruiter.logo} 
                              alt={recruiter.name} 
                              fill 
                              className="object-contain" 
                              unoptimized
                            />
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
