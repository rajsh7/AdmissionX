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
  logo?: string;
}

export default function CollegeHero({ college }: { college: CollegeHeroData }) {
  const { slug, college_name, image, logo } = college;
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
            className="object-cover transition-opacity duration-500 w-full"
            unoptimized
          />
          {/* Cover Overlay - Lightened for absolute clarity */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 z-10 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
      )}

      <div className="absolute bottom-32 left-0 w-full z-20">
        <div className="mx-auto max-w-[1920px] px-4 md:px-10 lg:px-12 flex flex-col items-start gap-4">
          <div className="flex items-center gap-4 md:gap-5 backdrop-blur-md px-5 py-2 md:px-7 md:py-2.5 rounded-[5px] shadow-2xl w-fit max-w-full" style={{ backgroundColor: "rgba(212, 12, 17, 0.35)" }}>
            <div className="flex-shrink-0 w-10 h-10 md:w-14 md:h-14 rounded-[5px] bg-white flex items-center justify-center shadow-lg overflow-hidden">
              {logo && logo !== "" && !logo.includes("unsplash.com") ? (
                <Image src={logo} alt={college_name} width={56} height={56} className="w-full h-full object-cover" unoptimized />
              ) : (
                <span className="text-xl md:text-[32px] font-bold" style={{ color: "#FF3C3C" }}>{initial}</span>
              )}
            </div>
            <h1 className="text-[24px] md:text-[36px] font-bold leading-none tracking-tight text-white mb-0">{college_name}</h1>
          </div>

          <Link href={`/college/${slug}`} className="mt-2 flex items-center justify-between gap-4 px-10 py-2 rounded-[5px] text-[24px] font-bold transition-all w-fit ml-1 tracking-wider shadow-xl shadow-black/20 hover:bg-red-600/10 hover:scale-105 active:scale-95" style={{ backgroundColor: "rgba(154, 160, 180, 0.29)", color: "white" }}>
            Take a look
            <svg className="w-10 h-7 ml-1" fill="none" stroke="currentColor" viewBox="0 0 60 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M56 8l4 4m0 0l-4 4m4-4H0" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
