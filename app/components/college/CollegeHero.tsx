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
    <div className="relative w-full overflow-hidden bg-neutral-900" style={{ height: 550 }}>
      <Image src={image} alt={college_name} fill priority sizes="100vw" className="object-cover" unoptimized />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      <div className="absolute bottom-12 left-0 px-6 md:px-16 lg:px-24 z-10 flex flex-col items-start gap-4">
        <div className="flex items-center gap-4 md:gap-6 bg-white/10 border border-white/20 backdrop-blur-md px-6 py-4 md:px-8 md:py-6 rounded-xl shadow-2xl max-w-2xl lg:max-w-5xl">
          <div className="flex-shrink-0 w-14 h-14 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
            <span className="text-2xl md:text-[40px] font-bold" style={{ color: "#FF3C3C" }}>{initial}</span>
          </div>
          <h1 className="text-[36px] md:text-[48px] font-bold leading-tight tracking-tight text-white">{college_name}</h1>
        </div>
        <Link href={`/college/${slug}`} className="mt-2 bg-transparent border border-white/40 text-white hover:bg-white/10 flex items-center justify-between gap-2 px-5 py-2.5 rounded-[5px] text-sm font-black transition-all w-fit ml-1 uppercase tracking-tight">
          Take a look
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
