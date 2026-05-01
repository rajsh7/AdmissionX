"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ApplyAuthModal from "@/app/components/ApplyAuthModal";

export default function AutoApplyTrigger({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get("apply") === "1") {
      setShow(true);
      // Clean the URL without reload
      const url = new URL(window.location.href);
      url.searchParams.delete("apply");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  if (!show) return null;
  return (
    <ApplyAuthModal
      redirectTo={`/apply/${slug}`}
      onClose={() => setShow(false)}
    />
  );
}
