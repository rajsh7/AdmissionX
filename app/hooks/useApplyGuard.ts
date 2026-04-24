"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export function useApplyGuard() {
  const router = useRouter();
  const [modalSlug, setModalSlug] = useState<string | null>(null);

  const handleApply = useCallback(async (slug: string) => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data?.user?.role === "student") {
        router.push(`/apply/${slug}`);
      } else {
        setModalSlug(slug);
      }
    } catch {
      setModalSlug(slug);
    }
  }, [router]);

  const closeModal = useCallback(() => setModalSlug(null), []);

  return { handleApply, modalSlug, closeModal };
}
