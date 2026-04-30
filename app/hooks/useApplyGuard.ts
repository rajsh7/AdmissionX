"use client";

import { useState, useCallback, useRef } from "react";

// Module-level cache so all instances share the same auth result
let cachedRole: string | null | undefined = undefined;
let cacheTime = 0;
const CACHE_TTL = 30_000; // 30s

export function useApplyGuard() {
  const [modalSlug, setModalSlug] = useState<string | null>(null);
  const pendingSlug = useRef<string | null>(null);

  const handleApply = useCallback(async (slug: string) => {
    // Use cached result if fresh
    const now = Date.now();
    if (cachedRole !== undefined && now - cacheTime < CACHE_TTL) {
      if (cachedRole === "student") {
        window.location.href = `/apply/${slug}`;
      } else {
        setModalSlug(slug);
      }
      return;
    }

    pendingSlug.current = slug;
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      cachedRole = data?.user?.role ?? null;
      cacheTime = Date.now();
      if (cachedRole === "student") {
        window.location.href = `/apply/${slug}`;
      } else {
        setModalSlug(pendingSlug.current);
      }
    } catch {
      cachedRole = null;
      cacheTime = Date.now();
      setModalSlug(pendingSlug.current);
    }
  }, []);

  const closeModal = useCallback(() => {
    setModalSlug(null);
    // Invalidate cache so next open re-checks (user may have just logged in)
    cachedRole = undefined;
  }, []);

  return { handleApply, modalSlug, closeModal };
}
