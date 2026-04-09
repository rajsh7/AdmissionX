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
    <div className="relative w-full overflow-hidden bg-neutral-900" style={{ height: 400 }}>
      <Image src={image} alt={college_name} fill priority sizes="100vw" className="object-cover" unoptimized />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      <div className="absolute bottom-0 left-0 px-6 md:px-12 lg:px-16 pb-8 z-10 flex flex-col items-start gap-3">
        <div className="flex items-center gap-3 bg-[#FF3C3C] px-5 py-3.5 rounded-md shadow-xl max-w-xs md:max-w-sm">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow">
            <span className="text-base font-black" style={{ color: "#FF3C3C" }}>{initial}</span>
          </div>
          <h1 className="text-base md:text-lg font-black text-white leading-tight">{college_name}</h1>
        </div>
        <Link href={`/college/${slug}`} className="text-sm font-semibold text-white/80 hover:text-white flex items-center gap-1.5 ml-1 transition-colors">
          Take a look
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
