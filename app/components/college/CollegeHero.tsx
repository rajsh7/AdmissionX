import Link from "next/link";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Main component ───────────────────────────────────────────────────────────

export default function CollegeHero({ college }: { college: CollegeHeroData }) {
  const { slug, college_name, image } = college;

  const initial = college_name.trim().charAt(0).toUpperCase();

  return (
    <div className="relative w-full h-[380px] overflow-hidden bg-neutral-900">
      {/* Banner image */}
      <Image
        src={image}
        alt={college_name}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Dark gradient overlay — transparent at top, black/80 at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Bottom-left overlay content */}
      <div className="absolute bottom-0 left-0 px-8 pb-8 flex items-end gap-5 z-10">
        {/* Logo box — white rounded square with teal initial */}
        <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-white flex items-center justify-center shadow-lg">
          <span className="text-2xl font-black" style={{ color: "#FF3C3C" }}>
            {initial}
          </span>
        </div>

        {/* College name + link */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-md">
            {college_name}
          </h1>
          <Link
            href={`/college/${slug}`}
            className="text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ color: "#FF3C3C" }}
          >
            Take a look →
          </Link>
        </div>
      </div>
    </div>
  );
}




