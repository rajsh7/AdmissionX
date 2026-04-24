"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem("adx_sid");
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("adx_sid", sid);
  }
  return sid;
}

export default function TrackPageView() {
  const pathname = usePathname();
  const lastPath = useRef<string>("");

  useEffect(() => {
    // Skip admin pages
    if (pathname.startsWith("/admin")) return;
    // Skip duplicate fires on same path
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    const sessionId = getSessionId();

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path:      pathname,
        referrer:  document.referrer || null,
        sessionId,
      }),
      // Use keepalive so it completes even if user navigates away
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
