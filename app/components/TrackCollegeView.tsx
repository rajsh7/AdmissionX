"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

export default function TrackCollegeView({ slug, name }: { slug: string; name: string }) {
  useEffect(() => {
    track("college_view", { slug, name });
  }, [slug, name]);
  return null;
}
