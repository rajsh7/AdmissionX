"use client";

type EventName =
  | "college_view"
  | "college_apply_click"
  | "search_performed"
  | "signup_start"
  | "signup_complete"
  | "login"
  | "application_submit"
  | "bookmark_add"
  | "counselling_form"
  | "contact_us";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem("adx_sid");
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("adx_sid", sid);
  }
  return sid;
}

export function track(event: EventName, properties?: Record<string, unknown>) {
  try {
    fetch("/api/track/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, properties, sessionId: getSessionId() }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

// React hook version
export function useTrack() {
  return track;
}
