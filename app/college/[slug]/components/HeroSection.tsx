import Image from "next/image";

interface HeroSectionProps {
  coverImage: string;
  collegeName: string;
  logoUrl?: string | null;
}

export default function HeroSection({ coverImage, collegeName, logoUrl }: HeroSectionProps) {
  return (
    <div className="relative w-full h-[350px] sm:h-[450px]">
      <Image 
        src={coverImage} 
        alt={`${collegeName} Campus`} 
        fill 
        unoptimized
        className="object-cover" 
        priority
      />
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/10" />
      
      {/* Content over image */}
      <div className="absolute z-10 bottom-12 left-4 sm:left-12 max-w-2xl text-white">
        <div 
          className="inline-flex items-center gap-4 px-5 sm:px-6 py-3 sm:py-4 rounded-lg shadow-xl shadow-black/20"
          style={{ backgroundColor: "#064e3b" }} /* Dark green/teal background matching design */
        >
          {/* Logo Box */}
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-white rounded overflow-hidden p-1 flex-shrink-0 flex items-center justify-center">
            {logoUrl && logoUrl !== "" ? (
              <Image 
                src={logoUrl} 
                alt={`${collegeName} Logo`} 
                fill 
                unoptimized
                className="object-contain p-1" 
              />
            ) : (
              <span className="text-teal-900 font-extrabold text-xl sm:text-2xl">
                {collegeName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            {collegeName}
          </h1>
        </div>
        
        {/* Take a look link */}
        <div className="mt-6 ml-6 flex items-center gap-4">
          <button 
            type="button" 
            className="text-sm font-bold hover:text-gray-200 transition focus:outline-none flex items-center gap-2"
          >
            Take a look <span className="text-lg">⟶</span>
          </button>
        </div>
      </div>
    </div>
  );
}
