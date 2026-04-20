"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Clarity from "@microsoft/clarity";

const PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? "";

export default function ClarityInit({
  user,
}: {
  user?: { id: string; name: string; role: string } | null;
}) {
  // Initialize once
  useEffect(() => {
    if (!PROJECT_ID) return;
    Clarity.init(PROJECT_ID);
  }, []);

  // Identify logged-in user whenever user changes
  useEffect(() => {
    if (!PROJECT_ID) return;
    if (user?.id) {
      // Identify: customId, sessionId, pageId, friendlyName
      Clarity.identify(user.id, undefined, undefined, user.name);
      // Tag the role so you can filter recordings by student/college
      Clarity.setTag("role", user.role);
      Clarity.setTag("userId", user.id);
    }
  }, [user?.id]);

  return null;
}
