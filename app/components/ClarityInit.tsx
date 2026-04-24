"use client";

import { useEffect } from "react";

const PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? "";

export default function ClarityInit({
  user,
}: {
  user?: { id: string; name: string; role: string } | null;
}) {
  useEffect(() => {
    if (!PROJECT_ID) return;

    // Inject Clarity script if not already present
    if (!(window as any).clarity) {
      (function (c: any, l: any, a: any, r: any, i: any, t?: any, y?: any) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
        y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
      })(window, document, "clarity", "script", PROJECT_ID);
    }
  }, []);

  useEffect(() => {
    if (!PROJECT_ID || !(window as any).clarity) return;
    if (user?.id) {
      (window as any).clarity("identify", user.id, undefined, undefined, user.name);
      (window as any).clarity("set", "role", user.role);
      (window as any).clarity("set", "userId", user.id);
    }
  }, [user?.id]);

  return null;
}
