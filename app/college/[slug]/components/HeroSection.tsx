import Image from "next/image";

interface HeroSectionProps {
  coverImage: string;
  collegeName: string;
  logoUrl?: string | null;
}

export default function HeroSection({ coverImage, collegeName, logoUrl }: HeroSectionProps) {
  return (
    <section className="relative w-full h-[500px] lg:h-[650px] overflow-hidden">
      {/* Background Image with optimized loading */}
      <div className="absolute inset-0 z-0">
        <Image
          src={coverImage}
          alt={`${collegeName} Campus`}
          fill
          priority
          unoptimized
          className="object-cover scale-105"
        />
        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Floating Content Container */}
      <div className="relative z-10 h-full max-w-[1920px] mx-auto px-8 lg:px-12 flex flex-col justify-end pb-24">
        <div className="flex flex-col items-start gap-8 max-w-4xl">

          {/* Glassmorphism Badge */}
          <div className="backdrop-blur-md bg-[#FF3C3C]/40 inline-flex items-center gap-6 px-8 py-5 rounded-[12px] shadow-2xl border border-white/20">
            {/* White Logo Container */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full overflow-hidden p-2 flex-shrink-0 flex items-center justify-center shadow-lg border-2 border-white/50">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={`${collegeName} Logo`}
                  fill
                  unoptimized
                  className="object-contain p-1"
                />
              ) : (
                <span className="text-[#FF3C3C] font-black text-2xl">
                  {collegeName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">
              {collegeName}
            </h1>
          </div>

          {/* Action Link with Red Glow Outline */}
          <div className="ml-2 group">
            <button
              type="button"
              className="px-8 py-3 rounded-md border-2 border-[#FF3C3C] text-white font-bold text-lg flex items-center gap-3 transition-all duration-300 hover:bg-[#FF3C3C] hover:shadow-[0_0_20px_rgba(255,60,60,0.5)] focus:outline-none"
            >
              Take a look
              <span className="material-symbols-rounded text-2xl transition-transform group-hover:translate-x-1.5">
                arrow_right_alt
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
