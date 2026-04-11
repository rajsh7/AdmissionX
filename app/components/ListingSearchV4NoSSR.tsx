"use client";

import dynamic from "next/dynamic";
import type { CourseResult } from "@/app/api/search/courses/route";

interface FilterOption {
  id: string | number;
  name: string;
  slug?: string;
  count?: number;
}

interface ListingSearchV4Props {
  initialCourses: CourseResult[];
  initialTotal: number;
  initialTotalPages: number;
  levels: FilterOption[];
  streams: FilterOption[];
  initQ: string;
  initLevel: string;
  initDegree: string;
  initStream: string;
  initPage: number;
  heroImage?: string;
  heroRightImage?: string;
  heroHeight?: string;
  heroObjectPosition?: string;
  heroFit?: "cover" | "contain";
}

const ListingSearchV4 = dynamic(() => import("./ListingSearchV4"), {
  ssr: false,
});

export default function ListingSearchV4NoSSR(props: ListingSearchV4Props) {
  return <ListingSearchV4 {...props} />;
}





