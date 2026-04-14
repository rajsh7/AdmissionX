import Link from "next/link";
import Image from "next/image";

export interface CollegeHeroData {
  id: unknown;
  slug: string;
  college_name: string;
  image: string;
  description: string | null;
  estyear: string | null;
  website: string | null;
  collegecode: string | null;
  contactpersonname: string | null;
  contactpersonemail: string | null;
  contactpersonnumber: string | null;
  rating: number;
  totalRatingUser: number;
  verified: number;
  registeredSortAddress: string | null;
  registeredFullAddress: string | null;
  campusSortAddress: string | null;
  campusFullAddress: string | null;
  mediumOfInstruction: string | null;
  studyForm: string | null;
  admissionStart: string | null;
  admissionEnd: string | null;
  totalStudent: string | null;
  universityType: string | null;
  ranking: string | null;
  isTopUniversity: number;
  topUniversityRank: string | null;
  facebookurl: string | null;
  twitterurl: string | null;
  CCTVSurveillance: number;
  ACCampus: number;
  city_name: string | null;
  college_type_name: string | null;
}

export default function CollegeHero({ college }: { college: CollegeHeroData }) {
  const { slug, college_name, image } = college;
  const initial = college_name.trim().charAt(0).toUpperCase();

  return (
    <div className="relative w-full overflow-hidden bg-[#1e293b] flex items-center justify-center" style={{ height: 700 }}>
      {/* Background Image Layer */}
      {image && (
        <div className="absolute inset-0 z-0 h-full w-full">
          <Image 
            src={image} 
            alt={college_name} 
            fill 
            priority 
            className="object-cover transition-opacity duration-500 z-10 w-full" 
            unoptimized 
          />
        </div>
      )}
      
      
      <div className="absolute bottom-12 left-0 w-full z-10">
        <div className="mx-auto max-w-[1920px] px-4 md:px-10 lg:px-12 flex flex-col items-start gap-4">
          <div className="flex items-center gap-4 md:gap-6 border border-white/20 backdrop-blur-md px-6 py-2 md:px-8 md:py-3 rounded-[5px] shadow-2xl w-fit max-w-full" style={{ backgroundColor: "rgba(212, 12, 17, 0.35)" }}>
          <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
            <span className="text-2xl md:text-[40px] font-bold" style={{ color: "#FF3C3C" }}>{initial}</span>
          </div>
          <h1 className="text-[32px] md:text-[48px] font-bold leading-none tracking-tight text-white mb-0">{college_name}</h1>
        </div>
        
        <Link href={`/college/${slug}`} className="mt-2 flex items-center justify-between gap-4 px-10 py-2 rounded-[5px] text-[24px] font-bold transition-all w-fit ml-1 tracking-wider shadow-xl shadow-black/20 hover:bg-red-600/10 hover:scale-105 active:scale-95 border-2" style={{ backgroundColor: "transparent", borderColor: "rgba(212, 12, 17, 0.6)", color: "white" }}>
          Take a look
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  </div>
  );
}
