import Image from "next/image";
import Link from "next/link";
import ExploreCards from "@/app/components/ExploreCards";

interface Stat { label: string; value: string; }

interface AboutTabProps {
  collegeName: string;
  slug: string;
  location: string;
  stats: Stat[];
  mosaicImages: string[];
  mosaic1?: string | null;
  mosaic2?: string | null;
  mosaic3?: string | null;
  mosaic4?: string | null;
  bannerimage?: string | null;
  aboutPara1: string;
  aboutPara2: string;
  missionText: string;
  visionText: string;
  descriptionText: string;
  paragraphs: string[];
}

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw) return "";
  const base = "https://admin.admissionx.in/uploads/";
  if (typeof raw === "string" && (raw.startsWith("http") || raw.startsWith("/")))
    return raw;
  return `${base}${raw}`;
}

export default function AboutTab({
  collegeName, slug, location, stats, mosaicImages,
  mosaic1, mosaic2, mosaic3, mosaic4, bannerimage,
  aboutPara1, aboutPara2, missionText, visionText, descriptionText, paragraphs,
}: AboutTabProps) {
  return (
    <div className="w-full bg-white pt-4 pb-6">
      <div className="w-full px-4 md:px-10 lg:px-12 mx-auto max-w-[1920px]">
        {/* -- STATS BANNER — Card Style --------------------------------------- */}
        <section className="relative w-full overflow-hidden rounded-[5px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-black" style={{ minHeight: 489 }}>
          {/* Solid Black Background */}
          <div className="absolute inset-0 z-0 bg-black" />

          <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 py-8 md:py-10 flex flex-col justify-center min-h-[489px]">
            <div className="max-w-full flex flex-col gap-5">
              <div>
                <h2 className="text-[42px] font-bold text-white leading-tight mb-2">
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
                  <div key={idx} className="bg-white rounded-[5px] px-6 py-5 flex flex-col w-[280px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 transition-transform hover:-translate-y-1">
                    <span className="text-[28px] font-bold leading-none" style={{ color: 'rgba(62,62,62,1)' }}>{stat.value}</span>
                    <span className="text-[20px] font-semibold mt-2 leading-tight" style={{ color: 'rgba(62,62,62,1)' }}>{stat.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 mt-2">
                <a href={`/college/${slug}/admission-procedure`}
                  className="px-8 py-3 bg-[#FF3C3C] text-white font-bold text-[18px] rounded-[5px] shadow-lg shadow-red-500/20 hover:bg-red-700 transition-colors text-center min-w-[200px]">
                  Apply Now
                </a>
                <button className="px-8 py-3 bg-[#FF3C3C66] hover:bg-[#FF3C3C]/60 backdrop-blur-sm text-white font-bold text-[18px] rounded-[5px] transition-colors flex items-center justify-center gap-2 min-w-[200px]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Brochure
                </button>
                <Link
                  href={`/compare?colleges=${slug}`}
                  className="px-8 py-3 bg-[#FF3C3C66] hover:bg-[#FF3C3C]/80 backdrop-blur-sm text-white font-bold text-[18px] rounded-[5px] transition-colors flex items-center justify-center gap-2 min-w-[200px]"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Compare
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* -- ABOUT US MOSAIC — Card Style ----------------------------------- */}
      <section className="w-full px-4 md:px-10 lg:px-12 mx-auto max-w-[1920px] pt-6 md:pt-10 pb-10 md:pb-14">
        <div className="bg-white shadow-[0_8px_20px_-16px_rgba(0,0,0,0.12)] border border-gray-200 rounded-[5px] w-full p-6 md:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left: Image Mosaic */}
            <div className="relative pt-12">
              {/* Green Sparkle Icon */}
              <div className="absolute top-0 -left-1 z-20 w-32 h-32 pointer-events-none">
                <Image src="/images/f21f0c4442ff56d9c6a16bbb7039cd521e7f02b5.png" alt="" fill className="object-contain" unoptimized />
              </div>

              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="relative">
                  <div className="relative top-16 rounded-[5px] overflow-hidden" style={{ height: 516 }}>
                    <Image src={mosaic2 ? buildImageUrl(mosaic2) : mosaicImages[1]} alt={collegeName} fill className="object-cover" unoptimized />
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="relative rounded-[5px] overflow-hidden flex-1" style={{ height: 250 }}>
                    <Image src={mosaic3 ? buildImageUrl(mosaic3) : mosaicImages[0]} alt="Campus Building" fill className="object-cover" unoptimized />
                  </div>
                  <div className="relative rounded-[5px] overflow-hidden flex-1" style={{ height: 250 }}>
                    <Image src={mosaic4 ? buildImageUrl(mosaic4) : mosaicImages[2]} alt="Modern Library" fill className="object-cover" unoptimized />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div>
              <span className="text-[#FF3C3C] text-[24px] font-bold tracking-[0.3em] uppercase block mb-3">ABOUT US</span>
              <h3 className="text-[45px] font-bold leading-[1.15] mb-5" style={{ color: "#0E2A46" }}>
                Benefit From Our Online<br />
                Learning Expertise Earn<br />
                <span className="text-[#FF3C3C]">Professional</span>
              </h3>
              <p className="text-[17px] font-normal leading-relaxed mb-7" style={{ color: "#333931" }}>{aboutPara1}</p>
              <div className="grid grid-cols-2 gap-5 mb-8">
                <div>
                  <h4 className="text-[17px] font-bold text-slate-900 mb-2 uppercase tracking-widest border-l-4 border-[#FF3C3C] pl-3">Our Mission</h4>
                  <p className="text-[17px] font-normal leading-relaxed pl-3" style={{ color: "#333931" }}>{missionText}</p>
                </div>
                <div>
                  <h4 className="text-[17px] font-bold text-slate-900 mb-2 uppercase tracking-widest border-l-4 border-[#FF3C3C] pl-3">Our Vision</h4>
                  <p className="text-[17px] font-normal leading-relaxed pl-3" style={{ color: "#333931" }}>{visionText}</p>
                </div>
              </div>
              <a href={`/college/${slug}/admission-procedure`}
                className="inline-flex items-center gap-3 px-7 py-3 bg-[#D40C11] text-white rounded-[5px] font-bold text-sm uppercase tracking-widest hover:bg-red-700 transition-colors group">
                Apply
                <svg className="w-10 h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 60 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M56 8l4 4m0 0l-4 4m4-4H0" />
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
                  <p key={idx} className="text-[17px] font-normal leading-relaxed" style={{ color: "#333931" }}>{para}</p>
                ))
              ) : (
                  <p className="text-[17px] font-normal leading-relaxed" style={{ color: "#333931" }}>
                    {descriptionText || `${collegeName} is a premier educational institution dedicated to academic excellence.`}
                  </p>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Explore Cards */}
      <section className="w-full px-4 md:px-10 lg:px-12 mx-auto max-w-[1920px] pb-10">
        <ExploreCards />
      </section>

    </div>
  );
}
